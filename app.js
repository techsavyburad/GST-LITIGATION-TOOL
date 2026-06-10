// ============================================================
// GST LITIGATION PRO â€” app.js (Part 1: Core + Modules 1-4)
// ============================================================

// â”€â”€â”€ DATABASE (localStorage cache + Excel backend via REST API) â”€â”€
const API_BASE = (window.location.origin && window.location.origin !== 'null')
  ? window.location.origin
  : 'http://localhost:3000';

function apiUrl(path) {
  return API_BASE + path;
}

const Auth = {
  tokenKey: 'gstpro_auth_token',
  userKey: 'gstpro_current_user',
  currentUser: null,
  getToken() { return localStorage.getItem(this.tokenKey) || ''; },
  setSession(token, user) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user || {}));
    this.currentUser = user || null;
  },
  clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser = null;
  },
  getStoredUser() {
    try { return JSON.parse(localStorage.getItem(this.userKey)) || null; }
    catch (e) { return null; }
  },
  authHeaders(extra) {
    const token = this.getToken();
    return Object.assign(token ? { Authorization: 'Bearer ' + token } : {}, extra || {});
  },
  async request(url, options) {
    const opts = Object.assign({}, options || {});
    opts.headers = this.authHeaders(opts.headers || {});
    const resp = await fetch(url, opts);
    if (resp.status === 401) {
      this.clearSession();
      this.showLogin('Please sign in to continue.');
    } else if (resp.status === 403) {
      const err = await resp.clone().json().catch(() => ({}));
      const message = err.error || 'You do not have permission for this action.';
      if (/inactive|expired|invalid login/i.test(message)) {
        this.clearSession();
        this.showLogin('Your access is inactive or expired.');
      } else {
        toast(message, 'warning', 3500);
      }
    }
    return resp;
  },
  can(permission) {
    const user = this.currentUser || this.getStoredUser() || {};
    const level = (user.accessLevel || '').toLowerCase();
    const role = String(user.role || '').toLowerCase().replace(/[^a-z]/g, '');
    const fullAccess = level === 'admin' || role === 'admin' || role === 'partner';
    if (fullAccess) return true;
    if (permission === 'assign-cases') return role === 'manager' || role === 'assistantmanager' || role === 'assisstantmanager';
    if (permission === 'view-all-cases') return false;
    if (permission === 'manage-clients') return false;
    if (permission === 'manage-employees') return false;
    return true;
  },
  async init() {
    this.currentUser = this.getStoredUser();
    if (!this.getToken()) { this.showLogin(); return false; }
    try {
      const resp = await this.request(apiUrl('/api/auth/me'));
      if (!resp.ok) return false;
      const data = await resp.json();
      this.currentUser = data.user;
      localStorage.setItem(this.userKey, JSON.stringify(data.user));
      this.hideLogin();
      return true;
    } catch (err) {
      this.showLogin('Backend unavailable. Start the server and sign in again.');
      return false;
    }
  },
  showLogin(message) {
    document.body.classList.add('auth-locked');
    let el = document.getElementById('login-screen');
    if (!el) {
      el = document.createElement('div');
      el.id = 'login-screen';
      el.className = 'login-screen';
      el.innerHTML = `
        <form class="login-card" id="login-form">
          <div class="login-mark"><i class="fas fa-scale-balanced"></i></div>
          <h1>GST Litigation Login</h1>
          <p id="login-help">Sign in with your employee credentials.</p>
          <div class="form-group"><label class="form-label">Username or Email</label><input class="form-input" id="login-username" autocomplete="username" required></div>
          <div class="form-group"><label class="form-label">Password</label><input class="form-input" id="login-password" type="password" autocomplete="current-password" required></div>
          <button class="btn btn-primary" style="width:100%" type="submit"><i class="fas fa-right-to-bracket"></i> Sign In</button>
          <div class="login-bootstrap">First setup: <b>admin</b> / <b>admin123</b></div>
        </form>`;
      document.body.appendChild(el);
      document.getElementById('login-form').addEventListener('submit', e => { e.preventDefault(); this.login(); });
    }
    const help = document.getElementById('login-help');
    if (help) help.textContent = message || 'Sign in with your employee credentials.';
    setTimeout(() => {
      const input = document.getElementById('login-username');
      if (input) input.focus();
    }, 0);
  },
  hideLogin() {
    document.body.classList.remove('auth-locked');
    const el = document.getElementById('login-screen');
    if (el) el.remove();
  },
  async login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const help = document.getElementById('login-help');
    const form = document.getElementById('login-form');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    if (!username || !password) {
      if (help) help.textContent = 'Enter username and password.';
      return;
    }
    if (help) help.textContent = 'Signing in...';
    if (submitBtn) submitBtn.disabled = true;
    try {
      const resp = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) { if (help) help.textContent = data.error || 'Invalid login'; return; }
      this.setSession(data.token, data.user);
      this.hideLogin();
      App.initAfterAuth();
      if (data.bootstrap) toast('Create employee logins, then replace the setup password.', 'warning', 5000);
    } catch (err) {
      if (help) help.textContent = 'Could not reach the backend server.';
    } finally {
      if (submitBtn && document.getElementById('login-screen')) submitBtn.disabled = false;
    }
  },
  logout() {
    this.clearSession();
    location.reload();
  }
};

const DB = {
  _syncTimer: null,
  _retryTimer: null,
  _periodicTimer: null,
  _dataChangeTimer: null,
  _changedKeys: new Set(),
  _changeSource: 'data',
  _isFlushing: false,
  _flushRetryQueued: false,
  _pendingSync: {},       // keys that have unsaved changes
  _pendingPayloads: {},
  _serverAvailable: true, // false if server unreachable (fallback to localStorage only)
  _syncInfo: {
    state: 'syncing',
    text: 'Checking backend',
    detail: 'Probing Excel backend availability',
    lastSyncAt: null
  },

  _setSyncStatus(state, text, detail) {
    this._syncInfo = {
      state,
      text,
      detail: detail || '',
      lastSyncAt: state === 'online' ? new Date().toISOString() : this._syncInfo.lastSyncAt
    };
    if (typeof App !== 'undefined' && App && typeof App.updateSyncChip === 'function') {
      App.updateSyncChip();
    }
  },

  getSyncInfo() {
    return this._syncInfo;
  },

  _emitDataChange(keys, source) {
    if (typeof window === 'undefined' || !window.dispatchEvent) return;
    const keyList = Array.isArray(keys) ? keys : [keys];
    keyList.filter(Boolean).forEach(key => this._changedKeys.add(key));
    if (source) this._changeSource = source;
    if (this._dataChangeTimer || this._changedKeys.size === 0) return;
    this._dataChangeTimer = setTimeout(() => {
      const changedKeys = Array.from(this._changedKeys);
      const changeSource = this._changeSource || 'data';
      this._changedKeys.clear();
      this._changeSource = 'data';
      this._dataChangeTimer = null;
      window.dispatchEvent(new CustomEvent('gstpro:datachange', {
        detail: { keys: changedKeys, source: changeSource, at: new Date().toISOString() }
      }));
    }, 0);
  },

  _applySnapshot(snapshot, source) {
    const changedKeys = [];
    if (Array.isArray(snapshot.cases) && this._writeLocal('cases', snapshot.cases)) changedKeys.push('cases');
    if (Array.isArray(snapshot.clients) && this._writeLocal('clients', snapshot.clients)) changedKeys.push('clients');
    if (Array.isArray(snapshot.employees) && this._writeLocal('employees', snapshot.employees)) changedKeys.push('employees');
    if (snapshot.settings && typeof snapshot.settings === 'object' && this._writeLocal('settings', snapshot.settings)) changedKeys.push('settings');
    if (changedKeys.length) this._emitDataChange(changedKeys, source || 'server-refresh');
    return changedKeys;
  },

  // â”€â”€ Synchronous read from localStorage (fast, used by all UI code) â”€â”€
  get(key) {
    try { return JSON.parse(localStorage.getItem('gstpro_' + key)) || null; }
    catch (e) { return null; }
  },

  _prepareValue(key, val) {
    if (key === 'cases') return normalizeCaseCollection(val);
    if (key === 'employees' && Array.isArray(val)) {
      return val.map(emp => {
        const copy = { ...emp };
        delete copy.password;
        delete copy.passwordHash;
        return copy;
      });
    }
    return val;
  },

  _writeLocal(key, val) {
    const storageKey = 'gstpro_' + key;
    const nextValue = JSON.stringify(this._prepareValue(key, val));
    const changed = localStorage.getItem(storageKey) !== nextValue;
    localStorage.setItem(storageKey, nextValue);
    return changed;
  },

  // â”€â”€ Write to localStorage AND queue sync to Excel backend â”€â”€
  set(key, val) {
    const changed = this._writeLocal(key, val);
    // Queue background sync to server
    if (['cases', 'clients', 'settings', 'employees'].includes(key)) {
      const payload = key === 'employees' && Array.isArray(val) && val.some(emp => emp.password)
        ? val.map(emp => ({ ...emp }))
        : this._prepareValue(key, val);
      this._queueSync(key, payload);
      this._debouncedSync();
    }
    if (changed) this._emitDataChange([key], 'local-write');
  },

  _queueSync(key, payload) {
    this._pendingSync[key] = true;
    this._pendingPayloads[key] = payload;
  },

  getArr(key) {
    const data = this.get(key) || [];
    if (key === 'cases' && Array.isArray(data)) {
      return normalizeCaseCollection(data);
    }
    return data;
  },

  // â”€â”€ Debounced sync: waits 500ms after last write before posting to server â”€â”€
  _debouncedSync() {
    if (this._syncTimer) clearTimeout(this._syncTimer);
    this._syncTimer = setTimeout(() => this._flushToServer(), 500);
  },

  async flushNow() {
    if (this._syncTimer) {
      clearTimeout(this._syncTimer);
      this._syncTimer = null;
    }
    if (this._isFlushing) {
      await this._waitForFlushIdle();
      if (this._syncTimer) {
        clearTimeout(this._syncTimer);
        this._syncTimer = null;
      }
    }
    return this._flushToServer();
  },

  _waitForFlushIdle(timeoutMs = 10000) {
    const startedAt = Date.now();
    return new Promise(resolve => {
      const check = () => {
        if (!this._isFlushing) return resolve(true);
        if (Date.now() - startedAt >= timeoutMs) return resolve(false);
        setTimeout(check, 75);
      };
      check();
    });
  },

  _scheduleRetry() {
    if (this._retryTimer || !this.getTokenSafe()) return;
    this._retryTimer = setTimeout(() => {
      this._retryTimer = null;
      this._flushToServer();
    }, 5000);
  },

  getTokenSafe() {
    return typeof Auth !== 'undefined' && Auth && Auth.getToken ? Auth.getToken() : '';
  },

  // â”€â”€ Push pending changes to Excel via REST API â”€â”€
  async _flushToServer() {
    if (this._isFlushing) {
      this._flushRetryQueued = true;
      return false;
    }
    const keys = Object.keys(this._pendingSync);
    if (keys.length === 0) return true;
    this._isFlushing = true;
    this._flushRetryQueued = false;
    this._setSyncStatus('syncing', 'Syncing Excel', keys.join(', ') + ' queued');
    this._pendingSync = {};
    let allSaved = true;

    for (const key of keys) {
      const data = this._pendingPayloads[key] || this.get(key);
      delete this._pendingPayloads[key];
      try {
        const endpoint = apiUrl('/api/' + key);
        const resp = await Auth.request(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          console.warn('[DB] Sync failed for', key, ':', err.error || resp.statusText);
          allSaved = false;
          if (resp.status === 401 || resp.status === 403 || resp.status >= 500) {
            this._queueSync(key, data);
            if (resp.status >= 500) this._scheduleRetry();
          }
          this._serverAvailable = false;
          this._setSyncStatus('error', 'Sync issue', err.error || ('Could not save ' + key + ' to Excel'));
        } else {
          this._serverAvailable = true;
          this._setSyncStatus('online', 'Excel connected', 'Saved ' + key + ' to backend');
        }
      } catch (err) {
        console.warn('[DB] Server unreachable for', key, ':', err.message);
        allSaved = false;
        this._queueSync(key, data);
        this._serverAvailable = false;
        this._setSyncStatus('offline', 'Local cache only', 'Backend unavailable while saving ' + key);
        this._scheduleRetry();
      }
    }
    this._isFlushing = false;
    if (this._flushRetryQueued || Object.keys(this._pendingSync).length > 0) {
      this._flushRetryQueued = false;
      this._debouncedSync();
    }
    return allSaved && Object.keys(this._pendingSync).length === 0;
  },

  // â”€â”€ Load data from Excel backend into localStorage â”€â”€
  async _loadFromServer(source = 'server-refresh') {
    try {
      if (Object.keys(this._pendingSync).length > 0 || this._isFlushing) {
        this._setSyncStatus('syncing', 'Local changes pending', 'Saving local changes before refreshing backend data');
        await this.flushNow();
        if (Object.keys(this._pendingSync).length > 0) return false;
      }
      this._setSyncStatus('syncing', 'Loading backend', 'Refreshing local cache from Excel');
      const resp = await Auth.request(apiUrl('/api/sync'));
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Backend refresh failed');
      }
      const snapshot = await resp.json();
      this._applySnapshot(snapshot, source);

      this._serverAvailable = true;
      this._setSyncStatus('online', 'Excel connected', 'Local cache refreshed from backend');
      return true;
    } catch (err) {
      console.warn('[DB] Server not available, using localStorage only:', err.message);
      this._serverAvailable = false;
      this._setSyncStatus('offline', 'Local cache only', 'Excel backend unreachable');
      return false;
    }
  },

  // â”€â”€ Push sample data to Excel if it is empty â”€â”€
  async _initServerData() {
    try {
      const resp = await Auth.request(apiUrl('/api/init'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cases: GST_DATA.sampleCases || [],
          clients: GST_DATA.sampleClients || [],
          settings: { userName: 'GST Practitioner', firmName: 'My Tax Firm', initials: 'GP', initialized: 'true' }
        })
      });
      if (resp.ok) {
        const result = await resp.json();
        if (result.casesWritten || result.clientsWritten) {
          console.log('[DB] Sample data imported to Excel');
          this._setSyncStatus('online', 'Excel seeded', 'Initial sample data saved to backend');
        }
      }
    } catch (err) {
      console.warn('[DB] Could not init server data:', err.message);
      this._setSyncStatus('offline', 'Local cache only', 'Could not initialize Excel backend');
    }
  },

  // â”€â”€ Periodic sync: pull fresh data from Excel (for direct Excel edits) â”€â”€
  startPeriodicSync(intervalMs) {
    if (!intervalMs) intervalMs = 30000;
    if (this._periodicTimer) clearInterval(this._periodicTimer);
    this._periodicTimer = setInterval(async () => {
      if (Object.keys(this._pendingSync).length > 0 || this._isFlushing) return;
      try {
        this._setSyncStatus('syncing', 'Refreshing data', 'Checking for Excel-side updates');
        const resp = await Auth.request(apiUrl('/api/sync'));
        if (!resp.ok) throw new Error('Background refresh failed');
        const snapshot = await resp.json();
        this._applySnapshot(snapshot, 'background-refresh');
        this._serverAvailable = true;
        this._setSyncStatus('online', 'Excel connected', 'Background refresh complete');
      } catch (e) {
        this._serverAvailable = false;
        this._setSyncStatus('offline', 'Local cache only', 'Background refresh failed');
      }
    }, intervalMs);
  },

  // â”€â”€ Initialize: load from server first, then fallback to old localStorage init â”€â”€
  init() {
    // Synchronous fallback init (old behavior) â€” runs immediately for UI
    if (!this.get('initialized')) {
      this._writeLocal('cases', []);
      this._writeLocal('clients', []);
      this._writeLocal('employees', []);
      this._writeLocal('notices', GST_DATA.sampleNotices || []);
      this._writeLocal('documents', []);
      this._writeLocal('settings', { userName: 'GST Practitioner', firmName: 'My Tax Firm', initials: 'GP' });
      localStorage.setItem('gstpro_initialized', JSON.stringify(true));
    }

    // Async: load from Excel server (overrides localStorage if data exists in Excel)
    this._loadFromServer('startup-refresh').then(loaded => {
      if (loaded) {
        const refreshLoadedData = () => {
          this._loadFromServer('startup-refresh').then(() => {
            if (App && App.currentModule && App.modules[App.currentModule] && App.canAutoRefreshCurrentView && App.canAutoRefreshCurrentView()) {
              App.navigate(App.currentModule);
            }
            if (App.updateBadges) App.updateBadges();
            if (App.applySettings) App.applySettings();
          });
        };
        if (Auth.can('manage-employees')) {
          this._initServerData().then(refreshLoadedData);
        } else {
          refreshLoadedData();
        }
        this.startPeriodicSync();
      }
    });
  }
};

// â”€â”€â”€ FILE DATABASE (IndexedDB â€” per-case document storage) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


// â”€â”€â”€ TOAST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function toast(msg, type = 'info', dur = 3500) {
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas ${icons[type]}"></i><span>${msg}</span>`;
  el.onclick = () => el.remove();
  const holder = document.getElementById('toast-container') || document.body;
  holder.appendChild(el);
  setTimeout(() => el.remove(), dur);
}

function escapeHTML(value) {
  return String(value || '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

function jurisdictionDisplay(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (lower === 'center' || lower === 'central' || lower.includes('cgst') || lower.includes('central gst')) return 'Central GST';
  if (lower === 'state' || lower.includes('sgst') || lower.includes('state gst')) return 'State GST';
  return raw;
}

function jurisdictionSelectValue(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (lower === 'center' || lower === 'central' || lower.includes('cgst') || lower.includes('central gst')) return 'center';
  if (lower === 'state' || lower.includes('sgst') || lower.includes('state gst')) return 'state';
  return raw;
}

function renderJurisdictionSelect(prefix, value = '') {
  const raw = String(value || '').trim();
  const selected = jurisdictionSelectValue(raw);
  const customOption = selected !== 'center' && selected !== 'state' && raw
    ? `<option value="${escapeHTML(raw)}" selected>${escapeHTML(raw)}</option>`
    : '';
  return `<div class="form-group"><label class="form-label">Jurisdictional Authority</label>
    <select id="${prefix}-jurisdiction" class="form-select">
      <option value="" ${!raw ? 'selected' : ''}>Select jurisdiction...</option>
      ${customOption}
      <option value="center" ${selected === 'center' ? 'selected' : ''}>Central GST</option>
      <option value="state" ${selected === 'state' ? 'selected' : ''}>State GST</option>
    </select></div>`;
}

function getJurisdictionValue(prefix) {
  const el = document.getElementById(`${prefix}-jurisdiction`);
  return el ? el.value : '';
}

function fieldValue(id, fallback = '') {
  const el = document.getElementById(id);
  return el ? el.value : fallback;
}

function trimmedFieldValue(id, fallback = '') {
  return fieldValue(id, fallback).trim();
}

function numberFieldValue(id, fallback = 0) {
  const value = Number(fieldValue(id, fallback));
  return Number.isFinite(value) ? value : fallback;
}

function showAppError(context, err) {
  console.error('[App]', context, err);
  toast(context + (err && err.message ? ': ' + err.message : ''), 'error', 5000);
}

const CASE_STAGE_GROUPS = [
  {
    id: 'adjudication',
    label: 'Adjudication Stage',
    color: 'orange',
    stages: [
      { id: 'new-lead', label: 'New Lead', shortLabel: 'Lead', subLabel: 'Pre-SCN' },
      { id: 'scn-received', label: 'SCN Received', shortLabel: 'SCN', subLabel: 'DRC-01' },
      { id: 'reply-filed', label: 'Reply Filed', shortLabel: 'Reply', subLabel: 'DRC-06' },
      { id: 'ph-pending', label: 'Personal Hearing', shortLabel: 'Hearing', subLabel: 'Sec 75(4)' },
      { id: 'oio-received', label: 'OIO Received', shortLabel: 'OIO', subLabel: 'DRC-07' }
    ]
  },
  {
    id: 'first-appeal',
    label: 'First Appeal Stage',
    color: 'purple',
    stages: [
      { id: 'appeal-filed', label: 'Appeal Filed', shortLabel: 'Appeal', subLabel: 'APL-01' },
      { id: 'appeal-ph', label: 'Appeal Hearing', shortLabel: 'Appeal PH', subLabel: 'Sec 107' },
      { id: 'oia-received', label: 'OIA Received', shortLabel: 'OIA', subLabel: 'Order-in-Appeal' }
    ]
  },
  {
    id: 'second-appeal',
    label: 'Second Appeal Stage',
    color: 'blue',
    stages: [
      { id: 'gstat-appeal-filed', label: 'GSTAT Appeal', shortLabel: 'GSTAT', subLabel: 'APL-05' },
      { id: 'gstat-ph', label: 'GSTAT Hearing', shortLabel: 'GSTAT PH', subLabel: 'Sec 112' },
      { id: 'tribunal-order', label: 'Tribunal Order', shortLabel: 'Tribunal', subLabel: 'Final fact finding' }
    ]
  },
  {
    id: 'judicial-review',
    label: 'Judicial Review',
    color: 'red',
    stages: [
      { id: 'hc-petition-filed', label: 'High Court', shortLabel: 'HC', subLabel: 'Sec 117' },
      { id: 'sc-petition-filed', label: 'Supreme Court', shortLabel: 'SC', subLabel: 'Sec 118 / SLP' },
      { id: 'writ-filed', label: 'Writ Filed', shortLabel: 'Writ', subLabel: 'Constitutional remedy' }
    ]
  },
  {
    id: 'completed',
    label: 'Completed',
    color: 'green',
    stages: [
      { id: 'payment-made', label: 'Payment Made', shortLabel: 'Paid', subLabel: 'DRC-03 / closure step' },
      { id: 'closed', label: 'Closed', shortLabel: 'Closed', subLabel: 'Resolved' },
      { id: 'dropped', label: 'Dropped', shortLabel: 'Dropped', subLabel: 'Abandoned' }
    ]
  }
];

const CASE_STAGE_META = CASE_STAGE_GROUPS.reduce((acc, group) => {
  group.stages.forEach((stage, index) => {
    acc[stage.id] = { ...stage, groupId: group.id, groupLabel: group.label, color: group.color, order: index };
  });
  return acc;
}, {});

function getCaseStageMeta(status) {
  return CASE_STAGE_META[status || 'new-lead'] || {
    id: status || 'new-lead',
    label: status || 'New Lead',
    shortLabel: status || 'Lead',
    subLabel: '',
    groupId: 'adjudication',
    groupLabel: 'Adjudication Stage',
    color: 'gray',
    order: 0
  };
}

function getCaseStageBadgeColor(status) {
  const map = {
    gray: 'gray',
    orange: 'orange',
    blue: 'blue',
    purple: 'purple',
    red: 'red',
    green: 'green'
  };
  return map[getCaseStageMeta(status).color] || 'gray';
}

function normalizeCaseRecord(caseRecord) {
  if (!caseRecord || typeof caseRecord !== 'object') return caseRecord;

  caseRecord.taxpayerName = caseRecord.taxpayerName || caseRecord.legalName || caseRecord.tradeName || '';
  caseRecord.legalName = caseRecord.legalName || caseRecord.taxpayerName || caseRecord.tradeName || '';
  caseRecord.tradeName = caseRecord.tradeName || '';
  caseRecord.status = caseRecord.status || 'new-lead';
  caseRecord.priority = caseRecord.priority || 'medium';
  caseRecord.caseNo = caseRecord.caseNo || caseRecord.reference || caseRecord.id || '';

  caseRecord.demandAmount = Number(caseRecord.demandAmount) || 0;
  caseRecord.penaltyAmount = Number(caseRecord.penaltyAmount) || 0;
  caseRecord.interestAmount = Number(caseRecord.interestAmount) || 0;
  caseRecord.otherAmount = Number(caseRecord.otherAmount) || 0;
  caseRecord.amountCollected = Number(caseRecord.amountCollected) || 0;
  caseRecord.totalAmount = Number(caseRecord.totalAmount) || (caseRecord.demandAmount + caseRecord.penaltyAmount + caseRecord.interestAmount + caseRecord.otherAmount);

  caseRecord.createdAt = caseRecord.createdAt || caseRecord.updatedAt || new Date().toISOString();
  caseRecord.updatedAt = caseRecord.updatedAt || caseRecord.createdAt;
  caseRecord.createdBy = caseRecord.createdBy || '';
  caseRecord.createdByName = caseRecord.createdByName || '';
  caseRecord.closureDate = caseRecord.closureDate || '';
  caseRecord.closureAuthority = caseRecord.closureAuthority || '';
  caseRecord.closureOutcome = caseRecord.closureOutcome || '';
  caseRecord.closureReason = caseRecord.closureReason || '';

  if (!Array.isArray(caseRecord.hearings)) caseRecord.hearings = [];
  if (!Array.isArray(caseRecord.updateNotes)) caseRecord.updateNotes = [];
  if (!Array.isArray(caseRecord.pendingList)) caseRecord.pendingList = [];
  if (!Array.isArray(caseRecord.payments)) caseRecord.payments = [];

  const latestLoggedHearingDate = caseRecord.hearings
    .map(h => h && h.date)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0] || '';
  const primaryHearingDate = caseRecord.adjPhDate || caseRecord.phDate || caseRecord.hearingDate || latestLoggedHearingDate || '';
  if (!caseRecord.adjPhDate && primaryHearingDate) caseRecord.adjPhDate = primaryHearingDate;
  if (!caseRecord.phDate && primaryHearingDate) caseRecord.phDate = primaryHearingDate;

  const primaryHearingRef = caseRecord.adjPhRef || caseRecord.phNoticeRef || '';
  if (!caseRecord.adjPhRef && primaryHearingRef) caseRecord.adjPhRef = primaryHearingRef;
  if (!caseRecord.phNoticeRef && primaryHearingRef) caseRecord.phNoticeRef = primaryHearingRef;

  const firstAppealDate = caseRecord.oiaDate || caseRecord.apl01Date || '';
  if (!caseRecord.oiaDate && firstAppealDate) caseRecord.oiaDate = firstAppealDate;
  if (!caseRecord.apl01Date && firstAppealDate) caseRecord.apl01Date = firstAppealDate;

  return caseRecord;
}

function normalizeCaseCollection(cases) {
  return Array.isArray(cases) ? cases.map(c => normalizeCaseRecord(c)) : [];
}

function resolveEmployeeName(idOrName) {
  if (!idOrName) return 'Unassigned';
  const employees = DB.getArr('employees');
  const emp = employees.find(e => e.id === idOrName || e.name === idOrName);
  if (emp) return emp.name;
  return idOrName; // Fallback for legacy text names
}

function readClosureFields(prefix) {
  return {
    closureDate: document.getElementById(prefix + 'closure-date') ? document.getElementById(prefix + 'closure-date').value : '',
    closureOutcome: document.getElementById(prefix + 'closure-outcome') ? document.getElementById(prefix + 'closure-outcome').value.trim() : '',
    closureAuthority: document.getElementById(prefix + 'closure-authority') ? document.getElementById(prefix + 'closure-authority').value.trim() : '',
    closureReason: document.getElementById(prefix + 'closure-reason') ? document.getElementById(prefix + 'closure-reason').value.trim() : ''
  };
}

function validateClosureForStatus(status, closureData) {
  if (!['closed', 'dropped'].includes(status)) return true;
  if (!closureData.closureDate || !closureData.closureOutcome || !closureData.closureReason) {
    toast('Closure date, outcome summary, and closure notes are required', 'error');
    return false;
  }
  return true;
}

function getCasePrimaryHearingDate(caseRecord) {
  const c = normalizeCaseRecord(caseRecord);
  if (c.hearings && c.hearings.length) {
    return c.hearings
      .map(h => h && h.date)
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0] || c.adjPhDate || '';
  }
  return c.adjPhDate || c.phDate || c.hearingDate || '';
}

function buildCaseTimelinePreview(caseRecord) {
  const c = normalizeCaseRecord(caseRecord);
  const primaryHearingDate = getCasePrimaryHearingDate(c);
  const items = [
    c.scnDate ? `<span><b style="color:var(--orange)">SCN:</b> ${fmtDate(c.scnDate)}</span>` : '',
    c.oioDate ? `<span><b style="color:var(--red)">OIO:</b> ${fmtDate(c.oioDate)}</span>` : '',
    primaryHearingDate ? `<span><b style="color:var(--blue)">PH:</b> ${fmtDate(primaryHearingDate)}</span>` : '',
    c.oiaDate ? `<span><b style="color:var(--purple)">1st App:</b> ${fmtDate(c.oiaDate)}</span>` : '',
    c.appealPhDate ? `<span><b style="color:#a855f7">PH(1st):</b> ${fmtDate(c.appealPhDate)}</span>` : '',
    c.gstatAppealDate ? `<span><b style="color:#6366f1">2nd App:</b> ${fmtDate(c.gstatAppealDate)}</span>` : '',
    c.gstatPhDate ? `<span><b style="color:#818cf8">PH(GSTAT):</b> ${fmtDate(c.gstatPhDate)}</span>` : ''
  ].filter(Boolean);

  return items.length ? items.join('') : '<em>No key dates recorded</em>';
}

function getCaseFilterStages(filter) {
  if (!filter || filter === 'all') return null;
  const group = CASE_STAGE_GROUPS.find(g => g.id === filter);
  return group ? group.stages.map(s => s.id) : [filter];
}

function getCaseExposure(caseRecord) {
  const c = normalizeCaseRecord({ ...(caseRecord || {}) });
  return Number(c.totalAmount) || (Number(c.demandAmount) || 0) + (Number(c.penaltyAmount) || 0) + (Number(c.interestAmount) || 0) + (Number(c.otherAmount) || 0);
}

function getCasePaidAmount(caseRecord) {
  const c = caseRecord || {};
  const ledgerTotal = Array.isArray(c.payments)
    ? c.payments.reduce((sum, payment) => sum + (Number(payment && payment.amt) || 0), 0)
    : 0;
  return Math.max(Number(c.amountCollected) || 0, ledgerTotal);
}

function hasCaseDocument(caseRecord, keywords) {
  const docs = Array.isArray(caseRecord && caseRecord.documents) ? caseRecord.documents : [];
  const terms = (Array.isArray(keywords) ? keywords : [keywords]).map(k => String(k || '').toLowerCase());
  return docs.some(doc => {
    if (!doc || doc.na) return false;
    const name = String(doc.name || '').toLowerCase();
    const available = !!(doc.soft || doc.physical || doc.received || doc.uploaded);
    return available && terms.some(term => name.includes(term));
  });
}

function getCaseDocumentGaps(caseRecord) {
  const c = normalizeCaseRecord({ ...(caseRecord || {}) });
  const stage = c.status || 'new-lead';
  const stageRequirements = [
    { when: () => ['scn-received', 'reply-filed', 'ph-pending', 'oio-received', 'appeal-filed', 'appeal-ph', 'oia-received', 'gstat-appeal-filed', 'gstat-ph', 'tribunal-order'].includes(stage), label: 'SCN / DRC-01 copy', keys: ['scn', 'drc-01'] },
    { when: () => ['reply-filed', 'ph-pending', 'oio-received', 'appeal-filed', 'appeal-ph', 'oia-received', 'gstat-appeal-filed', 'gstat-ph', 'tribunal-order'].includes(stage), label: 'Reply acknowledgement / DRC-06', keys: ['reply', 'drc-06', 'acknowledgement'] },
    { when: () => ['oio-received', 'appeal-filed', 'appeal-ph', 'oia-received', 'gstat-appeal-filed', 'gstat-ph', 'tribunal-order'].includes(stage), label: 'OIO / DRC-07 order', keys: ['oio', 'drc-07', 'order'] },
    { when: () => ['appeal-filed', 'appeal-ph', 'oia-received', 'gstat-appeal-filed', 'gstat-ph', 'tribunal-order'].includes(stage), label: 'APL-01 appeal set', keys: ['apl-01', 'appeal'] },
    { when: () => ['appeal-filed', 'appeal-ph', 'oia-received', 'gstat-appeal-filed', 'gstat-ph', 'tribunal-order'].includes(stage), label: 'Pre-deposit challan / DRC-03', keys: ['pre-deposit', 'challan', 'drc-03'] },
    { when: () => ['gstat-appeal-filed', 'gstat-ph', 'tribunal-order'].includes(stage), label: 'OIA and GSTAT appeal record', keys: ['oia', 'apl-05', 'gstat'] },
    { when: () => c.caseOrigin === 'eway-detention', label: 'E-way bill, invoice, detention order', keys: ['eway', 'invoice', 'detention', 'mov-'] },
    { when: () => c.caseOrigin === 'dept-audit', label: 'Audit memo / FAR / reconciliation', keys: ['audit', 'far', 'reconciliation'] },
    { when: () => c.caseOrigin === 'investigation', label: 'Summons, statement, RUD index', keys: ['summons', 'statement', 'rud'] }
  ];
  const gaps = stageRequirements
    .filter(req => req.when() && !hasCaseDocument(c, req.keys))
    .map(req => req.label);
  const pendingGaps = Array.isArray(c.pendingList)
    ? c.pendingList.filter(item => item && item.text && !item.received).map(item => item.text)
    : [];
  return [...gaps, ...pendingGaps].slice(0, 8);
}

function getCaseLimitationItems(caseRecord) {
  const c = normalizeCaseRecord({ ...(caseRecord || {}) });
  const items = [];
  const stage = c.status || 'new-lead';
  const addClock = (label, date, reference) => {
    if (!date) return;
    const days = daysFromNow(date);
    if (days === null) return;
    items.push({
      label,
      date,
      reference,
      days,
      tone: days < 0 ? 'danger' : days <= 7 ? 'danger' : days <= 30 ? 'warning' : 'info'
    });
  };

  addClock('Case due date', c.dueDate, c.assignmentTypeLabel || 'Internal filing clock');
  const oioCommunicationDate = c.oioCommDate || c.oioDate;
  const oiaCommunicationDate = c.oiaOrderCommDate || c.oiaCommDate || c.oiaDate;
  const gstatCommunicationDate = c.gstatOrderCommDate || c.gstatOrderDate;
  if (['oio-received'].includes(stage) && oioCommunicationDate) addClock('Sec 107 appeal deadline', addMonths(new Date(oioCommunicationDate), 3), '3 months from communication of OIO');
  if (['oia-received'].includes(stage) && oiaCommunicationDate) addClock('Sec 112 GSTAT appeal deadline', addMonths(new Date(oiaCommunicationDate), 3), '3 months from communication of OIA');
  if (['tribunal-order'].includes(stage) && gstatCommunicationDate) addClock('Sec 117 High Court appeal deadline', addDays(new Date(gstatCommunicationDate), 180), '180 days from GSTAT order');
  return items.sort((a, b) => a.days - b.days);
}

function getCasePreDepositProfile(caseRecord) {
  const c = normalizeCaseRecord({ ...(caseRecord || {}) });
  const stage = c.status || 'new-lead';
  const firstAppealStages = ['appeal-filed', 'appeal-ph', 'oia-received'];
  const gstatStages = ['gstat-appeal-filed', 'gstat-ph', 'tribunal-order'];
  const disputedTax = Number(c.demandAmount) || getCaseExposure(c);
  const requiredRate = gstatStages.includes(stage) ? 0.2 : firstAppealStages.includes(stage) ? 0.1 : 0;
  const required = Math.round(disputedTax * requiredRate);
  const paid = (Number(c.preDeposit) || 0) + (Number(c.gstatPreDeposit) || 0) + (Array.isArray(c.payments)
    ? c.payments
      .filter(p => /pre|deposit|drc|challan/i.test(String((p && p.type) || '') + ' ' + String((p && p.ref) || '')))
      .reduce((sum, payment) => sum + (Number(payment && payment.amt) || 0), 0)
    : 0);
  return {
    applicable: requiredRate > 0,
    required,
    paid,
    pending: Math.max(0, required - paid),
    rate: requiredRate,
    proofAvailable: hasCaseDocument(c, ['challan', 'drc-03', 'pre-deposit']) || paid > 0
  };
}

function getLitigationControlProfile(caseRecord) {
  const c = normalizeCaseRecord({ ...(caseRecord || {}) });
  const exposure = getCaseExposure(c);
  const paid = getCasePaidAmount(c);
  const outstanding = Math.max(0, exposure - paid);
  const documentGaps = getCaseDocumentGaps(c);
  const limitationItems = getCaseLimitationItems(c);
  const preDeposit = getCasePreDepositProfile(c);
  const hearingDates = (c.hearings || []).filter(h => h && h.date);
  const futureHearings = hearingDates.filter(h => daysFromNow(h.date) !== null && daysFromNow(h.date) >= 0);
  const adjournments = (c.hearings || []).filter(h => /adjourn/i.test(String((h && h.status) || ''))).length;
  const hasOwner = !!c.allottedTo;
  const dueDays = c.dueDate ? daysFromNow(c.dueDate) : null;

  let score = 0;
  if (c.priority === 'critical') score += 25;
  else if (c.priority === 'high') score += 15;
  if (dueDays !== null) score += dueDays < 0 ? 30 : dueDays <= 3 ? 25 : dueDays <= 7 ? 18 : dueDays <= 15 ? 10 : 0;
  if (exposure >= 10000000) score += 18;
  else if (exposure >= 2500000) score += 10;
  if (!hasOwner) score += 15;
  if (!c.whatIsToBeDone && !(c.pendingList || []).length) score += 8;
  score += Math.min(20, documentGaps.length * 4);
  if (preDeposit.applicable && preDeposit.pending > 0) score += 12;
  if (preDeposit.applicable && !preDeposit.proofAvailable) score += 8;
  if (['ph-pending', 'appeal-ph', 'gstat-ph'].includes(c.status) && futureHearings.length === 0) score += 12;
  if (adjournments >= 3) score += 12;
  score = Math.min(100, score);

  const risk = score >= 75
    ? { label: 'Critical', badge: 'red', tone: 'danger' }
    : score >= 50
      ? { label: 'High', badge: 'orange', tone: 'warning' }
      : score >= 25
        ? { label: 'Watch', badge: 'blue', tone: 'info' }
        : { label: 'Controlled', badge: 'green', tone: 'success' };

  const classification = ['closed', 'dropped'].includes(c.status)
    ? 'Resolved'
    : score >= 70
      ? 'Probable exposure'
      : score >= 35
        ? 'Possible exposure'
        : 'Remote / monitor';
  const provisionRate = classification === 'Probable exposure' ? 0.75 : classification === 'Possible exposure' ? 0.35 : classification === 'Remote / monitor' ? 0.1 : 0;
  const provisionAmount = Math.round(outstanding * provisionRate);

  let nextAction = 'Update next action, owner, and due date';
  if (!hasOwner) nextAction = 'Assign an owner before the next filing step';
  else if (dueDays !== null && dueDays < 0) nextAction = 'Escalate overdue filing immediately';
  else if (dueDays !== null && dueDays <= 7) nextAction = 'Prepare filing pack and partner review';
  else if (preDeposit.applicable && preDeposit.pending > 0) nextAction = 'Confirm pre-deposit and upload challan';
  else if (['ph-pending', 'appeal-ph', 'gstat-ph'].includes(c.status) && futureHearings.length === 0) nextAction = 'Record hearing date or adjournment position';
  else if (documentGaps.length) nextAction = 'Close document gaps before drafting or hearing';
  else if (c.whatIsToBeDone) nextAction = c.whatIsToBeDone;

  return {
    score,
    risk,
    classification,
    provisionAmount,
    exposure,
    paid,
    outstanding,
    documentGaps,
    limitationItems,
    preDeposit,
    nextAction,
    adjournments,
    futureHearings: futureHearings.length,
    hasOwner
  };
}

// â”€â”€â”€ MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Modal = {
  open(title, bodyHTML, footerHTML = '') {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal-footer').innerHTML = footerHTML;
    document.getElementById('modal-backdrop').classList.add('open');
  },
  close() { document.getElementById('modal-backdrop').classList.remove('open'); },
};

// â”€â”€â”€ ROUTER / APP CORE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const App = {
  currentModule: 'dashboard',
  modules: {},
  _dataSyncBound: false,
  _refreshTimer: null,

  async init() {
    const authenticated = await Auth.init();
    if (!authenticated) return;
    this.initAfterAuth();
  },

  initAfterAuth() {
    DB.init();
    if (!DB.get('clients')) DB.set('clients', GST_DATA.sampleClients || []);
    if (!DB.get('employees')) DB.set('employees', []);
    this.bindNav();
    this.bindSearch();
    this.bindModal();
    this.bindSidebar();
    this.bindDataSync();
    this.applySettings();
    this.applyAccessControls();
    this.updateSyncChip();
    this.navigate('dashboard');
    this.updateBadges();
    this.checkDeadlineAlerts();
    // Ctrl+K search
    document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); document.getElementById('global-search').focus(); } });
  },

  navigate(mod) {
    if (!this.canAccessModule(mod)) {
      toast('You do not have access to that module', 'warning');
      mod = 'dashboard';
    }
    this.currentModule = mod;
    document.querySelectorAll('.nav-item').forEach(a => a.classList.toggle('active', a.dataset.module === mod));
    document.getElementById('breadcrumb-current').textContent = this.moduleLabel(mod);
    document.title = this.moduleLabel(mod) + ' â€” GST Litigation Tool';
    const content = document.getElementById('app-content');
    content.innerHTML = '<div class="init-loading"><div class="spinner"></div></div>';
    setTimeout(() => {
      content.classList.remove('fade-in');
      void content.offsetWidth;
      content.classList.add('fade-in');
      const fn = this.modules[mod];
      if (fn) this.renderModule(fn, mod, content);
      else content.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="fas fa-tools"></i></div><div class="empty-title">Coming Soon</div><div class="empty-desc">This module is loadingâ€¦</div></div>`;
    });
  },

  renderModule(fn, mod, content) {
    try {
      fn();
    } catch (err) {
      showAppError('Could not open ' + this.moduleLabel(mod), err);
      content.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="fas fa-triangle-exclamation"></i></div><div class="empty-title">This view hit an error</div><div class="empty-desc">Use Refresh or reopen the module after the issue is corrected.</div><button class="btn btn-primary mt-3" onclick="App.refreshCurrentView()"><i class="fas fa-sync-alt"></i> Retry</button></div>`;
    }
  },

  moduleLabel(mod) {
    const labels = { dashboard: 'Dashboard', cases: 'Case Register', notices: 'Notice Manager', deadlines: 'Deadline Calculator', scn: 'SCN Reply Builder', analyzer: 'Demand Analyzer', knowledge: 'GST Provisions', caselaws: 'Case Law Finder', circulars: 'Circulars & Notifications', reports: 'Report Generator', settings: 'Settings', pipeline: 'Case Pipeline', clients: 'Client Master', employees: 'Employee Master', hearings: 'Hearing Tracker', notifications: 'Notifications', templates: 'Template Library', vault: 'Document Vault', timelog: 'Time & Work Log', billing: 'Billing', analytics: 'Analytics' };
    return labels[mod] || mod;
  },

  bindNav() {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const mod = el.dataset.module;
        if (App.modules[mod] && App.canAccessModule(mod)) {
          App.navigate(mod);
        } else {
          toast('You do not have access to that module', 'warning');
        }
        if (window.innerWidth <= 900) {
          document.getElementById('sidebar').classList.remove('mobile-open');
        }
      });
    });
    const userChip = document.getElementById('user-chip');
    if (userChip) userChip.addEventListener('click', () => Auth.logout());
    document.getElementById('refresh-btn').addEventListener('click', () => this.refreshDataNow());
    document.getElementById('sync-chip').addEventListener('click', () => this.refreshDataNow());
  },

  bindDataSync() {
    if (this._dataSyncBound) return;
    this._dataSyncBound = true;
    window.addEventListener('gstpro:datachange', event => this.handleDataChange(event.detail || {}));
  },

  handleDataChange(detail) {
    const keys = detail.keys || [];
    try {
      this.updateSyncChip();
      this.updateBadges();
      this.checkDeadlineAlerts();
      if (keys.includes('settings') || keys.includes('employees')) this.applySettings();
    } catch (err) {
      showAppError('Could not refresh app status', err);
    }

    if (detail.source === 'background-refresh' && this.canAutoRefreshCurrentView()) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = setTimeout(() => {
        if (this.canAutoRefreshCurrentView()) this.refreshCurrentView();
      }, 180);
    }
  },

  canAutoRefreshCurrentView() {
    const modalOpen = document.getElementById('modal-backdrop')?.classList.contains('open');
    if (modalOpen) return false;
    const active = document.activeElement;
    if (active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) return false;
    return !!this.modules[this.currentModule];
  },

  refreshCurrentView() {
    if (this.modules[this.currentModule]) this.navigate(this.currentModule);
  },

  async refreshDataNow() {
    this.updateSyncChip('syncing', 'Refreshing Excel', 'Saving pending changes and loading the latest backend data');
    const ok = await DB._loadFromServer('manual-refresh');
    this.updateBadges();
    this.checkDeadlineAlerts();
    this.applySettings();
    if (ok) {
      if (this.canAutoRefreshCurrentView()) this.refreshCurrentView();
      toast('Data refreshed from Excel', 'success', 1600);
    } else {
      toast('Backend unavailable, using local cache', 'warning', 2200);
    }
    return ok;
  },

  canAccessModule(mod) {
    if (['employees'].includes(mod)) return Auth.can('manage-employees');
    if (['clients'].includes(mod)) return Auth.can('manage-clients');
    return true;
  },

  applyAccessControls() {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.style.display = this.canAccessModule(el.dataset.module) ? '' : 'none';
    });
  },

  bindSearch() {
    const input = document.getElementById('global-search');
    const dd = document.getElementById('search-dropdown');
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { dd.classList.remove('open'); return; }
      const results = [];
      DB.getArr('cases').filter(c => (c.taxpayerName||'').toLowerCase().includes(q) || (c.legalName||'').toLowerCase().includes(q) || (c.tradeName||'').toLowerCase().includes(q) || (c.gstin||'').toLowerCase().includes(q) || (c.issue||'').toLowerCase().includes(q) || (c.caseNo||'').toLowerCase().includes(q) || (c.notes||'').toLowerCase().includes(q) || (c.section||'').toLowerCase().includes(q) || (c.period||'').toLowerCase().includes(q) || (c.allottedTo||'').toLowerCase().includes(q) || (c.grounds||[]).some(g => (g.name||'').toLowerCase().includes(q)) || (c.facts||[]).some(f => (f.name||'').toLowerCase().includes(q))).slice(0, 3).forEach(c => results.push({ icon: 'fa-folder', label: 'Case', text: c.caseNo + ' â€” ' + c.taxpayerName, action: () => { this.navigate('cases'); setTimeout(() => showCaseDetail(c.id), 150); } }));
      DB.getArr('clients').filter(c => (c.legalName||c.name||'').toLowerCase().includes(q) || (c.tradeName||'').toLowerCase().includes(q) || (c.gstin||'').toLowerCase().includes(q) || (c.pan||'').toLowerCase().includes(q) || (c.groupName||'').toLowerCase().includes(q) || (c.constitution||'').toLowerCase().includes(q) || (c.reference||'').toLowerCase().includes(q) || (c.contactName||'').toLowerCase().includes(q) || (c.email||'').toLowerCase().includes(q) || (c.mobile||'').toLowerCase().includes(q) || (c.address||'').toLowerCase().includes(q) || (c.notes||'').toLowerCase().includes(q)).slice(0, 3).forEach(c => results.push({ icon: 'fa-building', label: 'Client', text: c.tradeName || c.legalName || c.name, action: () => { this.navigate('clients'); setTimeout(() => window.openClientDetail(c.id), 150); } }));
      dd.innerHTML = results.length ? results.map((r, i) => `<div class="search-result-item" data-i="${i}"><i class="fas ${r.icon}"></i><span>${r.text}</span><span class="search-result-label">${r.label}</span></div>`).join('') : `<div class="search-result-item"><i class="fas fa-search"></i><span style="color:var(--text-muted)">No results for "${q}"</span></div>`;
      dd.querySelectorAll('.search-result-item').forEach((el, i) => { if (results[i]) el.onclick = () => { dd.classList.remove('open'); input.value = ''; results[i].action(); }; });
      dd.classList.add('open');
    });
    document.addEventListener('click', e => { if (!e.target.closest('.global-search-wrap')) dd.classList.remove('open'); });
  },

  bindModal() {
    document.getElementById('modal-close-btn').onclick = Modal.close.bind(Modal);
    document.getElementById('modal-backdrop').onclick = e => { if (e.target === document.getElementById('modal-backdrop')) Modal.close(); };
  },

  bindSidebar() {
    document.getElementById('sidebar-collapse-btn').onclick = () => document.getElementById('sidebar').classList.toggle('collapsed');
    document.getElementById('mobile-menu-btn').onclick = () => document.getElementById('sidebar').classList.toggle('mobile-open');
  },

  applySettings() {
    const s = DB.get('settings') || {};
    const user = Auth.currentUser || Auth.getStoredUser() || {};
    const displayName = user.name || s.userName || 'Practitioner';
    document.getElementById('user-name-display').textContent = displayName;
    document.getElementById('user-initials').textContent = (displayName || 'GP').split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
  },

  updateSyncChip(forceState, forceText, forceDetail) {
    const chip = document.getElementById('sync-chip');
    if (!chip) return;
    const textEl = document.getElementById('sync-chip-text');
    const info = DB.getSyncInfo ? DB.getSyncInfo() : { state: 'syncing', text: 'Checking backend', detail: '' };
    const state = forceState || info.state || 'syncing';
    const text = forceText || info.text || 'Checking backend';
    const detail = forceDetail || info.detail || '';
    chip.classList.remove('online', 'offline', 'syncing', 'error');
    chip.classList.add(state);
    chip.title = detail || text;
    if (textEl) textEl.textContent = text;
  },

  updateBadges() {
    const cases = DB.getArr('cases');
    document.getElementById('nav-count-cases').textContent = cases.length;
  },

  checkDeadlineAlerts() {
    const cases = DB.getArr('cases');
    const alerts = cases.filter(c => c.status !== 'closed' && c.status !== 'dropped' && c.dueDate && daysFromNow(c.dueDate) <= 15 && daysFromNow(c.dueDate) >= 0).length;
    const badge = document.getElementById('alert-badge');
    if (alerts > 0) { badge.style.display = 'flex'; badge.textContent = alerts; } else { badge.style.display = 'none'; }
    // - taxAmount: (Total Tax amount as number - sum of all years)
    // - penaltyAmount: (Total Penalty amount as number - sum of all years)
    // - interestAmount: (Total Interest amount as number - sum of all years)
    // - period: (Consolidated Financial Year or period, e.g. 2017-18 to 2021-22)
    // - yearWiseData: (Array of objects if the document contains a year-wise/table breakdown. Fields: period, tax, interest, penalty. Example: [{"period": "2017-18", "tax": 1000, "interest": 200, "penalty": 100}])
    document.getElementById('deadline-alert-btn').onclick = () => App.navigate('cases');
  }
};

// â”€â”€â”€ MODULE: DASHBOARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
App.modules.dashboard = function () {
  const cases = DB.getArr('cases');
  const ongoing = cases.filter(c => c.status !== 'closed' && c.status !== 'dropped');
  const totalDemand = cases.reduce((s, c) => s + (c.totalAmount || (c.demandAmount || 0) + (c.penaltyAmount || 0) + (c.interestAmount || 0) + (c.otherAmount || 0)), 0);
  const statusColors = { 'new-lead': 'gray', 'scn-received': 'orange', 'reply-filed': 'blue', 'ph-pending': 'orange', 'oio-received': 'red', 'appeal-filed': 'purple', 'appeal-ph': 'purple', 'oia-received': 'red', 'gstat-appeal-filed': 'purple', 'gstat-ph': 'purple', 'tribunal-order': 'red', 'hc-petition-filed': 'purple', 'sc-petition-filed': 'purple', 'writ-filed': 'purple', 'payment-made': 'green', 'closed': 'green', 'dropped': 'green' };
  const statusLabel = { 'new-lead': 'New Lead', 'scn-received': 'SCN Received', 'reply-filed': 'Reply Filed', 'ph-pending': 'PH Pending', 'oio-received': 'OIO Received', 'appeal-filed': 'Appeal Filed', 'appeal-ph': 'PH (Appeal)', 'oia-received': 'OIA Received', 'gstat-appeal-filed': 'GSTAT Appeal', 'gstat-ph': 'PH (GSTAT)', 'tribunal-order': 'Tribunal Order', 'hc-petition-filed': 'HC Petition', 'sc-petition-filed': 'SC Petition', 'writ-filed': 'Writ Filed', 'payment-made': 'Payment Made', 'closed': 'Closed', 'dropped': 'Dropped' };
  const withDue = ongoing.filter(c => c.dueDate);
  const urgentCases = withDue.filter(c => { const d = daysFromNow(c.dueDate); return d !== null && d <= 15 && d >= 0; });

  document.getElementById('app-content').innerHTML = `
  <div class="page-header">
    <div class="page-header-row">
      <div><div class="page-title">Dashboard</div>
      <div class="page-subtitle">Overview of your GST litigation portfolio &mdash; ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
      <div class="flex gap-2">
        <button class="btn btn-primary btn-sm" onclick="openAddCase()"><i class="fas fa-plus"></i> New Case</button>
      </div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card" onclick="App.navigate('cases')">
      <div class="stat-card-top"><span class="stat-label">TOTAL CASES</span><span class="stat-icon gold"><i class="fas fa-folder-open"></i></span></div>
      <div class="stat-value">${cases.length}</div>
      <div class="stat-change">${ongoing.length} ongoing &middot; ${cases.length - ongoing.length} closed</div>
    </div>
    <div class="stat-card" onclick="App.navigate('cases')">
      <div class="stat-card-top"><span class="stat-label">URGENT DEADLINES</span><span class="stat-icon red"><i class="fas fa-exclamation-triangle"></i></span></div>
      <div class="stat-value">${urgentCases.length}</div>
      <div class="stat-change up">due within 15 days</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top"><span class="stat-label">TOTAL DEMAND</span><span class="stat-icon orange"><i class="fas fa-rupee-sign"></i></span></div>
      <div class="stat-value" style="font-size:18px">${fmtINR(totalDemand)}</div>
      <div class="stat-change">across all cases</div>
    </div>
    <div class="stat-card" onclick="App.navigate('caselaws')">
      <div class="stat-card-top"><span class="stat-label">CASE LAW DATABASE</span><span class="stat-icon blue"><i class="fas fa-gavel"></i></span></div>
      <div class="stat-value">${GST_DATA.caseLaws.length}</div>
      <div class="stat-change">judgments indexed</div>
    </div>
    <div class="stat-card" onclick="App.navigate('knowledge')">
      <div class="stat-card-top"><span class="stat-label">GST SECTIONS</span><span class="stat-icon green"><i class="fas fa-book-open"></i></span></div>
      <div class="stat-value">${GST_DATA.sections.length}</div>
      <div class="stat-change">provisions in database</div>
    </div>
    </div>
  </div>

  <div class="grid-2" style="margin-bottom:20px">
    <div class="card">
      <div class="flex justify-between items-center mb-3">
        <b style="font-size:14px">Recent Cases</b>
        <button class="btn btn-ghost btn-sm" onclick="App.navigate('cases')">View All &rarr;</button>
      </div>
      ${cases.length === 0 ? '<div class="empty-state"><div class="empty-icon"><i class="fas fa-folder-open"></i></div><div class="empty-title">No cases yet</div><div class="empty-desc">Create your first case file to get started.</div><button class="btn btn-primary mt-3" onclick="openAddCase()"><i class="fas fa-plus"></i> Create Case</button></div>' :
      cases.slice(0, 4).map(c => {
        const total = (c.totalAmount || (c.demandAmount || 0) + (c.penaltyAmount || 0) + (c.interestAmount || 0) + (c.otherAmount || 0));
        return `
        <div class="case-card mb-3" onclick="showCaseDetail('${c.id}')">
          <div class="case-header">
            <div><div class="case-id">${c.caseNo}</div><div class="case-name">${c.taxpayerName}</div></div>
            <span class="badge badge-${statusColors[c.status] || 'gray'}">${statusLabel[c.status] || c.status}</span>
          </div>
          <div class="case-meta">
            <span class="case-meta-item"><i class="fas fa-book"></i> Sec ${c.section}</span>
            <span class="case-meta-item"><i class="fas fa-rupee-sign"></i> ${fmtINR(total)}</span>
            <span class="case-meta-item"><i class="fas fa-calendar"></i> ${c.period || '&mdash;'}</span>
          </div>
        </div>`;
      }).join('')}
    </div>

    <div class="card">
      <div class="flex justify-between items-center mb-3">
        <b style="font-size:14px">Upcoming Deadlines</b>
        <button class="btn btn-ghost btn-sm" onclick="App.navigate('cases')">View All &rarr;</button>
      </div>
      ${withDue.length === 0 ? '<div class="empty-state"><div class="empty-icon"><i class="fas fa-check-circle" style="color: #10b981;"></i></div><div class="empty-title">No upcoming deadlines</div></div>' :
      withDue.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5).map(c => {
        const days = daysFromNow(c.dueDate);
        const cls = days < 0 ? 'expired' : days <= 7 ? 'due-soon' : 'ok';
        return `<div class="flex justify-between items-center" style="padding:10px 0;border-bottom:1px solid var(--border)">
            <div>
              <div style="font-size:13px;font-weight:600">${c.taxpayerName}</div>
              <div class="text-muted text-xs">${c.assignmentTypeLabel || 'Case'} &middot; Sec ${c.section} &middot; ${c.caseNo}</div>
            </div>
            <div class="text-right">
              <div class="deadline-date ${cls}">${fmtDate(c.dueDate)}</div>
              <div class="deadline-days ${cls}">${days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due TODAY' : `${days}d left`}</div>
            </div>
          </div>`;
      }).join('')}
    </div>
  </div>

  </div>`;
};

// â”€â”€â”€ MODULE: CASES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
App.modules.cases = function () {
  function render(filter = 'all', search = '') {
    let cases = DB.getArr('cases');
    const stageFilter = getCaseFilterStages(filter);
    if (stageFilter) cases = cases.filter(c => stageFilter.includes(c.status || 'new-lead'));
    if (search) cases = cases.filter(c => (c.taxpayerName||'').toLowerCase().includes(search) || (c.legalName||'').toLowerCase().includes(search) || (c.tradeName||'').toLowerCase().includes(search) || c.gstin.toLowerCase().includes(search) || c.caseNo.toLowerCase().includes(search));
    const list = document.getElementById('cases-list');
    if (!list) return;
    list.innerHTML = cases.length === 0 ? `<div class="empty-state"><div class="empty-icon">Ã°Å¸â€œÂ</div><div class="empty-title">No cases found</div><div class="empty-desc">Add your first case or adjust filters.</div><button class="btn btn-primary mt-3" onclick="openAddCase()"><i class="fas fa-plus"></i> Add Case</button></div>` :
      cases.map(c => {
        const cl = c.checklist || [];
        const clDone = cl.filter(s => s.status === 'done').length;
        const clTotal = cl.length || 10;
        const total = (c.totalAmount || (c.demandAmount || 0) + (c.penaltyAmount || 0) + (c.interestAmount || 0) + (c.otherAmount || 0));
        const collected = c.amountCollected || 0;
        const colRatio = total > 0 ? Math.round((collected / total) * 100) : 0;
        const stageMeta = getCaseStageMeta(c.status);
        const profile = getLitigationControlProfile(c);
        return `<div class="case-card mb-3" onclick="showCaseDetail('${c.id}')">
        <div class="case-header">
          <div><div class="case-id">${c.caseNo}</div><div class="case-name">${c.taxpayerName}</div><div class="case-gstin">${c.gstin}</div></div>
          <div class="text-right"><span class="badge badge-${getCaseStageBadgeColor(c.status)}">${stageMeta.label}</span><div class="badge badge-${profile.risk.badge} mt-1">${profile.risk.label} control</div>${c.priority === 'critical' ? '<div class="badge badge-red mt-1"><i class="fas fa-fire"></i> Critical</div>' : ''}</div>
        </div>
        <div class="case-meta">
          <span class="case-meta-item"><i class="fas fa-columns"></i> ${stageMeta.groupLabel}</span>
          <span class="case-meta-item"><i class="fas fa-book"></i> Sec ${c.section}</span>
          <span class="case-meta-item" title="Demand"><i class="fas fa-rupee-sign"></i> ${fmtINR(total)}</span>
          ${collected > 0 ? `<span class="case-meta-item" style="color:var(--green)" title="Collected"><i class="fas fa-check-circle"></i> ${fmtINR(collected)} (${colRatio}%)</span>` : ''}
          <span class="case-meta-item"><i class="fas fa-calendar-alt"></i> ${c.period}</span>
          <span class="case-meta-item"><i class="fas fa-tag"></i> ${c.assignmentTypeLabel || 'Reply to SCN'}</span>
          ${c.dueDate ? `<span class="case-meta-item" style="color:var(--red);font-weight:600;background:var(--red-dim);padding:2px 6px;border-radius:4px"><i class="fas fa-clock"></i> Due: ${fmtDate(c.dueDate)}</span>` : ''}
          ${c.allottedTo ? `<span class="case-meta-item"><i class="fas fa-user"></i> ${resolveEmployeeName(c.allottedTo)}</span>` : ''}
        </div>
        <div class="case-control-line">
          <span><i class="fas fa-compass"></i> ${profile.nextAction}</span>
          <b>${profile.classification}</b>
        </div>
        <div style="margin-top:12px; border-top:1px dashed var(--border); padding-top:10px; display:flex; gap:16px; font-size:12px; color:var(--text-muted)">
          <div style="flex:1; max-width: 30%">
            <div style="font-weight:600; color:var(--text); margin-bottom:4px"><i class="fas fa-university text-purple"></i> Authority</div>
            <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(c.authority || jurisdictionDisplay(c.jurisdiction) || 'Not Specified')}">
              ${escapeHTML(c.authority ? c.authority.split('\\n')[0] : (jurisdictionDisplay(c.jurisdiction) || 'Not Specified'))}
            </div>
          </div>
          <div style="flex:2">
            <div style="font-weight:600; color:var(--text); margin-bottom:4px"><i class="fas fa-calendar-alt text-blue"></i> Key Timeline</div>
            <div style="display:flex; gap:12px; flex-wrap:wrap">
              ${buildCaseTimelinePreview(c)}
            </div>
          </div>
        </div>
        ${cl.length > 0 ? `<div style="margin-top:8px"><div class="cf-progress-bar" style="height:4px"><div class="cf-progress-fill" style="width:${(clDone / clTotal * 100)}%"></div></div><div class="text-muted" style="font-size:10px">Stage ${clDone}/${clTotal}</div></div>` : ''}
      </div>`;
      }).join('');
  }

  const allCases = DB.getArr('cases');
  const ongoing = allCases.filter(c => c.status !== 'closed' && c.status !== 'dropped');
  const criticalCt = allCases.filter(c => c.priority === 'critical').length;
  const totalDemand = allCases.reduce((s, c) => s + (c.totalAmount || (c.demandAmount || 0) + (c.penaltyAmount || 0) + (c.interestAmount || 0) + (c.otherAmount || 0)), 0);

  const totalCollected = allCases.reduce((s, c) => s + (c.amountCollected || 0), 0);

  document.getElementById('app-content').innerHTML = `
  <div class="page-header">
    <div class="page-header-row">
      <div><div class="page-title">Case Register</div></div>
      <button class="btn btn-primary" onclick="openAddCase()"><i class="fas fa-plus"></i> New Case</button>
    </div>
  </div>

  <div class="stats-grid mb-4" style="grid-template-columns:repeat(5,1fr)">
    <div class="stat-card" style="cursor:default">
      <div class="stat-card-top"><span class="stat-label">TOTAL</span><span class="stat-icon gold"><i class="fas fa-folder"></i></span></div>
      <div class="stat-value">${allCases.length}</div>
    </div>
    <div class="stat-card" style="cursor:default">
      <div class="stat-card-top"><span class="stat-label">ONGOING</span><span class="stat-icon blue"><i class="fas fa-spinner"></i></span></div>
      <div class="stat-value">${ongoing.length}</div>
    </div>
    <div class="stat-card" style="cursor:default">
      <div class="stat-card-top"><span class="stat-label">DEMAND</span><span class="stat-icon orange"><i class="fas fa-rupee-sign"></i></span></div>
      <div class="stat-value" style="font-size:16px">${fmtINR(totalDemand)}</div>
    </div>
    <div class="stat-card" style="cursor:default">
      <div class="stat-card-top"><span class="stat-label">COLLECTED</span><span class="stat-icon green"><i class="fas fa-check-circle"></i></span></div>
      <div class="stat-value" style="font-size:16px">${fmtINR(totalCollected)}</div>
    </div>
    <div class="stat-card" style="cursor:default">
      <div class="stat-card-top"><span class="stat-label">CRITICAL</span><span class="stat-icon red"><i class="fas fa-fire"></i></span></div>
      <div class="stat-value">${criticalCt}</div>
    </div>
  </div>

  <div class="card mb-4">
    <div class="flex gap-3 items-center flex-wrap">
      <input type="text" id="case-search" class="form-input" style="max-width:260px" placeholder="Search by name, GSTIN, case no\u2026" oninput="renderCaseFilter()">
      <div class="flex gap-2 flex-wrap" id="case-pills">
        ${[{ v: 'all', l: 'All' }, ...CASE_STAGE_GROUPS.map(g => ({ v: g.id, l: g.label }))].map(
    f => `<button class="btn btn-xs ${f.v === 'all' ? 'btn-primary' : 'btn-outline'}" data-filter="${f.v}" onclick="setCaseFilter('${f.v}')">${f.l}</button>`
  ).join('')}
      </div>
    </div>
  </div>
  <div id="cases-list"></div>`;

  let currentCaseFilter = 'all';
  window.renderCaseFilter = () => render(currentCaseFilter, document.getElementById('case-search').value.toLowerCase().trim());
  window.setCaseFilter = (filter) => {
    currentCaseFilter = filter;
    document.querySelectorAll('#case-pills button').forEach(b => {
      b.className = b.dataset.filter === filter ? 'btn btn-xs btn-primary' : 'btn btn-xs btn-outline';
    });
    renderCaseFilter();
  };
  render();
};

window.showCaseDetail = function (id) {
  const c = DB.getArr('cases').find(x => x.id === id);
  if (!c) return;
  // Initialize arrays if they don't exist (backward compat with older cases)
  let needsSave = false;
  if (!c.checklist) { c.checklist = [{ code: 'S01', name: 'Receipt of Assignment & Understanding of Issue', level: 'L11', status: 'pending' }, { code: 'S02', name: 'Understanding of Work & Pre-initiation Stage', level: 'L21', status: 'pending' }, { code: 'S03', name: 'Preparation of Case File', level: 'L3_', status: 'pending' }, { code: 'S04', name: 'Detailed Study & Finalization of Points', level: 'L21', status: 'pending' }, { code: 'S05', name: 'Preparation of Documents & Basic Draft', level: 'L3_', status: 'pending' }, { code: 'S06', name: 'Preparation of Draft by L2', level: 'L21', status: 'pending' }, { code: 'S07', name: 'Review by Team Leader & Inputs', level: 'L11', status: 'pending' }, { code: 'S08', name: 'Finalization of Draft', level: 'L21', status: 'pending' }, { code: 'S09', name: 'Preparation of Final PDF & Submission', level: 'L3_', status: 'pending' }, { code: 'S10', name: 'Conclusion', level: 'L21', status: 'pending' }]; needsSave = true; }
  if (!c.grounds) { c.grounds = [{ sr: 1, name: 'Value Inclusive of Tax', applicable: false, taken: false, category: 'general' }, { sr: 2, name: 'Quantification', applicable: false, taken: false, category: 'general' }, { sr: 3, name: 'Suppression', applicable: false, taken: false, category: 'general' }, { sr: 4, name: 'Limitation', applicable: false, taken: false, category: 'general' }, { sr: 5, name: 'DIN', applicable: false, taken: false, category: 'general' }, { sr: 6, name: 'Jurisdiction', applicable: false, taken: false, category: 'general' }, { sr: 7, name: 'Penalties', applicable: false, taken: false, category: 'general' }, { sr: 8, name: 'Interest', applicable: false, taken: false, category: 'general' }, { sr: 9, name: 'RUD not given', applicable: false, taken: false, category: 'general' }, { sr: 10, name: 'Monetary Limitation', applicable: false, taken: false, category: 'general' }]; needsSave = true; }
  if (!c.documents) { c.documents = [{ sr: 1, name: 'Summons', physical: false, soft: false, na: false }, { sr: 2, name: 'Reply to Summons', physical: false, soft: false, na: false }, { sr: 3, name: 'Statement', physical: false, soft: false, na: false }, { sr: 4, name: 'Panchnama', physical: false, soft: false, na: false }, { sr: 5, name: 'Audit Query Memo', physical: false, soft: false, na: false }, { sr: 6, name: 'FAR', physical: false, soft: false, na: false }, { sr: 7, name: 'SCN', physical: false, soft: false, na: false }, { sr: 8, name: 'Reply to SCN', physical: false, soft: false, na: false }, { sr: 9, name: 'OIO', physical: false, soft: false, na: false }, { sr: 10, name: 'APL-01', physical: false, soft: false, na: false }, { sr: 11, name: 'Representation Before Comm. A', physical: false, soft: false, na: false }, { sr: 12, name: 'OIA (Comm. Appeals)', physical: false, soft: false, na: false }, { sr: 13, name: 'Contracts', physical: false, soft: false, na: false }, { sr: 14, name: 'Invoices', physical: false, soft: false, na: false }, { sr: 15, name: 'AFS', physical: false, soft: false, na: false }]; needsSave = true; }
  if (!c.updateNotes) { c.updateNotes = []; needsSave = true; }
  if (!c.pendingList) { c.pendingList = []; needsSave = true; }
  if (!c.payments) { c.payments = []; needsSave = true; }
  if (!c.hearings) { c.hearings = []; needsSave = true; }
  if (!c.facts) {
    c.facts = [
      { sr: 1, name: 'Introduction of Appellant / Noticee (GSTIN, Background)', applicable: false, taken: false, category: 'general' },
      { sr: 2, name: 'Background & Chronological Events', applicable: false, taken: false, category: 'general' }
    ]; needsSave = true;
  }

  // Data Migration for older cases that lack categories
  if (c.grounds) {
    // 1. Fix old ground properties
    c.grounds.forEach(g => {
      if (!g.category) { g.category = 'specific'; needsSave = true; }
      if (g.title && !g.name) { g.name = g.title; needsSave = true; }
    });

    // 2. Ensure all 10 general grounds exist
    const defaultGenerals = [
      'Value Inclusive of Tax', 'Quantification', 'Suppression', 'Limitation',
      'DIN', 'Jurisdiction', 'Penalties', 'Interest', 'RUD not given', 'Monetary Limitation'
    ];
    const existingNames = c.grounds.map(g => g.name);

    let addedCount = 0;
    defaultGenerals.forEach((name) => {
      if (!existingNames.includes(name)) {
        c.grounds.splice(addedCount, 0, {
          sr: 0,
          name: name,
          applicable: false,
          taken: false,
          category: 'general'
        });
        addedCount++;
        needsSave = true;
      }
    });

    // 3. Auto-inject origin-specific grounds based on Case Origin Category
    const originSpecificGrounds = {
      'return-scrutiny': [
        'No suppression â€“ all returns filed regularly and correctly',
        'ITC correctly availed as per GSTR-2A/2B matching',
        'Turnover difference is reconcilable (timing / credit notes)',
        'Demand based on assumptions without verifying books',
        'No allegation of fraud â€“ extended period not invocable',
        'Department failed to issue ASMT-12 before proceeding to SCN',
        'Reconciliation statement already filed and accepted',
        'Tax already paid on reverse charge â€“ no short payment',
        'Classification / valuation adopted is legally correct',
        'Principles of natural justice violated â€“ no proper hearing'
      ],
      'dept-audit': [
        'Audit observations are not binding â€“ only recommendatory',
        'All records and documents duly produced during audit',
        'No discrepancy found during audit â€“ demand without basis',
        'Audit period already covered â€“ no fresh grounds for SCN',
        'ITC reversal already done voluntarily during audit',
        'Reconciliation accepted by audit team but SCN still issued',
        'Audit memo not served properly â€“ procedural lapse',
        'Demand raised beyond scope of original audit',
        'Tax difference is due to provisional assessment corrections',
        'Findings based on sampling â€“ not representative of full records'
      ],
      'special-audit': [
        'Direction for special audit without valid reasons under Sec 66',
        'CA / Cost Accountant report is opinion â€“ not conclusive evidence',
        'All documents provided to special auditor â€“ no non-cooperation',
        'Valuation methodology adopted by auditor is incorrect',
        'Special audit findings contradict departmental audit observations',
        'No opportunity given to rebut special audit report before SCN',
        'Audit conducted beyond prescribed time limit',
        'Expenses incurred on special audit not justified â€“ no complexity',
        'Demand based solely on special audit without independent verification',
        'ITC disallowance in audit report is contrary to statutory provisions'
      ],
      'investigation': [
        'Statement recorded under duress / coercion â€“ retracted',
        'No corroborative evidence to support department allegations',
        'Goods and transactions are genuine â€“ not bogus / fictitious',
        'ITC availed on actual receipt of goods / services with documents',
        'Supplier default cannot be attributed to recipient (Sec 16)',
        'Investigation based on third party data without cross-verification',
        'Bank transactions and payment trail confirms genuineness',
        'No mens rea / intention to evade tax â€“ bonafide error',
        'Department relied on unsigned / unverified documents',
        'Investigation findings not put to assessee before issuing SCN'
      ],
      'inspection': [
        'Authorization for inspection / search not valid or proper',
        'Seizure of goods / documents beyond scope of authorization',
        'Panchnama not prepared as per statutory requirements',
        'Goods seized are not liable to confiscation under Sec 130',
        'No reasonable belief for initiating search proceedings',
        'Seized goods released on bond â€“ no further proceedings warranted',
        'Statement recorded during search under coercion â€“ retracted',
        'Inventory prepared during search does not match seizure order',
        'Inspection conducted without following mandatory procedures',
        'No show cause notice issued within statutory timeline after seizure'
      ],
      'eway-detention': [
        'Minor / technical infraction â€“ goods and tax fully accounted',
        'E-way bill generated but expired due to circumstances beyond control',
        'Goods duly recorded in books â€“ no intention to evade',
        'Penalty under Sec 129 not applicable â€“ goods not in transit',
        'Tax invoice and delivery challan accompanied the goods',
        'Discrepancy in quantity is within permissible tolerance limit',
        'Vehicle breakdown / route deviation caused delay â€“ not evasion',
        'Confiscation under Sec 130 not warranted â€“ no intent to evade',
        'Detention order issued without providing opportunity of hearing',
        'Penalty already paid under protest â€“ appeal filed within time'
      ],
      'data-mismatch': [
        'Mismatch due to timing differences in return filing',
        'Reconciliation statement filed and accepted by department',
        'GSTR-2A/2B data not updated by supplier â€“ not recipient fault',
        'Difference due to credit notes / debit notes issued in next period',
        'HSN code difference is cosmetic â€“ correct tax rate applied',
        'System generated mismatch without manual verification by officer',
        'Turnover difference due to advances received / refunded',
        'E-commerce operator reporting difference â€“ already reconciled',
        'ITC availed on valid invoices â€“ supplier filing delay',
        'DRC-01A issued without proper verification â€“ premature demand'
      ],
      'refund': [
        'Unjust enrichment clause not applicable â€“ burden not passed on',
        'Documentary proof of non-passing of incidence furnished',
        'Refund application filed within statutory time limit (Sec 54)',
        'CA certificate confirming non-passing of burden submitted',
        'Inverted duty structure correctly computed per Rule 89(5)',
        'Export documents (shipping bill, BRC, FIRC) duly furnished',
        'Deficiency memo issued beyond prescribed time â€“ deemed accepted',
        'Provisional refund under Sec 54(6) sanctioned â€“ balance due',
        'Relevant date correctly computed under Explanation to Sec 54',
        'Refund of accumulated ITC is a vested right â€“ cannot be denied'
      ],
      'registration': [
        'Business is operational and active â€“ cancellation unjustified',
        'Returns filed regularly â€“ no persistent non-compliance',
        'SCN for cancellation issued without valid grounds (Sec 29)',
        'Revocation application filed within prescribed time (30 days)',
        'Non-filing of returns was for valid business reasons (seasonal)',
        'Tax dues paid in full before revocation application',
        'Cancellation order passed without granting personal hearing',
        'Registration cannot be cancelled retrospectively without justification',
        'Suo motu cancellation without following procedure under Rule 22',
        'ITC reversal and output liability computed incorrectly in order'
      ]
    };


    // Build master list of ALL origin-specific ground names
    const allOriginGrounds = new Set();
    Object.values(originSpecificGrounds).forEach(list => list.forEach(name => allOriginGrounds.add(name)));

    // Remove grounds from OTHER origins (keep user-added specific grounds)
    const currentOriginGrounds = c.caseOrigin && originSpecificGrounds[c.caseOrigin] ? new Set(originSpecificGrounds[c.caseOrigin]) : new Set();
    const beforeGroundsLen = c.grounds.length;
    c.grounds = c.grounds.filter(g => {
      if (g.category === 'general') return true;
      if (!allOriginGrounds.has(g.name)) return true;
      if (currentOriginGrounds.has(g.name)) return true;
      return false;
    });
    if (c.grounds.length !== beforeGroundsLen) needsSave = true;

    // Inject current origin's specific grounds
    if (c.caseOrigin && originSpecificGrounds[c.caseOrigin]) {
      originSpecificGrounds[c.caseOrigin].forEach((name) => {
        if (!c.grounds.some(g => g.name === name)) {
          c.grounds.push({ sr: 0, name: name, applicable: false, taken: false, category: 'specific' });
          needsSave = true;
        }
      });
    }

    // 4. Fix all serial numbers (Sr.) so that new additions don't break Math.max
    c.grounds.forEach((g, idx) => {
      if (g.sr !== idx + 1) {
        g.sr = idx + 1;
        needsSave = true;
      }
    });
  }

  // Data Migration for Facts
  if (c.facts) {
    c.facts.forEach(g => {
      if (!g.category) { g.category = 'specific'; needsSave = true; }
      if (g.title && !g.name) { g.name = g.title; needsSave = true; }
    });

    // Remove old unwanted general facts from previous versions
    const unwantedGenerals = [
      'Nature of Business Activity & Operations',
      'GST Registration Details & Amendments',
      'Return Filing History (GSTR-1, GSTR-3B, GSTR-9, GSTR-9C)',
      'Audit / Investigation / Search & Seizure Details',
      'Summons & Statements Recorded',
      'Show Cause Notice (SCN) â€“ Date, Allegations & Amounts',
      'Reply to SCN â€“ Summary of Submissions',
      'Personal Hearing â€“ Dates & Proceedings',
      'Order in Original (OIO) / Order in Appeal (OIA) Details',
      'Input Tax Credit (ITC) â€“ Availment, Utilization & Reversal',
      'E-way Bill Compliance & Transit Documentation',
      'Payment & Pre-deposit Details (DRC-03, Challan)',
      'Correspondence with Department (Letters, Representations)',
      'Tax Payment & Compliance Track Record',
      'Background of Taxpayer',
      'Business Activity Operations',
      'Notice Details / Proceedings',
      'Background of Taxpayer (Registration, Constitution, GSTIN)',
      // Old 5-item general facts (replaced with comprehensive 15-item list)
      'Introduction of Appellant / Noticee (GSTIN, Background)',
      'Background & Chronological Events',
      'Nature of Business Activity, Constitution & GST Registration',
      'Personal Hearing â€“ Dates, Adjournments & Submissions Made',
      'Order Passed â€“ Date, Demand Confirmed, Relief Granted & Reasoning'
    ];
    const beforeLen = c.facts.length;
    c.facts = c.facts.filter(g => !(g.category === 'general' && unwantedGenerals.includes(g.name)));
    if (c.facts.length !== beforeLen) needsSave = true;

    // Ensure the 15 comprehensive general facts exist
    const defaultFactGenerals = [
      'Background of Noticee / Appellant â€“ Name, GSTIN, Constitution & Principal Place of Business',
      'Nature of Business Activity â€“ Goods / Services Dealt In, HSN / SAC Codes & Industry',
      'GST Registration History â€“ Effective Date, Status, Amendments & Additional Registrations',
      'Chronology of Events â€“ Complete Timeline from Trigger to Present Stage',
      'Return Filing & Compliance Record â€“ GSTR-1, GSTR-3B, GSTR-9, GSTR-9C Status (Period-wise)',
      'Tax Payment Track Record â€“ Ledger Balances (Electronic Cash, Credit & Liability)',
      'Input Tax Credit Position â€“ ITC Availed, Utilized, Reversed & Blocked Credits (Sec 17(5))',
      'Show Cause Notice / Order â€“ Date, Reference No., Sections Invoked & Specific Allegations',
      'Demand Breakup â€“ Tax, Interest (Sec 50), Penalty (Sec 122/125/129) & Other Amounts',
      'Reply / Submissions Filed â€“ Date, Key Arguments, Legal Grounds & Evidence Attached',
      'Principles of Natural Justice â€“ Whether Adequate Opportunity of Hearing Was Provided',
      'Limitation Analysis â€“ Whether SCN / Order Issued Within Prescribed Time (Sec 73/74/107)',
      'Personal Hearing â€“ All Dates, Adjournments (Sought / Granted), Submissions & Attendance Record',
      'Order Passed â€“ Date, Authority, Demand Confirmed / Modified / Dropped & Key Reasoning',
      'Appeal / Remedy â€“ Forum Chosen (Appellate Authority / Tribunal / HC / SC), Pre-deposit & Current Status'
    ];
    const existingFactNames = c.facts.map(g => g.name);
    let addedFactCount = 0;
    defaultFactGenerals.forEach((name) => {
      if (!existingFactNames.includes(name)) {
        c.facts.splice(addedFactCount, 0, {
          sr: 0, name: name, applicable: false, taken: false, category: 'general'
        });
        addedFactCount++;
        needsSave = true;
      }
    });

    // Force correct order for general facts
    const introIdx = c.facts.findIndex(f => f.name === defaultFactGenerals[0]);
    if (introIdx > 0) {
      const intro = c.facts.splice(introIdx, 1)[0];
      c.facts.unshift(intro);
      needsSave = true;
    }
    const bgIdx = c.facts.findIndex(f => f.name === defaultFactGenerals[1]);
    if (bgIdx !== 1) {
      const bg = c.facts.splice(bgIdx, 1)[0];
      c.facts.splice(1, 0, bg);
      needsSave = true;
    }

    // Remove old origin-specific facts that were promoted to general
    const promotedToGeneral = [
      'Nature of Business & GST Registration Details',
      'Nature of Business & Goods Being Transported',
      'Nature of Business & GST Registration History',
      'Nature of Business & Basis for Refund Claim',
      'Personal Hearing â€“ Dates & Submissions',
      'Personal Hearing & Order Details',
      'Personal Hearing & Final Order Details',
      'Order Passed & Demand Confirmed / Dropped',
      'Order Passed & Demand Quantified',
      'Order Passed â€“ Confiscation / Release / Penalty'
    ];
    const beforePromoLen = c.facts.length;
    c.facts = c.facts.filter(f => !(f.category === 'specific' && promotedToGeneral.includes(f.name)));
    if (c.facts.length !== beforePromoLen) needsSave = true;

    // Auto-inject origin-specific facts based on Case Origin Category
    const originSpecificFacts = {
      'return-scrutiny': [
        'Details of Returns Filed â€“ GSTR-1, GSTR-3B, GSTR-9 & GSTR-9C (Period-wise)',
        'ASMT-10 Notice â€“ Date, Discrepancies Pointed Out & Reply Timeline',
        'Response / Explanation Submitted to Scrutiny Notice (ASMT-11)',
        'Turnover Mismatch â€“ GSTR-1 vs GSTR-3B vs Books of Accounts (with working)',
        'ITC Mismatch â€“ GSTR-2A/2B vs GSTR-3B (Period-wise reconciliation)',
        'Outward Supply â€“ Tax Rate Classification Applied & HSN-wise Breakup',
        'Exempt, Nil-Rated & Non-GST Supplies Segregation',
        'Credit Notes & Debit Notes Issued â€“ Impact on Net Turnover & Tax',
        'Advances Received & Adjustment Against Invoices',
        'RCM Liability â€“ Identification, Payment & ITC Claimed',
        'Reconciliation of E-way Bills Generated vs Returns Filed',
        'Reconciliation of TDS/TCS Credit with Returns',
        'Tax Already Paid / Short Payment Working (Ledger-wise)',
        'DRC-01A Intimation â€“ Whether Issued Before SCN & Response',
        'SCN under Sec 73/74 â€“ Specific Allegations, Amounts Demanded & Sections Invoked',
        'Whether Extended Period Invoked â€“ Basis & Justification by Department',
        'Pre-deposit / Voluntary Payment Made (DRC-03) â€“ Amount & Date',
        'Adjournment History & Compliance with Hearing Schedule',
        'Cross-examination of Witnesses / Statements (if any)',
        'Comparable Cases â€“ Similar Scrutiny Dropped / Favourable Orders'
      ],
      'dept-audit': [
        'Audit Initiation â€“ ADT-01 Notice, Period Covered & Scope of Audit (Sec 65)',
        'Audit Team â€“ Names, Designations & Jurisdiction',
        'Documents & Records Submitted During Audit (with acknowledgements)',
        'Audit Observations â€“ Point-wise Objections Raised by Officers',
        'Reply to Each Audit Query Memo / Point of Objection',
        'Turnover Reconciliation â€“ Books vs Returns vs E-way Bills',
        'ITC Verification â€“ Eligibility, Blocked Credits (Sec 17(5)), Apportionment',
        'Valuation Issues â€“ Related Party Transactions, Discounts, Inclusions/Exclusions',
        'Classification Disputes â€“ HSN/SAC Codes & Rate Differences',
        'RCM Applicability â€“ Unregistered Purchases, Specified Services',
        'Job Work Transactions â€“ Sec 143 Compliance & Timelines',
        'Final Audit Report (FAR / ADT-04) â€“ Key Findings & Quantification',
        'Reconciliation of ITC with GSTR-2A/2B (Period-wise)',
        'Department Acceptance / Rejection of Reconciliation Submitted',
        'SCN Issued Post Audit under Sec 73/74 â€“ Specific Demands',
        'Whether Audit Observations Go Beyond Scope of Original Audit Period',
        'Tax Already Self-Assessed & Paid â€“ No Short Payment Working',
        'Comparable Industry Practices & Revenue Neutral Arguments',
        'Voluntary Compliance Done During Audit (DRC-03)',
        'Pending Issues Not Covered in Final Report'
      ],
      'special-audit': [
        'Direction for Special Audit â€“ Order by Commissioner & Reasons Recorded (Sec 66)',
        'Whether Complexity / Revenue Interest Justified Special Audit Direction',
        'Appointment of CA / Cost Accountant â€“ Name, Firm & Qualification',
        'Period & Scope Defined in Special Audit Order',
        'Documents & Records Provided to Special Auditor (with receipts)',
        'Additional Information / Clarifications Sought by Auditor',
        'Special Audit Report (ADT-04) â€“ Observations & Quantified Findings',
        'Valuation Methodology Adopted by Auditor & Basis of Computation',
        'ITC Discrepancies Highlighted â€“ Blocked Credits, Ineligible Claims',
        'Cost Records Analysis & Transfer Pricing Observations (if any)',
        'Contradictions Between Special Audit & Regular Departmental Audit',
        'Response / Objections Filed by Taxpayer to Audit Findings',
        'Whether Opportunity to Rebut Audit Report Given Before SCN',
        'SCN / Demand Proceedings Initiated Based on Special Audit',
        'Special Auditor Exceeded Scope of Mandate â€“ Specific Instances',
        'Time Limit Compliance â€“ Whether Report Submitted Within 90 Days (Sec 66(4))',
        'Expenses Incurred on Special Audit â€“ Justification & Proportionality',
        'Taxpayer Cooperation Throughout Audit Process',
        'Impact on Business Operations During Audit Period',
        'Parallel Proceedings â€“ Whether Same Issues in Departmental Audit / Investigation'
      ],
      'investigation': [
        'Intelligence Input â€“ Source, Nature & Basis of Investigation (DGGI / State Anti-Evasion)',
        'Investigation Wing & Officers â€“ Names, Designations & Jurisdiction',
        'Summons Issued â€“ Dates, Persons Summoned & Subject Matter (Sec 70)',
        'Statements Recorded â€“ Who, When, Key Admissions & Denials (Sec 70)',
        'Whether Statements Voluntary or Recorded Under Duress / Coercion',
        'Retraction of Statement â€“ Date, Mode & Grounds of Retraction',
        'Search & Seizure Operations â€“ Authorization, Premises, Date (Sec 67)',
        'Documents / Digital Devices / Records Seized â€“ Inventory & Panchnama',
        'Bank Account Scrutiny â€“ Transactions Flagged & Cash Flow Analysis',
        'Third Party Statements & Cross-Verification with Suppliers/Buyers',
        'Allegations â€“ Specific Nature (Tax Evasion / Fake Invoicing / Bogus ITC / Circular Trading)',
        'Supplier Verification â€“ Physical Existence, GST Compliance, Transport Evidence',
        'Buyer Verification â€“ Genuineness of Receipts, Usage in Manufacturing/Trading',
        'Quantification of Alleged Evasion â€“ Department Working & Methodology',
        'ITC Chain Analysis â€“ First Supplier to End Consumer Trail',
        'E-way Bill & Transport Document Verification for Goods Movement',
        'Voluntary Payment / DRC-03 Deposited During Investigation â€“ Amount & Circumstances',
        'Whether Payment Was Under Coercion or Voluntary',
        'SCN Issued under Sec 74 â€“ Specific Demand Heads (Tax, Interest, Penalty)',
        'Arrest / Bail Proceedings (if any) â€“ Sec 69 Compliance',
        'Provisional Attachment of Property (DRC-22) â€“ If Ordered',
        'Corroborative Documentary Evidence vs Mere Statements',
        'Whether Investigation Findings Were Put to Assessee Before SCN',
        'Comparable Cases Where Similar Allegations Were Dropped'
      ],
      'inspection': [
        'Authorization for Inspection â€“ Form GST INS-01 & Signing Authority (Sec 67)',
        'Reason to Believe â€“ Specific Grounds Recorded for Inspection/Search',
        'Details of Premises Inspected / Searched â€“ Address, Type & Ownership',
        'Date, Time & Duration of Inspection / Search',
        'Officers Present â€“ Names, Designations & Independent Witnesses',
        'Goods Found â€“ Description, Quantity, Value & Tax Classification',
        'Whether Goods Were Accounted in Books & Returns',
        'Documents Seized â€“ Physical Files, Digital Records, Hard Drives',
        'Panchnama Prepared â€“ Whether As Per Statutory Requirements of Sec 67(5)',
        'Statements Recorded During Inspection â€“ Persons & Key Depositions',
        'Stock Verification â€“ Physical Count vs Book Stock Reconciliation',
        'Goods Detained â€“ MOV-06 Order of Detention & Grounds',
        'Seizure Order â€“ Whether Sec 67(2) Conditions Fulfilled',
        'Provisional Release of Goods on Bond/Security â€“ Terms & Conditions',
        'Provisional Attachment of Property/Bank Account (DRC-22) â€“ Justification',
        'Follow-up SCN â€“ Whether Issued Within Statutory Timeline After Seizure',
        'Confiscation Proceedings under Sec 130 â€“ Grounds & Penalty Imposed',
        'Release Application Filed & Department Response',
        'Impact on Business â€“ Stock Shortage, Revenue Loss During Detention',
        'Whether Inspection Was Based on Valid Intelligence / Bonafide Belief',
        'Cross-verification of Seized Documents with Returns Filed',
        'Photographic / Video Evidence Collected During Inspection'
      ],
      'eway-detention': [
        'Goods Being Transported â€“ Description, HSN, Quantity & Value',
        'E-Way Bill Details â€“ EBN Number, Date of Generation, Validity & Route',
        'Tax Invoice / Bill of Supply / Delivery Challan Accompanying Goods',
        'Vehicle & Conveyance Details â€“ Registration, Driver, Transporter',
        'Consignor & Consignee Details â€“ GSTIN, Address & Authorization',
        'Interception Details â€“ Exact Place, Date, Time & Intercepting Officer',
        'MOV-02 Order of Physical Verification & Officer Who Ordered',
        'MOV-04 Physical Verification Report â€“ Discrepancies Found',
        'Nature of Discrepancy â€“ Part A vs Part B, Qty Mismatch, Document Shortage',
        'Whether Discrepancy Is Minor / Technical or Substantive',
        'MOV-06 Detention Order â€“ Date, Grounds & Tax + Penalty Computed',
        'MOV-07 Notice for Payment of Tax & Penalty â€“ Amount Demanded',
        'Tax & Penalty Computation under Sec 129(1)(a) or 129(1)(b)',
        'Whether Goods Are Exempted Under Any Notification â€“ E-way Bill Exemption',
        'Response Filed by Owner / Transporter / Driver',
        'Payment Made Under Protest & MOV-05 Release Order',
        'MOV-09 Order of Demand & Penalty â€“ Final Determination',
        'MOV-11 Confiscation and Penalty â€“ If Sec 130 Invoked',
        'Vehicle Breakdown / Route Deviation â€“ Evidence & Justification',
        'E-Way Bill Extended / Re-generated â€“ Timeline & Validity',
        'Goods Duly Recorded in Books & Tax Accounted in Returns',
        'Transport Documents â€“ LR, GR, Weighment Slip, Delivery Confirmation',
        'Previous Clean Transit Record â€“ No Prior Detention History',
        'Appeal Filed Against Detention / Penalty Order â€“ Timeline & Grounds',
        'Whether Sec 129 Proceedings Completed Within Statutory Time (14 days)'
      ],
      'data-mismatch': [
        'GSTN System Alert â€“ Type of Mismatch & Auto-Generated Report',
        'Data Analytics Trigger â€“ BIFA / ADVAIT / Return Scrutiny Tool Used',
        'Type of Mismatch â€“ Outward Turnover (GSTR-1 vs 3B)',
        'Type of Mismatch â€“ ITC Claimed (GSTR-3B vs 2A/2B)',
        'Type of Mismatch â€“ HSN Summary vs Actual Tax Rate Applied',
        'Type of Mismatch â€“ GSTR-9/9C Annual Return vs Monthly Returns',
        'Period-wise Quantum of Mismatch â€“ Month/Quarter-wise Breakup',
        'DRC-01A Intimation Notice â€“ Whether Issued Before SCN',
        'Response Filed to DRC-01A â€“ Reconciliation Explanation',
        'Turnover Reconciliation â€“ GSTR-1 vs GSTR-3B vs Books vs GSTR-9',
        'ITC Reconciliation â€“ GSTR-2A/2B vs GSTR-3B vs Purchase Register',
        'Timing Differences â€“ Invoices Reported in Different Return Periods',
        'Credit Notes / Debit Notes Impact on Reported Figures',
        'Advances Received & Tax Paid vs Adjusted Against Supplies',
        'Export Turnover â€“ LUT vs IGST Refund Route Bifurcation',
        'SEZ / Deemed Export Supplies â€“ Zero-Rated Treatment Verification',
        'Composition Dealer Transition Period Adjustments (if any)',
        'Documentary Evidence Supporting Each Reconciled Difference',
        'Department Acceptance of Partially Reconciled Items',
        'SCN under Sec 73/74 â€“ Demand on Remaining Unreconciled Differences',
        'Whether Department Applied GSTR-2A/2B Data Correctly (Cut-off Dates)',
        'Supplier-Level Breakup of ITC Mismatch â€“ Top Disputed Suppliers',
        'Auto-Population Errors by GSTN Portal â€“ Evidence of System Glitches'
      ],
      'refund': [
        'Type of Refund â€“ Export (with/without IGST), Inverted Duty, Excess Balance, Deemed Export',
        'Refund Application â€“ RFD-01 Details, Date Filed, Amount Claimed & ARN',
        'Grounds & Legal Basis for Refund Claim (Sec 54 / Rule 89)',
        'Computation of Refund â€“ Formula Applied (Rule 89(4) or 89(5)) with Working',
        'Supporting Documents Filed â€“ Statement 3/3A/3B, Invoice Lists',
        'For Exports â€“ Shipping Bills, BRC, FIRC, Let Export Orders',
        'For Inverted Duty â€“ HSN-wise Input-Output Tax Rate Comparison',
        'Turnover of Zero-Rated Supplies vs Adjusted Total Turnover',
        'ITC Availed on Inputs & Input Services â€“ Net ITC After Reversals',
        'Acknowledgement (RFD-02) / Deficiency Memo (RFD-03) â€“ Timeline',
        'Response to Deficiency Memo & Resubmission with Fresh Application',
        'Provisional Refund under Sec 54(6) â€“ 90% Sanctioned & Balance Pending',
        'Verification by Proper Officer â€“ Site Visit, Document Scrutiny, Observations',
        'Unjust Enrichment â€“ CA Certificate / Cost Accountant Certificate Submitted',
        'Whether Incidence of Tax Passed On to Customer â€“ Documentary Proof',
        'Relevant Date Computation under Explanation to Sec 54 â€“ Last Date Verification',
        'RFD-06 (Provisional Refund Order) & RFD-04 (Provisional Refund Payment)',
        'Final Order â€“ RFD-06 (Sanction) / RFD-08 (Rejection) with Reasons',
        'Interest on Delayed Refund â€“ Sec 56 Applicability (6% / 9%)',
        'Partial Rejection â€“ Specific Heads Disallowed & Reasons',
        'Appeal Against Rejection / Short Sanction â€“ Timeline & Grounds',
        'Refund Withheld under Sec 54(11) â€“ Pending Assessment / Demand',
        'Circular 125/44/2019-GST & Circular 135/05/2020-GST Compliance'
      ],
      'registration': [
        'GST Registration History â€“ REG-06 Certificate, Effective Date & State Code',
        'Constitutional Category â€“ Proprietor / Partnership / LLP / Pvt Ltd / Trust',
        'Principal Place of Business & Additional Places â€“ Verification Status',
        'Compliance Record â€“ GSTR-1, GSTR-3B Filing Status (Period-wise)',
        'Tax Payment Track Record â€“ Any Outstanding Demands / Dues',
        'Trigger for Cancellation â€“ Non-Filing / Fraud / Voluntary / Suo Motu',
        'REG-17 SCN for Cancellation â€“ Date, Grounds Cited & Reply Timeline',
        'Specific Grounds Invoked â€“ Sec 29(2)(a)/(b)/(c)/(d)/(e)',
        'Reply Filed to REG-17 â€“ Submissions & Supporting Documents',
        'Whether Adequate Opportunity of Being Heard Was Provided',
        'REG-19 Cancellation Order â€“ Date, Retrospective Effect & Reasons',
        'Whether Retrospective Cancellation Justified â€“ Impact Analysis',
        'REG-21 Revocation Application â€“ Date Filed, Within 30/90 Days Limit',
        'Extension of Revocation Period â€“ High Court / CBIC Circular Directions',
        'Pending Tax Dues Cleared Before Revocation Application',
        'All Pending Returns Filed Up to Date of Cancellation',
        'Department Response to Revocation â€“ Acceptance / Rejection / Silence',
        'Impact on ITC of Buyers/Recipients â€“ Sec 18(6) Reversal',
        'Impact on Ongoing Contracts, Purchase Orders & Business Operations',
        'Writ Petition Filed Against Cancellation (if any) â€“ HC Order',
        'CBIC Instructions / Circulars Allowing Condonation of Delay',
        'Amnesty Scheme â€“ Whether Applied for Revocation Under Special Window'
      ]
    };

    // Build master list of ALL origin-specific fact names (to identify system-injected ones)
    const allOriginFacts = new Set();
    Object.values(originSpecificFacts).forEach(list => list.forEach(name => allOriginFacts.add(name)));

    // Remove facts that belong to OTHER origins (keep user-added specific facts)
    const currentOriginFacts = c.caseOrigin && originSpecificFacts[c.caseOrigin] ? new Set(originSpecificFacts[c.caseOrigin]) : new Set();
    const beforeSpecificLen = c.facts.length;
    c.facts = c.facts.filter(f => {
      // Keep all general facts
      if (f.category === 'general') return true;
      // Keep user-added specific facts (not in any origin list)
      if (!allOriginFacts.has(f.name)) return true;
      // Keep facts that belong to the CURRENT origin
      if (currentOriginFacts.has(f.name)) return true;
      // Remove facts from OTHER origins
      return false;
    });
    if (c.facts.length !== beforeSpecificLen) needsSave = true;

    // Now inject current origin's specific facts (if not already present)
    if (c.caseOrigin && originSpecificFacts[c.caseOrigin]) {
      const specificDefaults = originSpecificFacts[c.caseOrigin];
      specificDefaults.forEach((name) => {
        if (!c.facts.some(f => f.name === name)) {
          c.facts.push({
            sr: 0, name: name, applicable: false, taken: false, category: 'specific'
          });
          needsSave = true;
        }
      });
    }

    c.facts.forEach((g, idx) => {
      if (g.sr !== idx + 1) { g.sr = idx + 1; needsSave = true; }
    });
  }

  // Data Migration for Documents â€” origin-specific auto-injection
  if (c.documents) {
    const originSpecificDocuments = {
      'return-scrutiny': [
        'GSTR-1 (Outward Supplies)',
        'GSTR-3B (Summary Return)',
        'GSTR-9 (Annual Return)',
        'GSTR-9C (Reconciliation Statement)',
        'ASMT-10 (Scrutiny Notice)',
        'Reply to ASMT-10',
        'Books of Accounts & Ledgers',
        'E-Ledger Extracts (Cash, Credit, Liability)',
        'Turnover Reconciliation Statement',
        'ITC Reconciliation (GSTR-2A/2B vs 3B)'
      ],
      'dept-audit': [
        'Audit Initiation Letter (ADT-01)',
        'Audit Query Memo / Points of Objection',
        'Books of Accounts & Trial Balance',
        'Purchase & Sales Registers',
        'ITC Register & Supporting Invoices',
        'Stock Register / Inventory Records',
        'Bank Statements (Relevant Period)',
        'Final Audit Report (FAR / ADT-04)',
        'Reply to Audit Observations',
        'Reconciliation Statement Filed'
      ],
      'special-audit': [
        'Direction Order for Special Audit (Sec 66)',
        'Appointment Letter of CA / Cost Accountant',
        'Books of Accounts Provided to Auditor',
        'Valuation Records & Working Sheets',
        'Special Audit Report (ADT-04)',
        'Objections / Response to Audit Findings',
        'Cost Records & Cost Audit Reports',
        'Transfer Pricing Documents (if applicable)',
        'ITC Working Papers & Reconciliation',
        'Correspondence with Special Auditor'
      ],
      'investigation': [
        'Summons Copy (Sec 70)',
        'Recorded Statements (Sec 70)',
        'Retraction Affidavit (if statement retracted)',
        'Seized Documents Inventory',
        'Bank Statements & Transaction Records',
        'Purchase Invoices & GRN / Weighment Slips',
        'E-Way Bills & Transport Documents',
        'DRC-03 (Voluntary Payment Challan)',
        'Correspondence with Investigation Wing',
        'CA Certificate / Chartered Engineer Report'
      ],
      'inspection': [
        'Authorization for Inspection / Search (Sec 67)',
        'Panchnama / Mahazar',
        'Seizure Memo & Inventory of Seized Goods',
        'Provisional Release Order / Bond',
        'Statements Recorded During Inspection',
        'Photographs / Video Evidence of Premises',
        'Stock Verification Report',
        'Order of Provisional Attachment (DRC-22)',
        'Release Application & Response',
        'Correspondence with Jurisdictional Officer'
      ],
      'eway-detention': [
        'E-Way Bill (EWB-01 / EWB-02)',
        'Tax Invoice / Bill of Supply / Delivery Challan',
        'Lorry Receipt / Transport Documents',
        'MOV-02 (Order of Physical Verification)',
        'MOV-04 (Physical Verification Report)',
        'MOV-06 (Detention Order)',
        'MOV-07 (Notice for Tax & Penalty)',
        'MOV-09 (Order of Demand & Penalty)',
        'DRC-03 (Payment Challan under Protest)',
        'Vehicle Registration & Driver Documents'
      ],
      'data-mismatch': [
        'GSTR-1 & GSTR-3B (Relevant Periods)',
        'GSTR-2A / GSTR-2B (Auto-Generated)',
        'DRC-01 / DRC-01A (Intimation Notice)',
        'Reply to DRC-01A Intimation',
        'Turnover Reconciliation Working',
        'ITC Reconciliation Working (2A/2B vs 3B)',
        'Credit Notes & Debit Notes Register',
        'HSN-wise Summary & Tax Rate Working',
        'E-Commerce TCS Reconciliation (if applicable)',
        'Books of Accounts Extracts'
      ],
      'refund': [
        'RFD-01 (Refund Application)',
        'RFD-03 (Deficiency Memo â€“ if received)',
        'Statement of Invoices (Annexure)',
        'CA / Cost Accountant Certificate',
        'Shipping Bills / BRC / FIRC (for exports)',
        'Bank Realization Certificate',
        'Undertaking / Declaration of No Unjust Enrichment',
        'GSTR-1, GSTR-3B, GSTR-2A for refund period',
        'ITC Ledger & Inverted Duty Computation',
        'RFD-06 (Provisional Refund Order â€“ if any)'
      ],
      'registration': [
        'GST Registration Certificate (REG-06)',
        'REG-17 (SCN for Cancellation)',
        'Reply to REG-17',
        'REG-19 (Order of Cancellation)',
        'REG-21 (Application for Revocation)',
        'REG-05 (Rejection Order â€“ if applicable)',
        'Returns Filed (GSTR-3B, GSTR-1) â€“ proof of compliance',
        'Bank Statements & Business Activity Proof',
        'Electricity Bill / Rent Agreement of Business Premises',
        'All Pending Tax Dues Payment Challans'
      ]
    };

    // Ensure all documents have required properties
    c.documents.forEach(d => {
      if (d.category === undefined) d.category = 'common';
    });

    // Build master list of all origin-specific document names
    const allOriginDocs = new Set();
    Object.values(originSpecificDocuments).forEach(list => list.forEach(name => allOriginDocs.add(name)));

    // Remove documents from OTHER origins (keep common and user-added)
    const currentOriginDocs = c.caseOrigin && originSpecificDocuments[c.caseOrigin] ? new Set(originSpecificDocuments[c.caseOrigin]) : new Set();
    const beforeDocsLen = c.documents.length;
    c.documents = c.documents.filter(d => {
      if (d.category === 'common' || !d.category) return true;
      if (!allOriginDocs.has(d.name)) return true;
      if (currentOriginDocs.has(d.name)) return true;
      return false;
    });
    if (c.documents.length !== beforeDocsLen) needsSave = true;

    // Inject current origin's specific documents
    if (c.caseOrigin && originSpecificDocuments[c.caseOrigin]) {
      originSpecificDocuments[c.caseOrigin].forEach((name) => {
        if (!c.documents.some(d => d.name === name)) {
          c.documents.push({ sr: 0, name: name, physical: false, soft: false, na: false, category: 'origin' });
          needsSave = true;
        }
      });
    }

    // Fix all document serial numbers
    c.documents.forEach((d, idx) => {
      if (d.sr !== idx + 1) { d.sr = idx + 1; needsSave = true; }
    });
  }

  // Persist the migrated data to Db so toggle functions don't crash
  if (needsSave) {
    const cases = DB.getArr('cases');
    const idx = cases.findIndex(x => x.id === id);
    if (idx !== -1) {
      cases[idx] = c;
      DB.set('cases', cases);
    }
  }

  // Find linked client
  const clients = DB.getArr('clients');
  const linkedClient = clients.find(cl => cl.id === c.clientId || (c.gstin && cl.gstin === c.gstin));

  const clDone = c.checklist.filter(s => s.status === 'done').length;
  const clTotal = c.checklist.length;
  const stageMeta = getCaseStageMeta(c.status);
  const stageGroup = CASE_STAGE_GROUPS.find(g => g.id === stageMeta.groupId) || CASE_STAGE_GROUPS[0];
  const stageGroupStages = stageGroup.stages || [];
  const dueDays = c.dueDate ? daysFromNow(c.dueDate) : null;
  const totalDemandValue = c.totalAmount || (c.demandAmount || 0) + (c.penaltyAmount || 0) + (c.interestAmount || 0) + (c.otherAmount || 0);
  const collectedValue = c.amountCollected || 0;
  const currentStageIndex = Math.max(0, stageGroupStages.findIndex(s => s.id === stageMeta.id));
  const primaryHearingDate = getCasePrimaryHearingDate(c);
  const controlProfile = getLitigationControlProfile(c);
  const timelineMilestoneCount = [
    c.scnDate,
    c.onlineFilingDate,
    c.physicalSubmitDate,
    primaryHearingDate,
    c.oioDate,
    c.oiaDate,
    c.oiaCommDate,
    c.gstatAppealDate,
    c.gstatOrderDate,
    c.hcPetitionDate,
    c.hcOrderDate,
    c.scPetitionDate,
    c.scOrderDate
  ].filter(Boolean).length;
  const nextAnchor = c.dueDate || primaryHearingDate || c.oioCommDate || c.scnCommDate || '';
  const caseOriginLabels = { 'return-scrutiny': 'Return Scrutiny (Sec 61)', 'dept-audit': 'Departmental Audit (Sec 65)', 'special-audit': 'Special Audit (Sec 66)', 'investigation': 'Investigation by Intelligence', 'inspection': 'Inspection / Search / Seizure (Sec 67)', 'eway-detention': 'E-Way Bill / Detention of Goods', 'data-mismatch': 'Data Analytics / System Mismatch', 'refund': 'Refund Proceedings (Sec 54)', 'registration': 'Registration Proceedings' };
  const caseOriginDescriptions = { 'return-scrutiny': 'Cases arising from scrutiny of GST returns where discrepancies are noticed in GSTR-1, GSTR-3B or annual returns. Proceedings generally begin with FORM GST ASMT-10.', 'dept-audit': 'Matters originating from audit conducted by GST officers examining books of accounts, ITC, valuation, and tax payment. Audit objections frequently result in issuance of SCN.', 'special-audit': 'Cases where the department directs a special audit through a CA or Cost Accountant when valuation, ITC or accounts are complex.', 'investigation': 'Litigation arising from investigations by DGGI or State anti-evasion units on suspicion of tax evasion, fake invoicing or fraudulent ITC.', 'inspection': 'Proceedings originating from enforcement actions where officers inspect business premises, verify records or seize goods and documents.', 'eway-detention': 'Cases starting from interception of goods in transit where proceedings are initiated under Sections 129 or 130 for detention, penalty or confiscation.', 'data-mismatch': 'Matters triggered through GSTN or departmental analytics detecting discrepancies such as turnover mismatch, ITC mismatch with GSTR-2A/2B.', 'refund': 'Disputes arising when refund claims filed by the taxpayer are rejected or partially sanctioned after departmental verification.', 'registration': 'Litigation arising from cancellation of GST registration, rejection of revocation applications, or refusal of registration.' };

  function dateOrDash(d) { return d ? fmtDate(d) : '&mdash;'; }

  // Render full page case file
  document.getElementById('app-content').innerHTML = `
  <div class="page-header">
    <div class="page-header-row">
      <div>
        <button class="btn btn-ghost btn-sm" onclick="App.navigate('cases')" style="margin-bottom:6px"><i class="fas fa-arrow-left"></i> Back to Cases</button>
        <div class="page-title">${c.legalName || c.taxpayerName}${c.tradeName && c.tradeName !== (c.legalName || c.taxpayerName) ? ` <span style="font-size:13px;font-weight:400;color:var(--text-muted)">(${c.tradeName})</span>` : ''} <span class="badge badge-${getCaseStageBadgeColor(c.status)}" style="font-size:11px;vertical-align:middle">${stageMeta.label}</span></div>
        <div class="page-subtitle">${c.caseNo} &middot; GSTIN: ${c.gstin} &middot; Sec ${c.section} &middot; ${c.assignmentTypeLabel || 'Reply to SCN'}</div>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-outline btn-sm" onclick="App.navigate('pipeline')"><i class="fas fa-columns"></i> Open Pipeline</button>
        <button class="btn btn-primary btn-sm" onclick="openEditCase('${c.id}')"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn btn-ghost btn-sm" onclick="deleteCase('${c.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  </div>

  <!-- Tab Navigation -->
  <div class="cf-tabs">
    <button class="cf-tab active" data-cftab="cf-tab-1"><i class="fas fa-briefcase"></i><span>Assignment</span></button>
    <button class="cf-tab" data-cftab="cf-tab-2"><i class="fas fa-tasks"></i><span>Checklist <em class="cf-tab-badge">${clDone}/${clTotal}</em></span></button>
    <button class="cf-tab" data-cftab="cf-tab-3"><i class="fas fa-file-alt"></i><span>Details</span></button>
    <button class="cf-tab" data-cftab="cf-tab-4"><i class="fas fa-sticky-note"></i><span>Notes</span></button>
    <button class="cf-tab" data-cftab="cf-tab-6"><i class="fas fa-clipboard-list"></i><span>Pending</span></button>
    <button class="cf-tab" data-cftab="cf-tab-13"><i class="fas fa-rupee-sign"></i><span>Payments</span></button>
    <button class="cf-tab" data-cftab="cf-tab-14"><i class="fas fa-gavel"></i><span>Hearings</span></button>
  </div>

  <!-- TAB 1: Assignment Details -->
  <div class="cf-tab-content active" id="cf-tab-1">
    <div class="card">
      <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
        <button class="btn btn-primary btn-sm" onclick="openEditCase('${c.id}')"><i class="fas fa-edit"></i> Edit Assignment Details</button>
      </div>
      <div class="cf-detail-grid">
        <div class="cf-detail-item"><span class="cf-detail-label">Legal Name</span><span class="cf-detail-value">${c.legalName || c.taxpayerName} ${linkedClient ? `<button class="btn btn-ghost btn-sm" onclick="App.navigate('clients'); setTimeout(() => openClientDetail('${linkedClient.id}'), 100)" title="View Client Profile"><i class="fas fa-user-circle"></i></button>` : ''}</span></div>
        ${c.tradeName && c.tradeName !== c.legalName ? `<div class="cf-detail-item"><span class="cf-detail-label">Trade Name</span><span class="cf-detail-value">${c.tradeName}</span></div>` : ''}
        <div class="cf-detail-item" style="grid-column: span 2;"><span class="cf-detail-label">Client Address</span><span class="cf-detail-value">${c.clientAddress || '&mdash;'}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">GSTIN / PAN</span><span class="cf-detail-value font-mono">${c.gstin}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">Allotted To</span><span class="cf-detail-value">${resolveEmployeeName(c.allottedTo)}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">ITN</span><span class="cf-detail-value">${c.itn || '&mdash;'}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">Contact Name</span><span class="cf-detail-value">${c.contactName || '&mdash;'}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">Mobile</span><span class="cf-detail-value">${c.mobile || '&mdash;'}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">E-mail</span><span class="cf-detail-value">${c.email || '&mdash;'}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">Reference</span><span class="cf-detail-value">${c.reference || '&mdash;'}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">Assignment Type</span><span class="cf-detail-value"><span class="badge badge-blue">${c.assignmentTypeLabel || 'Reply to SCN'}</span></span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">Priority</span><span class="cf-detail-value"><span class="badge badge-${c.priority === 'critical' ? 'red' : c.priority === 'high' ? 'orange' : c.priority === 'medium' ? 'blue' : 'gray'}">${c.priority || 'medium'}</span></span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">Date of Receipt</span><span class="cf-detail-value">${dateOrDash(c.receiptDate)}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">Commitment Date</span><span class="cf-detail-value">${dateOrDash(c.commitDate)}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">Due Date</span><span class="cf-detail-value cf-highlight">${dateOrDash(c.dueDate)}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">Bill No. &amp; Date</span><span class="cf-detail-value">${c.billRef || '&mdash;'}</span></div>
      </div>
      ${c.issue ? `<div style="margin-top:16px;background:var(--bg2);border-radius:8px;padding:14px"><span class="text-muted text-xs">ISSUE SUMMARY</span><div style="font-size:13px;margin-top:6px;line-height:1.7">${c.issue}</div></div>` : ''}
    </div>
  </div>

  <!-- TAB 2: Checklist -->
  <div class="cf-tab-content" id="cf-tab-2">
    <div class="card">
      <b style="font-size:14px;display:block;margin-bottom:16px"><i class="fas fa-tasks text-gold"></i> Workflow Checklist</b>
      <div class="cf-progress-bar"><div class="cf-progress-fill" style="width:${(clDone / clTotal * 100)}%"></div></div>
      <div class="text-muted text-xs" style="margin-bottom:16px">${clDone} of ${clTotal} stages completed</div>
      <div id="cf-checklist-list">
        ${c.checklist.map((s, i) => `<div class="cf-cl-row ${s.status}">
          <div class="cf-cl-code">${s.code}</div>
          <div class="cf-cl-name">${s.name}</div>
          <div class="cf-cl-level"><span class="badge badge-gray">${s.level}</span></div>
          <select class="form-select cf-cl-dropdown" data-idx="${i}" onchange="saveChecklist('${c.id}')" style="width: 140px; padding: 4px 8px; font-size: 13px;">
            <option value="pending" ${s.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="in-progress" ${s.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="done" ${s.status === 'done' ? 'selected' : ''}>Done</option>
          </select>
        </div>`).join('')}
      </div>
      <div style="margin-top: 16px; text-align: right;">
        <button class="btn btn-primary btn-sm" onclick="saveChecklist('${c.id}')"><i class="fas fa-save"></i> Save Checklist</button>
      </div>
    </div>
  </div>

  <!-- TAB 3: Basic Details -->
  <div class="cf-tab-content" id="cf-tab-3">
    <div class="card mb-4 cf-spotlight-card">
      <div class="cf-spotlight-grid">
        <div>
          <div class="cf-spotlight-label">Current pipeline stage</div>
          <div class="cf-spotlight-title">${stageMeta.label}</div>
          <div class="cf-spotlight-copy">${stageMeta.groupLabel} &middot; ${stageMeta.subLabel || 'Stage metadata not yet captured'}</div>
          <div class="cf-stage-strip">
            ${stageGroupStages.map((stage, index) => `
              <div class="cf-stage-node ${index < currentStageIndex ? 'done' : index === currentStageIndex ? 'active' : ''}">
                <span class="cf-stage-node-step">${index + 1}</span>
                <span class="cf-stage-node-text">${stage.shortLabel || stage.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="cf-spotlight-side">
          <div class="cf-mini-stat">
            <span class="cf-mini-stat-label">Exposure</span>
            <span class="cf-mini-stat-value">${fmtINR(totalDemandValue)}</span>
          </div>
          <div class="cf-mini-stat">
            <span class="cf-mini-stat-label">Collected</span>
            <span class="cf-mini-stat-value">${fmtINR(collectedValue)}</span>
          </div>
          <div class="cf-mini-stat">
            <span class="cf-mini-stat-label">Due window</span>
            <span class="cf-mini-stat-value">${dueDays === null ? 'No due date' : dueDays < 0 ? Math.abs(dueDays) + 'd overdue' : dueDays === 0 ? 'Due today' : dueDays + 'd left'}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-4 litigation-control-card">
      <div class="litigation-control-head">
        <div>
          <div class="litigation-eyebrow">GST litigation expert review</div>
          <div class="litigation-title">Control position: ${controlProfile.risk.label}</div>
          <div class="litigation-copy">${controlProfile.nextAction}</div>
        </div>
        <div class="litigation-score ${controlProfile.risk.tone}">
          <span>${controlProfile.score}</span>
          <small>risk score</small>
        </div>
      </div>
      <div class="litigation-control-grid">
        <div class="litigation-control-panel">
          <span class="litigation-panel-label">Contingent liability</span>
          <b>${controlProfile.classification}</b>
          <small>Suggested provision: ${fmtINR(controlProfile.provisionAmount)}</small>
        </div>
        <div class="litigation-control-panel">
          <span class="litigation-panel-label">Outstanding exposure</span>
          <b>${fmtINR(controlProfile.outstanding)}</b>
          <small>Paid / collected: ${fmtINR(controlProfile.paid)}</small>
        </div>
        <div class="litigation-control-panel">
          <span class="litigation-panel-label">Pre-deposit</span>
          <b>${controlProfile.preDeposit.applicable ? fmtINR(controlProfile.preDeposit.pending) + ' pending' : 'Not triggered'}</b>
          <small>${controlProfile.preDeposit.applicable ? Math.round(controlProfile.preDeposit.rate * 100) + '% statutory check' : 'Applies at appeal / GSTAT stages'}</small>
        </div>
      </div>
      <div class="litigation-work-grid">
        <div>
          <div class="litigation-list-title"><i class="fas fa-clock"></i> Statutory clocks</div>
          ${controlProfile.limitationItems.length ? controlProfile.limitationItems.slice(0, 3).map(item => `
            <div class="litigation-row ${item.tone}">
              <span>${item.label}<small>${item.reference}</small></span>
              <b>${item.days < 0 ? Math.abs(item.days) + 'd overdue' : item.days === 0 ? 'Today' : item.days + 'd left'}</b>
            </div>
          `).join('') : '<div class="litigation-empty">No active statutory clock recorded.</div>'}
        </div>
        <div>
          <div class="litigation-list-title"><i class="fas fa-folder-open"></i> Document controls</div>
          ${controlProfile.documentGaps.length ? controlProfile.documentGaps.slice(0, 4).map(gap => `
            <div class="litigation-row warning">
              <span>${gap}<small>Required for audit trail / filing pack</small></span>
              <b>Open</b>
            </div>
          `).join('') : '<div class="litigation-empty">Core document checklist looks controlled.</div>'}
        </div>
      </div>
    </div>

    <div class="card mb-4">
      <b style="font-size:14px;display:block;margin-bottom:14px"><i class="fas fa-crosshairs text-purple"></i> Case Origin Category</b>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <span class="badge badge-purple" style="font-size:12px;padding:6px 14px">${c.caseOrigin ? (caseOriginLabels[c.caseOrigin] || 'Not Selected') : 'Not Selected'}</span>
      </div>
      ${c.caseOrigin ? `<div style="background:var(--bg2);border-radius:8px;padding:14px;font-size:13px;line-height:1.7;color:var(--text)">${caseOriginDescriptions[c.caseOrigin] || ''}</div>` : '<div class="text-muted text-sm" style="padding:8px">No case origin selected yet. Use Edit to select one.</div>'}
    </div>
    <div class="card mb-4">
      <b style="font-size:14px;display:block;margin-bottom:14px"><i class="fas fa-rupee-sign text-gold"></i> Amount Involved</b>
      <div class="cf-amt-cards">
        <div class="cf-amt-card"><div class="cf-amt-label">Tax</div><div class="cf-amt-value">${fmtINR(c.demandAmount || 0)}</div></div>
        <div class="cf-amt-card"><div class="cf-amt-label">Penalty</div><div class="cf-amt-value orange">${fmtINR(c.penaltyAmount || 0)}</div></div>
        <div class="cf-amt-card"><div class="cf-amt-label">Interest</div><div class="cf-amt-value blue">${fmtINR(c.interestAmount || 0)}</div></div>
        <div class="cf-amt-card"><div class="cf-amt-label">Other</div><div class="cf-amt-value">${fmtINR(c.otherAmount || 0)}</div></div>
        <div class="cf-amt-card total"><div class="cf-amt-label">TOTAL</div><div class="cf-amt-value gold">${fmtINR(c.totalAmount || (c.demandAmount || 0) + (c.penaltyAmount || 0) + (c.interestAmount || 0) + (c.otherAmount || 0))}</div></div>
      </div>
      ${c.yearWiseData && c.yearWiseData.length > 0 ? `
      <div style="overflow-x:auto;margin-top:16px;border-top:1px solid var(--border);padding-top:16px">
        <b style="font-size:12px;display:block;margin-bottom:10px;text-transform:uppercase;color:var(--text-muted)">Year-wise Breakdown</b>
        <table class="data-table" style="width:100%;margin-bottom:0">
          <thead>
            <tr>
              <th style="font-size:11px">Financial Year</th>
              <th style="font-size:11px;text-align:right">Tax (â‚¹)</th>
              <th style="font-size:11px;text-align:right">Interest (â‚¹)</th>
              <th style="font-size:11px;text-align:right">Penalty (â‚¹)</th>
              <th style="font-size:11px;text-align:right">Total (â‚¹)</th>
            </tr>
          </thead>
          <tbody>
            ${c.yearWiseData.map(y => `
              <tr>
                <td>${y.period}</td>
                <td style="text-align:right">${fmtINR(y.tax || 0)}</td>
                <td style="text-align:right">${fmtINR(y.interest || 0)}</td>
                <td style="text-align:right">${fmtINR(y.penalty || 0)}</td>
                <td style="text-align:right;font-weight:700">${fmtINR((y.tax || 0) + (y.interest || 0) + (y.penalty || 0))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>` : ''}
    </div>
    <div class="card mb-4">
      <div class="cf-detail-shell">
        <div class="cf-detail-block">
          <div class="cf-detail-block-title"><i class="fas fa-diagram-project"></i> Register to Pipeline Mapping</div>
          <div class="cf-stage-pills">
            <span class="badge badge-${getCaseStageBadgeColor(c.status)}">${stageMeta.label}</span>
            <span class="badge badge-gray">${stageMeta.groupLabel}</span>
            ${stageMeta.subLabel ? `<span class="badge badge-blue">${stageMeta.subLabel}</span>` : ''}
          </div>
          <div class="cf-detail-copy">The case register, detail page, and pipeline now read this matter from the same stage model. Moving the case in pipeline should be reflected here and in register filters.</div>
        </div>
        <div class="cf-detail-block">
          <div class="cf-detail-block-title"><i class="fas fa-bolt"></i> Quick routing</div>
          <div class="cf-action-row">
            <button class="btn btn-outline btn-sm" onclick="App.navigate('pipeline')"><i class="fas fa-columns"></i> View Pipeline</button>
            <button class="btn btn-outline btn-sm" onclick="openEditCase('${c.id}')"><i class="fas fa-pen"></i> Edit Case</button>
            <button class="btn btn-outline btn-sm" onclick="document.querySelector('[data-cftab=cf-tab-14]').click()"><i class="fas fa-gavel"></i> Open Hearings</button>
          </div>
        </div>
      </div>
    </div>
    <div class="card mb-4">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <b style="font-size:14px"><i class="fas fa-stream text-blue" style="margin-right:8px"></i>Key Dates &amp; Timeline</b>
        <span class="badge badge-${getCaseStageBadgeColor(c.status)}">${stageMeta.label}</span>
      </div>

      <div class="kd-overview">
        <div class="kd-overview-card">
          <span class="kd-overview-label">Milestones captured</span>
          <span class="kd-overview-value">${timelineMilestoneCount}</span>
          <span class="kd-overview-note">Across register, hearings, and appeal flow</span>
        </div>
        <div class="kd-overview-card">
          <span class="kd-overview-label">Primary hearing anchor</span>
          <span class="kd-overview-value">${primaryHearingDate ? fmtDate(primaryHearingDate) : 'Not logged'}</span>
          <span class="kd-overview-note">Pipeline PH updates now sync here automatically</span>
        </div>
        <div class="kd-overview-card">
          <span class="kd-overview-label">Next date in focus</span>
          <span class="kd-overview-value">${nextAnchor ? fmtDate(nextAnchor) : 'No date available'}</span>
          <span class="kd-overview-note">${c.dueDate ? 'Due date takes priority for follow-up tracking' : 'Add a due date or hearing to strengthen reminders'}</span>
        </div>
      </div>

      <div class="timeline-container">
      <!-- ADJUDICATION STAGE -->
      <div class="stage-divider" style="--kd-accent:#f59e0b"><span>Adjudication Stage</span></div>

      <!-- Row 0: Case Basics -->
      <div class="kd-group timeline-item active" style="--kd-accent:#6366f1">
        <div class="timeline-dot"></div>
        <div class="kd-group-header">
          <i class="fas fa-info-circle"></i>
          <b>Case Basics</b>
        </div>
        <div class="kd-grid">
          <div class="kd-item"><span class="kd-label">Section Invoked</span><span class="kd-val"><span class="badge badge-blue" style="font-size:11px">Sec ${c.section}</span></span></div>
          <div class="kd-item"><span class="kd-label">Period Involved</span><span class="kd-val">${c.period || '<em class="text-muted">â€”</em>'}</span></div>
          <div class="kd-item"><span class="kd-label">Case No. / Reference</span><span class="kd-val font-mono" style="font-size:12px">${c.caseNo || '<em class="text-muted">â€”</em>'}</span></div>
        </div>
        <div class="kd-sub-note"><i class="fas fa-fingerprint"></i> Primary identification details for the litigation case.</div>
      </div>

      <!-- SCN â€“ DRC-01 -->
      <div class="kd-group timeline-item ${c.scnDate ? 'active' : ''}" style="--kd-accent:#f59e0b">
        <div class="timeline-dot"></div>
        <div class="kd-group-header">
          <i class="fas fa-envelope-open-text"></i>
          <b>SCN &ndash; DRC-01</b>
        </div>
        <div class="kd-grid">
          <div class="kd-item"><span class="kd-label">Date of SCN</span><span class="kd-val ${c.scnDate ? 'kd-has-val' : ''}">${dateOrDash(c.scnDate)}</span></div>
          <div class="kd-item"><span class="kd-label">Communication Date</span><span class="kd-val ${c.scnCommDate ? 'kd-has-val' : ''}">${dateOrDash(c.scnCommDate)}</span></div>
          <div class="kd-item"><span class="kd-label">SCN Ref / DIN</span><span class="kd-val font-mono" style="font-size:12px">${c.din || '<em class="text-muted">â€”</em>'}</span></div>
        </div>
        <div class="kd-sub-note"><i class="fas fa-info-circle"></i> Issued under Section 73 (non-fraud) or Section 74 (fraud / suppression)</div>
      </div>

      <!-- Reply to SCN â€“ DRC-06 -->
      <div class="kd-group timeline-item ${c.replyDate || c.onlineFilingDate ? 'active' : ''}" style="--kd-accent:#3b82f6">
        <div class="timeline-dot"></div>
        <div class="kd-group-header">
          <i class="fas fa-file-upload"></i>
          <b>Reply &ndash; DRC-06</b>
        </div>
        <div class="kd-grid">
          <div class="kd-item"><span class="kd-label">Online Filing Date</span><span class="kd-val ${c.onlineFilingDate ? 'kd-has-val' : ''}">${dateOrDash(c.onlineFilingDate)}</span></div>
          <div class="kd-item"><span class="kd-label">Physical Submission</span><span class="kd-val ${c.physicalSubmitDate ? 'kd-has-val' : ''}">${dateOrDash(c.physicalSubmitDate)}</span></div>
          <div class="kd-item"><span class="kd-label">ARN / Acknowledgment</span><span class="kd-val font-mono" style="font-size:12px">${c.arn || '<em class="text-muted">â€”</em>'}</span></div>
        </div>
        <div class="kd-sub-note"><i class="fas fa-calendar-check"></i> Due: <b>${dateOrDash(c.dueDate)}</b></div>
      </div>

      <!-- Personal Hearing -->
      <div class="kd-group timeline-item ${primaryHearingDate || (c.hearings && c.hearings.length) ? 'active' : ''}" style="--kd-accent:#0ea5e9">
        <div class="timeline-dot"></div>
        <div class="kd-group-header">
          <i class="fas fa-microphone-alt"></i>
          <b>Personal Hearing</b>
        </div>
        <div class="kd-grid">
          <div class="kd-item">
            <span class="kd-label">Primary Hearing Date</span>
            <span class="kd-val ${primaryHearingDate ? 'kd-has-val' : ''}">${dateOrDash(primaryHearingDate)}</span>
          </div>
          <div class="kd-item">
            <span class="kd-label">Total Hearings Held</span>
            <span class="kd-val ${(c.hearings && c.hearings.length) ? 'kd-has-val' : ''}">
              ${c.hearings && c.hearings.length ? `<span class="badge badge-blue">${c.hearings.length} Hearing${c.hearings.length > 1 ? 's' : ''}</span>` : '<em class="text-muted">None logged</em>'}
            </span>
          </div>
          <div class="kd-item">
            <span class="kd-label">Adjournments</span>
            <span class="kd-val">
              ${c.hearings && c.hearings.length ? `${c.hearings.filter(h=>h.status==='Adjourned').length} / 3 used` : '<em class="text-muted">â€”</em>'}
            </span>
          </div>
        </div>
        <div class="kd-sub-note"><i class="fas fa-info-circle"></i> Mandatory under Sec 75(4). <button class="btn btn-ghost btn-xs" style="font-size:10px;padding:1px 6px;margin-left:4px" onclick="(function(){document.querySelector('[data-cftab=cf-tab-14]').click()})()"><i class="fas fa-external-link-alt"></i> View Diary</button></div>
      </div>

      <!-- OIO â€“ DRC-07 -->
      <div class="kd-group timeline-item ${c.oioDate ? 'active' : ''}" style="--kd-accent:#ef4444">
        <div class="timeline-dot"></div>
        <div class="kd-group-header">
          <i class="fas fa-gavel"></i>
          <b>OIO &ndash; DRC-07</b>
        </div>
        <div class="kd-grid">
          <div class="kd-item"><span class="kd-label">Date of OIO</span><span class="kd-val ${c.oioDate ? 'kd-has-val' : ''}">${dateOrDash(c.oioDate)}</span></div>
          <div class="kd-item"><span class="kd-label">Communication Date</span><span class="kd-val ${c.oioCommDate ? 'kd-has-val' : ''}">${dateOrDash(c.oioCommDate)}</span></div>
          <div class="kd-item"><span class="kd-label">Adjudicating Authority</span><span class="kd-val" style="font-size:12px">${c.authority || '<em class="text-muted">â€”</em>'}</span></div>
        </div>
        <div class="kd-sub-note"><i class="fas fa-stamp"></i> Adjudication order confirming / modifying / dropping demand.</div>
      </div>

      <!-- FIRST APPEAL STAGE -->
      <div class="stage-divider" style="--kd-accent:#8b5cf6"><span>First Appeal Stage</span></div>

      <!-- APL-01 -->
      <div class="kd-group timeline-item ${c.oiaDate || c.apl01Ref || c.preDeposit ? 'active' : ''}" style="--kd-accent:#8b5cf6">
        <div class="timeline-dot"></div>
        <div class="kd-group-header">
          <i class="fas fa-file-signature"></i>
          <b>Appeal &ndash; APL-01</b>
        </div>
        <div class="kd-grid">
          <div class="kd-item"><span class="kd-label">Appeal Filing Date</span><span class="kd-val ${c.oiaDate ? 'kd-has-val' : ''}">${dateOrDash(c.oiaDate)}</span></div>
          <div class="kd-item"><span class="kd-label">Appeal ARN / Ref</span><span class="kd-val font-mono" style="font-size:12px">${c.apl01Ref || '<em class="text-muted">â€”</em>'}</span></div>
          <div class="kd-item"><span class="kd-label">Pre-deposit (10%)</span><span class="kd-val">${c.preDeposit ? '&#8377;' + Number(c.preDeposit).toLocaleString('en-IN') : '<em class="text-muted">â€”</em>'}</span></div>
        </div>
        <div class="kd-sub-note"><i class="fas fa-info-circle"></i> Limitation: 3 months from OIO (Sec 107)</div>
      </div>

      <!-- Personal Hearing â€“ First Appeal -->
      <div class="kd-group timeline-item ${c.appealPhDate ? 'active' : ''}" style="--kd-accent:#a855f7">
        <div class="timeline-dot"></div>
        <div class="kd-group-header">
          <i class="fas fa-microphone-alt"></i>
          <b>PH &ndash; First Appeal</b>
        </div>
        <div class="kd-grid">
          <div class="kd-item"><span class="kd-label">Hearing Date</span><span class="kd-val ${c.appealPhDate ? 'kd-has-val' : ''}">${dateOrDash(c.appealPhDate)}</span></div>
          <div class="kd-item"><span class="kd-label">Notice / Order Ref</span><span class="kd-val font-mono" style="font-size:12px">${c.appealPhRef || '<em class="text-muted">â€”</em>'}</span></div>
          <div class="kd-item"><span class="kd-label">1st Appellate Authority</span><span class="kd-val" style="font-size:12px">${c.authority || '<em class="text-muted">â€”</em>'}</span></div>
        </div>
        <div class="kd-sub-note"><i class="fas fa-info-circle"></i> Hearing before Comm. (Appeals) (Sec 107)</div>
      </div>

      <!-- OIA -->
      <div class="kd-group timeline-item ${c.oiaDate || c.oiaCommDate ? 'active' : ''}" style="--kd-accent:#7c3aed">
        <div class="timeline-dot"></div>
        <div class="kd-group-header">
          <i class="fas fa-balance-scale"></i>
          <b>OIA</b>
        </div>
        <div class="kd-grid">
          <div class="kd-item"><span class="kd-label">Date of OIA</span><span class="kd-val ${c.oiaCommDate ? 'kd-has-val' : ''}">${dateOrDash(c.oiaCommDate)}</span></div>
          <div class="kd-item"><span class="kd-label">Communication Date</span><span class="kd-val ${c.oiaOrderCommDate ? 'kd-has-val' : ''}">${dateOrDash(c.oiaOrderCommDate)}</span></div>
          <div class="kd-item"><span class="kd-label">OIA Ref No.</span><span class="kd-val font-mono" style="font-size:12px">${c.oiaRef || '<em class="text-muted">â€”</em>'}</span></div>
        </div>
        <div class="kd-sub-note"><i class="fas fa-info-circle"></i> Decision by First Appellate Authority &mdash; Commissioner (Appeals) under Sec 107</div>
      </div>

      <!-- â•â•â• STAGE 3: SECOND APPEAL â•â•â• -->
      </div><!-- End Timeline Container -->
      <div style="margin:14px 0 6px;display:flex;align-items:center;gap:8px">
        <div style="flex:1;height:2px;background:linear-gradient(90deg,#6366f1,#818cf8)"></div>
        <span style="font-size:10px;font-weight:800;letter-spacing:1.5px;color:#6366f1;white-space:nowrap;text-transform:uppercase;background:var(--bg2);padding:2px 10px;border-radius:20px;border:1px solid #6366f144"><i class="fas fa-layer-group" style="margin-right:5px"></i>Second Appeal Stage</span>
        <div style="flex:1;height:2px;background:linear-gradient(90deg,#818cf8,#6366f1)"></div>
      </div>

      <div class="timeline-container">
      <!-- APL-05 / GSTAT -->
      <div class="kd-group timeline-item ${c.gstatAppealDate ? 'active' : ''}" style="--kd-accent:#6366f1">
        <div class="timeline-dot"></div>
        <div class="kd-group-header">
          <i class="fas fa-layer-group"></i>
          <b>GSTAT &ndash; APL-05</b>
        </div>
        <div class="kd-grid">
          <div class="kd-item"><span class="kd-label">GSTAT Appeal Date</span><span class="kd-val ${c.gstatAppealDate ? 'kd-has-val' : ''}">${dateOrDash(c.gstatAppealDate)}</span></div>
          <div class="kd-item"><span class="kd-label">ARN / Ref No.</span><span class="kd-val font-mono" style="font-size:12px">${c.gstatArn || '<em class="text-muted">â€”</em>'}</span></div>
          <div class="kd-item"><span class="kd-label">Pre-deposit (20%)</span><span class="kd-val">${c.gstatPreDeposit ? '&#8377;' + Number(c.gstatPreDeposit).toLocaleString('en-IN') : '<em class="text-muted">â€”</em>'}</span></div>
        </div>
        <div class="kd-sub-note"><i class="fas fa-info-circle"></i> Limitation: 3 months from OIA (Sec 112)</div>
      </div>

      <!-- Personal Hearing â€“ GSTAT -->
      <div class="kd-group timeline-item ${c.gstatPhDate ? 'active' : ''}" style="--kd-accent:#818cf8">
        <div class="timeline-dot"></div>
        <div class="kd-group-header">
          <i class="fas fa-microphone-alt"></i>
          <b>PH &ndash; GSTAT</b>
        </div>
        <div class="kd-grid">
          <div class="kd-item"><span class="kd-label">Hearing Date</span><span class="kd-val ${c.gstatPhDate ? 'kd-has-val' : ''}">${dateOrDash(c.gstatPhDate)}</span></div>
          <div class="kd-item"><span class="kd-label">Notice / Order Ref</span><span class="kd-val font-mono" style="font-size:12px">${c.gstatPhRef || '<em class="text-muted">â€”</em>'}</span></div>
          <div class="kd-item"><span class="kd-label">Tribunal Bench</span><span class="kd-val" style="font-size:12px">${c.gstatBench || '<em class="text-muted">â€”</em>'}</span></div>
        </div>
        <div class="kd-sub-note"><i class="fas fa-info-circle"></i> Hearing before GSTAT (Sec 112)</div>
      </div>

      <!-- Tribunal Order -->
      <div class="kd-group timeline-item ${c.gstatOrderDate ? 'active' : ''}" style="--kd-accent:#4f46e5">
        <div class="timeline-dot"></div>
        <div class="kd-group-header">
          <i class="fas fa-scroll"></i>
          <b>Tribunal Order</b>
        </div>
        <div class="kd-grid">
          <div class="kd-item"><span class="kd-label">Tribunal Order Date</span><span class="kd-val ${c.gstatOrderDate ? 'kd-has-val' : ''}">${dateOrDash(c.gstatOrderDate)}</span></div>
          <div class="kd-item"><span class="kd-label">Communication Date</span><span class="kd-val ${c.gstatOrderCommDate ? 'kd-has-val' : ''}">${dateOrDash(c.gstatOrderCommDate)}</span></div>
          <div class="kd-item"><span class="kd-label">Tribunal Order Ref</span><span class="kd-val font-mono" style="font-size:12px">${c.gstatOrderRef || '<em class="text-muted">â€”</em>'}</span></div>
        </div>
        <div class="kd-sub-note"><i class="fas fa-file-contract"></i> Binding order by fact-finding authority.</div>
      </div>

      <!-- â•â•â• STAGE 4: JUDICIAL REVIEW â•â•â• -->
      </div><!-- End Timeline Container -->
      <div style="margin:14px 0 6px;display:flex;align-items:center;gap:8px">
        <div style="flex:1;height:2px;background:linear-gradient(90deg,#dc2626,#f87171)"></div>
        <span style="font-size:10px;font-weight:800;letter-spacing:1.5px;color:#dc2626;white-space:nowrap;text-transform:uppercase;background:var(--bg2);padding:2px 10px;border-radius:20px;border:1px solid #dc262644"><i class="fas fa-university" style="margin-right:5px"></i>Judicial Review Stage</span>
        <div style="flex:1;height:2px;background:linear-gradient(90deg,#f87171,#dc2626)"></div>
      </div>

      <div class="timeline-container">
      <!-- High Court -->
      <div class="kd-group timeline-item ${c.hcPetitionDate || c.hcOrderDate ? 'active' : ''}" style="--kd-accent:#ec4899">
        <div class="timeline-dot"></div>
        <div class="kd-group-header">
          <i class="fas fa-university"></i>
          <b>High Court</b>
        </div>
        <div class="kd-grid">
          <div class="kd-item"><span class="kd-label">Petition Date</span><span class="kd-val ${c.hcPetitionDate ? 'kd-has-val' : ''}">${dateOrDash(c.hcPetitionDate)}</span></div>
          <div class="kd-item"><span class="kd-label">Writ / Petition Ref</span><span class="kd-val font-mono" style="font-size:12px">${c.hcRef || '<em class="text-muted">â€”</em>'}</span></div>
          <div class="kd-item"><span class="kd-label">HC Order Date</span><span class="kd-val ${c.hcOrderDate ? 'kd-has-val' : ''}">${dateOrDash(c.hcOrderDate)}</span></div>
        </div>
        <div class="kd-sub-note"><i class="fas fa-info-circle"></i> On question of law (Sec 117)</div>
      </div>

      <!-- Supreme Court -->
      <div class="kd-group timeline-item ${c.scPetitionDate || c.scOrderDate ? 'active' : ''}" style="--kd-accent:#dc2626;border-bottom:none">
        <div class="timeline-dot"></div>
        <div class="kd-group-header">
          <i class="fas fa-gavel"></i>
          <b>Supreme Court</b>
        </div>
        <div class="kd-grid">
          <div class="kd-item"><span class="kd-label">SLP / Petition Date</span><span class="kd-val ${c.scPetitionDate ? 'kd-has-val' : ''}">${dateOrDash(c.scPetitionDate)}</span></div>
          <div class="kd-item"><span class="kd-label">SLP / Petition Ref</span><span class="kd-val font-mono" style="font-size:12px">${c.scRef || '<em class="text-muted">â€”</em>'}</span></div>
          <div class="kd-item"><span class="kd-label">SC Order Date</span><span class="kd-val ${c.scOrderDate ? 'kd-has-val' : ''}">${dateOrDash(c.scOrderDate)}</span></div>
        </div>
        <div class="kd-sub-note"><i class="fas fa-balance-scale-right"></i> Final judicial review (Sec 118)</div>
      </div>
    </div>

    <div class="card">
      <b style="font-size:14px;display:block;margin-bottom:14px"><i class="fas fa-building text-purple" style="margin-right:6px"></i>Authority Details</b>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--border);border-radius:12px;overflow:hidden">
        <div class="kd-auth-cell" style="grid-column:1/-1;border-bottom:1px solid var(--border);background:var(--bg2)">
          <span class="kd-label"><i class="fas fa-map-marker-alt" style="color:var(--gold)"></i> Jurisdictional Authority</span>
          <span class="kd-val" style="font-size:13px;font-weight:600">${c.jurisdiction ? escapeHTML(jurisdictionDisplay(c.jurisdiction)) : '<em class="text-muted">Not specified</em>'}</span>
        </div>
        <div class="kd-auth-cell" style="grid-column:1/-1;border-bottom:1px solid var(--border)">
          <span class="kd-label"><i class="fas fa-user-tie" style="color:var(--purple)"></i> Adjudicating / Appellate Authority</span>
          <span class="kd-val" style="font-size:13px;white-space:pre-line">${c.authority || '<em class="text-muted">Not specified</em>'}</span>
        </div>
        <div class="kd-auth-cell" style="border-right:1px solid var(--border)">
          <span class="kd-label"><i class="fas fa-layer-group" style="color:#6366f1"></i> GSTAT ARN / Ref</span>
          <span class="kd-val kd-mono" style="font-size:12px">${c.gstatArn || '<em class="text-muted">â€”</em>'}</span>
        </div>
        <div class="kd-auth-cell">
          <span class="kd-label"><i class="fas fa-university" style="color:#ec4899"></i> High Court Ref</span>
          <span class="kd-val kd-mono" style="font-size:12px">${c.hcRef || '<em class="text-muted">â€”</em>'}</span>
        </div>
        <div class="kd-auth-cell" style="border-top:1px solid var(--border);grid-column:1/-1;background:var(--bg2)">
          <span class="kd-label"><i class="fas fa-gavel" style="color:#ef4444"></i> Supreme Court SLP / Ref</span>
          <span class="kd-val kd-mono" style="font-size:12px">${c.scRef || '<em class="text-muted">â€”</em>'}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- TAB 4: Notes for Updates -->
  <div class="cf-tab-content" id="cf-tab-4">
    <div class="card">
      <b style="font-size:14px;display:block;margin-bottom:14px"><i class="fas fa-sticky-note text-gold"></i> Notes for Updates</b>
      <div class="flex gap-2 mb-3">
        <input type="date" id="cf-note-date" class="form-input" style="max-width:160px" value="${new Date().toISOString().split('T')[0]}">
        <input type="text" id="cf-note-text" class="form-input" placeholder="Enter noteâ€¦" style="flex:1">
        <button class="btn btn-primary btn-sm" onclick="addCaseNote('${c.id}')"><i class="fas fa-plus"></i></button>
      </div>
      <div id="cf-notes-list">
        ${c.updateNotes.length === 0 ? '<div class="text-muted text-sm" style="padding:12px">No notes added yet.</div>' :
      c.updateNotes.map((n, i) => `<div class="cf-note-row"><div class="cf-note-date">${fmtDate(n.date)}</div><div class="cf-note-text">${n.text}</div><button class="btn btn-ghost btn-xs" onclick="deleteCaseNote('${c.id}',${i})"><i class="fas fa-times"></i></button></div>`).join('')}
      </div>
      ${c.notes ? `<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border)"><span class="text-muted text-xs">INITIAL NOTES</span><div style="font-size:13px;margin-top:4px;line-height:1.6">${c.notes}</div></div>` : ''}
    </div>
  </div>

  </div>

  <!-- TAB 13: Payments & Deposits -->
  <div class="cf-tab-content" id="cf-tab-13">
    <div class="card">
      <b style="font-size:14px;display:block;margin-bottom:14px"><i class="fas fa-rupee-sign text-green"></i> DRC-03 & Pre-Deposit Ledger</b>
      <div class="flex gap-2 mb-3">
        <input type="date" id="cf-pay-date" class="form-input" style="max-width:140px" value="${new Date().toISOString().split('T')[0]}">
        <input type="text" id="cf-pay-ref" class="form-input" placeholder="DRC-03 / CPIN Refâ€¦" style="flex:1">
        <input type="number" id="cf-pay-amt" class="form-input" placeholder="Amount (&#8377;)" style="max-width:140px">
        <select id="cf-pay-type" class="form-select" style="max-width:140px"><option value="Pre-Deposit">Pre-Deposit</option><option value="Under Protest">Under Protest</option><option value="Voluntary">Voluntary</option></select>
        <button class="btn btn-primary btn-sm" onclick="addPayment('${c.id}')"><i class="fas fa-plus"></i></button>
      </div>
      <div id="cf-payments-list">
        ${c.payments && c.payments.length > 0 ? 
          '<table class="data-table"><thead><tr><th>Date</th><th>Type</th><th>Reference (DRC-03/CPIN)</th><th>Amount</th><th></th></tr></thead><tbody>' + 
          c.payments.map((p, i) => `<tr><td>${fmtDate(p.date)}</td><td><span class="badge badge-gray">${p.type}</span></td><td>${p.ref}</td><td style="font-weight:600">&#8377; ${p.amt.toLocaleString('en-IN')}</td><td><button class="btn btn-ghost btn-xs text-red" onclick="deletePayment('${c.id}',${i})"><i class="fas fa-trash"></i></button></td></tr>`).join('') +
          '</tbody></table>'
          : '<div class="text-muted text-sm" style="padding:12px">No payments or pre-deposits logged.</div>'}
      </div>
    </div>
  </div>

  <!-- TAB 14: Hearing Diary -->
  <div class="cf-tab-content" id="cf-tab-14">
    <div class="card">
      <b style="font-size:14px;display:block;margin-bottom:14px"><i class="fas fa-gavel text-red"></i> Personal Hearing (PH) Diary</b>
      <div class="flex gap-2 mb-3">
        <input type="date" id="cf-ph-date" class="form-input" style="max-width:140px" value="${new Date().toISOString().split('T')[0]}">
        <input list="employee-list" id="cf-ph-attended" class="form-input" placeholder="Select Employee (or type name)â€¦" style="flex:1">
        <datalist id="employee-list">
          ${DB.getArr('employees').filter(e=>e.status!=='Inactive').map(e => `<option value="${e.name}">${e.role}</option>`).join('')}
        </datalist>
        <select id="cf-ph-status" class="form-select" style="max-width:150px"><option value="Attended">Attended</option><option value="Adjourned">Adjourned</option><option value="Ex-Parte">Ex-Parte</option></select>
        <button class="btn btn-primary btn-sm" onclick="addHearing('${c.id}')"><i class="fas fa-plus"></i></button>
      </div>
      <div id="cf-hearings-list">
        ${c.hearings && c.hearings.length > 0 ? 
          '<table class="data-table"><thead><tr><th>PH Date</th><th>Status</th><th>Attended By / Notes</th><th></th></tr></thead><tbody>' + 
          c.hearings.map((h, i) => `<tr><td>${fmtDate(h.date)}</td><td><span class="badge badge-${h.status === 'Adjourned' ? 'orange' : h.status === 'Attended' ? 'green' : 'red'}">${h.status}</span></td><td>${resolveEmployeeName(h.attended)}</td><td><button class="btn btn-ghost btn-xs text-red" onclick="deleteHearing('${c.id}',${i})"><i class="fas fa-trash"></i></button></td></tr>`).join('') +
          '</tbody></table>'
          : '<div class="text-muted text-sm" style="padding:12px">No hearings scheduled yet. Reminder: Max 3 adjournments allowed under Sec 75(5).</div>'}
      </div>
    </div>
  </div>

  <!-- TAB 6: Pending List -->
  <div class="cf-tab-content" id="cf-tab-6">
    <div class="card">
      <b style="font-size:14px;display:block;margin-bottom:14px"><i class="fas fa-clipboard-list text-orange"></i> Pending List / Discussion with Client</b>
      <div class="flex gap-2 mb-3">
        <input type="text" id="cf-pending-text" class="form-input" placeholder="Document or Issueâ€¦" style="flex:1">
        <button class="btn btn-primary btn-sm" onclick="addPendingItem('${c.id}')"><i class="fas fa-plus"></i></button>
      </div>
      <div id="cf-pending-list">
        ${c.pendingList.length === 0 ? '<div class="text-muted text-sm" style="padding:12px">No pending items.</div>' :
      `<table class="data-table"><thead><tr><th>Sr.</th><th>Document / Issue</th><th>Received?</th><th></th></tr></thead><tbody>
          ${c.pendingList.map((p, i) => `<tr><td>${i + 1}</td><td>${p.text}</td><td><button class="cf-toggle-btn ${p.received ? 'on' : ''}" onclick="togglePending('${c.id}',${i})">${p.received ? 'âœ“ Yes' : 'No'}</button></td><td><button class="btn btn-ghost btn-xs" onclick="deletePending('${c.id}',${i})"><i class="fas fa-times"></i></button></td></tr>`).join('')}
          </tbody></table>`}
      </div>
    </div>
  </div>

  

  

  

  

  <script>
    window.draftActionFromCase = function(caseId, draftType) {
      window._draftCaseContext = { caseId: caseId, type: draftType };
      App.navigate('scn');
    };
  </script>

`;

  // Tab switching logic
  document.querySelectorAll('.cf-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cf-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.cf-tab-content').forEach(tc => tc.classList.remove('active'));
      tab.classList.add('active');
      const tabId = tab.dataset.cftab;
      document.getElementById(tabId).classList.add('active');
    });
  });
};

// === Case File Helper Functions ===
function _updateCase(id, updater) {
  const cases = DB.getArr('cases');
  const c = cases.find(x => x.id === id);
  if (!c) return;
  try {
    updater(c);
  } catch (err) {
    showAppError('Could not update case', err);
    return null;
  }
  c.updatedAt = new Date().toISOString();
  normalizeCaseRecord(c);
  DB.set('cases', cases);
  return c;
}

window.saveChecklist = function (id) {
  const container = document.getElementById('cf-checklist-list');
  if (!container) return;

  const dropdowns = container.querySelectorAll('.cf-cl-dropdown');
  _updateCase(id, c => {
    dropdowns.forEach(select => {
      const idx = parseInt(select.getAttribute('data-idx'));
      if (!isNaN(idx) && c.checklist[idx]) {
        c.checklist[idx].status = select.value;
      }
    });
  });

  toast('Checklist saved successfully', 'success');
  showCaseDetail(id);
  setTimeout(() => (function(el){if(el)el.click()})(document.querySelector('[data-cftab="cf-tab-2"]')), 50);
};

window.addCaseNote = function (id) {
  const dateEl = document.getElementById('cf-note-date');
  const textEl = document.getElementById('cf-note-text');
  if (!textEl.value.trim()) { toast('Enter a note', 'error'); return; }
  _updateCase(id, c => {
    c.updateNotes.push({ date: dateEl.value, text: textEl.value.trim() });
  });
  showCaseDetail(id);
  setTimeout(() => (function(el){if(el)el.click()})(document.querySelector('[data-cftab="cf-tab-4"]')), 50);
  toast('Note added', 'success');
};

window.deleteCaseNote = function (id, idx) {
  _updateCase(id, c => c.updateNotes.splice(idx, 1));
  showCaseDetail(id);
  setTimeout(() => (function(el){if(el)el.click()})(document.querySelector('[data-cftab="cf-tab-4"]')), 50);
  setTimeout(() => (function(el){if(el)el.click()})(document.querySelector('[data-cftab="cf-tab-4"]')), 50);
};

window.addPendingItem = function (id) {
  const el = document.getElementById('cf-pending-text');
  if (!el.value.trim()) { toast('Enter document/issue', 'error'); return; }
  _updateCase(id, c => { c.pendingList.push({ text: el.value.trim(), received: false }); });
  showCaseDetail(id);
  setTimeout(() => (function(el){if(el)el.click()})(document.querySelector('[data-cftab="cf-tab-6"]')), 50);
};

window.togglePending = function (id, idx) {
  _updateCase(id, c => { c.pendingList[idx].received = !c.pendingList[idx].received; });
  showCaseDetail(id);
  setTimeout(() => (function(el){if(el)el.click()})(document.querySelector('[data-cftab="cf-tab-6"]')), 50);
};

window.deletePending = function (id, idx) {
  _updateCase(id, c => c.pendingList.splice(idx, 1));
  showCaseDetail(id);
  setTimeout(() => (function(el){if(el)el.click()})(document.querySelector('[data-cftab="cf-tab-6"]')), 50);
};

window.addPayment = function(id) {
  const dateEl = document.getElementById('cf-pay-date').value;
  const refEl = document.getElementById('cf-pay-ref').value.trim();
  const amtEl = Number(document.getElementById('cf-pay-amt').value);
  const typeEl = document.getElementById('cf-pay-type').value;
  if (!refEl || !amtEl) { toast('Enter reference and amount', 'error'); return; }
  _updateCase(id, c => { c.payments.push({ date: dateEl, ref: refEl, amt: amtEl, type: typeEl }); });
  toast('Payment logged', 'success');
  showCaseDetail(id);
  setTimeout(() => (function(el){if(el)el.click()})(document.querySelector('[data-cftab="cf-tab-13"]')), 50);
};

window.deletePayment = function(id, idx) {
  _updateCase(id, c => c.payments.splice(idx, 1));
  showCaseDetail(id);
  setTimeout(() => (function(el){if(el)el.click()})(document.querySelector('[data-cftab="cf-tab-13"]')), 50);
};

window.addHearing = function(id) {
  const dateEl = document.getElementById('cf-ph-date').value;
  const attVal = document.getElementById('cf-ph-attended').value.trim();
  const statEl = document.getElementById('cf-ph-status').value;
  
  if (!dateEl) { toast('Select a hearing date', 'error'); return; }
  
  // Try to find the employee ID if a name was selected from datalist
  const employees = DB.getArr('employees');
  const emp = employees.find(e => e.name === attVal);
  const attendedIdOrName = emp ? emp.id : attVal;

  _updateCase(id, c => { c.hearings.push({ date: dateEl, attended: attendedIdOrName, status: statEl }); });
  toast('Hearing logged', 'success');
  showCaseDetail(id);
  setTimeout(() => (function(el){if(el)el.click()})(document.querySelector('[data-cftab="cf-tab-14"]')), 50);
};

window.deleteHearing = function(id, idx) {
  _updateCase(id, c => c.hearings.splice(idx, 1));
  showCaseDetail(id);
  setTimeout(() => (function(el){if(el)el.click()})(document.querySelector('[data-cftab="cf-tab-14"]')), 50);
};

window.toggleGround = function (id, idx, field) {
  _updateCase(id, c => { c.grounds[idx][field] = !c.grounds[idx][field]; });
  showCaseDetail(id);
};

window.addSpecificGround = function (id) {
  const el = document.getElementById('cf-ground-text');
  if (!el.value.trim()) { toast('Enter ground name', 'error'); return; }
  _updateCase(id, c => {
    const maxSr = Math.max(...c.grounds.map(g => g.sr), 0);
    c.grounds.push({ sr: maxSr + 1, name: el.value.trim(), applicable: false, taken: false, category: 'specific' });
  });
  showCaseDetail(id);
};

window.deleteGround = function (id, idx) {
  _updateCase(id, c => {
    c.grounds.splice(idx, 1);
    // Recalculate Sr. numbers for all grounds to maintain continuity after deletion
    c.grounds.forEach((g, i) => g.sr = i + 1);
  });
  showCaseDetail(id);
};

window.editGround = function (id, idx) {
  const c = DB.getArr('cases').find(x => x.id === id);
  if (!c) return;

  const currentName = c.grounds[idx].name;
  const newName = prompt("Edit Specific Ground Name:", currentName);

  if (newName !== null && newName.trim() !== '') {
    _updateCase(id, caseObj => {
      caseObj.grounds[idx].name = newName.trim();
    });
    showCaseDetail(id);
  }
};

window.saveCaseSequence = function (id) {
  const listEl = document.getElementById('cf-sequence-list');
  if (!listEl) return;
  const items = Array.from(listEl.querySelectorAll('.sortable-item')).map(el => el.getAttribute('data-name'));
  _updateCase(id, c => { c.sequenceList = items; });
  toast('Sequence saved', 'success');
  showCaseDetail(id);
};

window.toggleFact = function (id, idx, field) {
  _updateCase(id, c => { c.facts[idx][field] = !c.facts[idx][field]; });
  showCaseDetail(id);
};

window.addSpecificFact = function (id) {
  const el = document.getElementById('cf-fact-text');
  if (!el.value.trim()) { toast('Enter fact name', 'error'); return; }
  _updateCase(id, c => {
    const maxSr = Math.max(...c.facts.map(g => g.sr), 0);
    c.facts.push({ sr: maxSr + 1, name: el.value.trim(), applicable: false, taken: false, category: 'specific' });
  });
  showCaseDetail(id);
};

window.deleteFact = function (id, idx) {
  _updateCase(id, c => {
    c.facts.splice(idx, 1);
    c.facts.forEach((g, i) => g.sr = i + 1);
  });
  showCaseDetail(id);
};

window.editFact = function (id, idx) {
  const c = DB.getArr('cases').find(x => x.id === id);
  if (!c) return;

  const currentName = c.facts[idx].name;
  const newName = prompt("Edit Specific Fact Name:", currentName);

  if (newName !== null && newName.trim() !== '') {
    _updateCase(id, caseObj => {
      caseObj.facts[idx].name = newName.trim();
    });
    showCaseDetail(id);
  }
};

// === Fact Detail Panel Functions ===
window.toggleFactPanel = function (idx) {
  const panel = document.getElementById('fact-panel-' + idx);
  if (!panel) return;
  const row = panel.previousElementSibling;
  const icon = row.querySelector('.fact-expand-icon i');
  if (panel.style.display === 'none') {
    panel.style.display = 'block';
    row.classList.add('expanded');
    if (icon) icon.className = 'fas fa-chevron-up';
  } else {
    panel.style.display = 'none';
    row.classList.remove('expanded');
    if (icon) icon.className = 'fas fa-chevron-down';
  }
};

window.saveFactDetail = function (id, idx) {
  const textarea = document.getElementById('fact-detail-' + idx);
  if (!textarea) return;
  _updateCase(id, c => {
    c.facts[idx].details = textarea.value;
  });
  toast('Fact details saved', 'success');
};

window.saveAllFactDetails = function (id) {
  _updateCase(id, c => {
    c.facts.forEach((f, i) => {
      const textarea = document.getElementById('fact-detail-' + i);
      if (textarea) f.details = textarea.value;
    });
  });
  toast('All fact details saved', 'success');
};

window.uploadFactFile = function (id, factIdx, files) {
  if (!files || files.length === 0) return;
  const maxSize = 5 * 1024 * 1024; // 5MB limit
  let uploaded = 0;
  let skipped = 0;

  const processFile = (file) => {
    return new Promise((resolve) => {
      if (file.size > maxSize) {
        skipped++;
        resolve();
        return;
      }
      const reader = new FileReader();
      reader.onload = function (e) {
        _updateCase(id, c => {
          if (!c.facts[factIdx].files) c.facts[factIdx].files = [];
          c.facts[factIdx].files.push({
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            dataUrl: e.target.result
          });
        });
        uploaded++;
        resolve();
      };
      reader.onerror = function () { skipped++; resolve(); };
      reader.readAsDataURL(file);
    });
  };

  Promise.all(Array.from(files).map(processFile)).then(() => {
    if (uploaded > 0) {
      toast(uploaded + ' file(s) attached to fact' + (skipped > 0 ? ', ' + skipped + ' skipped (>5MB)' : ''), 'success');
    } else {
      toast('No files uploaded. Files must be under 5MB.', 'error');
    }
    showCaseDetail(id);
    setTimeout(() => {
      // Re-expand the panel we just uploaded to
      const panel = document.getElementById('fact-panel-' + factIdx);
      if (panel) {
        panel.style.display = 'block';
        panel.previousElementSibling.classList.add('expanded');
        const icon = panel.previousElementSibling.querySelector('.fact-expand-icon i');
        if (icon) icon.className = 'fas fa-chevron-up';
      }
    }, 50);
  });
};

window.deleteFactFile = function (id, factIdx, fileIdx) {
  if (!confirm('Delete this attached file from the fact?')) return;
  _updateCase(id, c => {
    if (c.facts[factIdx].files) {
      c.facts[factIdx].files.splice(fileIdx, 1);
    }
  });
  showCaseDetail(id);
  setTimeout(() => {
    // Re-expand the panel
    const panel = document.getElementById('fact-panel-' + factIdx);
    if (panel) {
      panel.style.display = 'block';
      panel.previousElementSibling.classList.add('expanded');
      const icon = panel.previousElementSibling.querySelector('.fact-expand-icon i');
      if (icon) icon.className = 'fas fa-chevron-up';
    }
  }, 50);
};

// === Auto-Link Documents to Facts (keyword matching) ===
function _getLinkedDocs(factName, documents) {
  if (!documents || !factName) return [];
  const fn = factName.toLowerCase();
  const matched = [];
  documents.forEach(d => {
    const dn = d.name.toLowerCase();
    // Direct keyword matching using GST domain knowledge
    const links = [
      // Return Scrutiny
      [['gstr-1', 'gstr-3b', 'gstr-9', 'return filing', 'returns filed'], ['gstr-1', 'gstr-3b', 'gstr-9']],
      [['asmt-10', 'scrutiny notice'], ['asmt', 'scrutiny']],
      [['turnover mismatch', 'turnover reconciliation'], ['turnover', 'reconciliation']],
      [['itc mismatch', 'itc reconciliation', 'input tax credit', 'itc availed'], ['itc', 'gstr-2a', 'gstr-2b', 'reconciliation']],
      [['e-way bill', 'eway', 'e way'], ['e-way', 'eway', 'ewb']],
      [['drc-03', 'voluntary payment', 'pre-deposit'], ['drc-03', 'challan', 'payment']],
      [['drc-01', 'intimation'], ['drc-01']],
      // Audit
      [['audit initiation', 'adt-01', 'audit report', 'far', 'adt-04', 'final audit'], ['adt', 'audit', 'far']],
      [['audit observation', 'audit query', 'query memo'], ['audit', 'query', 'memo']],
      [['valuation', 'related party'], ['valuation', 'invoice']],
      [['classification', 'hsn', 'sac'], ['hsn', 'classification']],
      [['job work', 'sec 143'], ['job work']],
      // Special Audit
      [['special audit', 'sec 66', 'cost accountant'], ['special audit', 'adt-04']],
      [['transfer pricing', 'cost records'], ['transfer pricing', 'cost']],
      // Investigation
      [['summons', 'sec 70'], ['summon']],
      [['statement', 'retraction', 'recorded'], ['statement', 'retraction']],
      [['search', 'seizure', 'sec 67'], ['seizure', 'panchnama', 'search', 'authorization']],
      [['bank account', 'cash flow', 'bank statement'], ['bank']],
      [['fake invoice', 'bogus', 'circular trading', 'fictitious'], ['invoice']],
      [['arrest', 'bail', 'sec 69'], ['bail', 'arrest']],
      [['drc-22', 'provisional attachment'], ['drc-22', 'attachment']],
      // Inspection
      [['ins-01', 'authorization for inspection'], ['ins-01', 'authorization']],
      [['panchnama', 'mahazar'], ['panchnama', 'mahazar']],
      [['stock verification', 'physical count'], ['stock', 'verification']],
      [['confiscation', 'sec 130'], ['confiscation']],
      // E-way Detention
      [['mov-02', 'physical verification'], ['mov-02', 'mov-04']],
      [['mov-06', 'detention order'], ['mov-06']],
      [['mov-07', 'notice for payment'], ['mov-07']],
      [['mov-09', 'order of demand'], ['mov-09']],
      [['mov-11', 'confiscation'], ['mov-11']],
      [['mov-05', 'release'], ['mov-05', 'release']],
      [['lorry receipt', 'transport', 'weighment'], ['lorry', 'transport', 'lr', 'gr', 'weighment']],
      [['delivery challan', 'bill of supply', 'tax invoice'], ['invoice', 'challan', 'bill of supply']],
      // Refund
      [['rfd-01', 'refund application'], ['rfd-01', 'refund']],
      [['rfd-03', 'deficiency memo'], ['rfd-03', 'deficiency']],
      [['rfd-06', 'refund order', 'provisional refund'], ['rfd-06', 'rfd-04']],
      [['rfd-08', 'rejection'], ['rfd-08']],
      [['shipping bill', 'brc', 'firc', 'export'], ['shipping', 'brc', 'firc', 'export']],
      [['inverted duty', 'input-output'], ['inverted', 'hsn']],
      [['unjust enrichment', 'ca certificate'], ['ca certificate', 'cost accountant', 'unjust']],
      // Registration
      [['reg-17', 'scn for cancellation'], ['reg-17']],
      [['reg-19', 'cancellation order'], ['reg-19']],
      [['reg-21', 'revocation'], ['reg-21']],
      [['reg-06', 'registration certificate'], ['reg-06']],
      // Common
      [['scn', 'show cause notice'], ['scn', 'show cause']],
      [['reply to scn', 'reply filed', 'submissions filed'], ['reply']],
      [['oio', 'order in original', 'adjudication'], ['oio', 'order']],
      [['oia', 'order in appeal', 'appellate'], ['oia', 'appeal']],
      [['apl-01', 'appeal memo'], ['apl-01', 'appeal']],
      [['power of attorney'], ['power of attorney', 'poa']],
      [['board resolution'], ['board resolution']],
      [['case law', 'comparable cases'], ['case law']],
      [['written submission'], ['written submission']]
    ];
    for (const [factKeys, docKeys] of links) {
      const factMatch = factKeys.some(k => fn.includes(k));
      const docMatch = docKeys.some(k => dn.includes(k));
      if (factMatch && docMatch) {
        matched.push(d);
        return;
      }
    }
  });
  return matched;
}


window.openAddCase = function () {
  Modal.open('Create New Case File', `
    <div class="cf-form-sections">
    <!-- Section 1: Assignment Details -->
    <div class="cf-section">
      <div class="cf-section-header" onclick="this.parentElement.classList.toggle('collapsed')"><i class="fas fa-briefcase"></i><span>1. Assignment Details</span><i class="fas fa-chevron-down cf-chev"></i></div>
      <div class="cf-section-body">
        <div class="form-group" style="background:var(--blue-dim);padding:10px;border-radius:8px;margin-bottom:15px;border:1px dashed var(--blue)">
          <label class="form-label" style="color:var(--blue);font-weight:700"><i class="fas fa-search-plus mr-1"></i> Pick from Client Master (Optional)</label>
          <select id="fc-client-picker" class="form-select" onchange="pickClientForCase(this.value)">
            <option value="">-- Search & Select Existing Client --</option>
            ${DB.getArr('clients').sort((a,b)=>(a.tradeName||a.name||'').localeCompare(b.tradeName||b.name||'')).map(cl => `<option value="${cl.id}">${cl.tradeName || cl.legalName || cl.name} (${cl.gstin||'No GSTIN'})</option>`).join('')}
          </select>
          <div style="font-size:10px;color:var(--text-muted);margin-top:4px">Selecting a client will auto-fill the details below.</div>
        </div>
        <div class="form-row"><div class="form-group"><label class="form-label">Legal Name <span class="req">*</span></label><input id="fc-legal-name" class="form-input" placeholder="Registered name as per PAN / Incorporation"></div>
        <div class="form-group"><label class="form-label">Trade Name</label><input id="fc-trade-name" class="form-input" placeholder="Trade / Brand name on GST Certificate"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">GSTIN / PAN <span class="req">*</span></label><input id="fc-gstin" class="form-input" placeholder="22AAAAA0000A1Z5" maxlength="15" oninput="this.value=this.value.toUpperCase(); if(window.autoFillFromGSTIN) window.autoFillFromGSTIN(this.value, 'fc-pan', 'fc-state');"></div>
        <div class="form-group"><label class="form-label">State</label><input id="fc-state" class="form-input" placeholder="State (Auto-filled from GSTIN)"></div></div>
        <div class="form-group"><label class="form-label">Client Address</label><textarea id="fc-address" class="form-textarea" rows="2" placeholder="Registered office address..."></textarea></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Allotted To</label>
          <select id="fc-allotted" class="form-select">
            <option value="">-- Unassigned --</option>
            ${DB.getArr('employees').filter(e=>e.status!=='Inactive').map(e => `<option value="${e.id}">${e.name} (${e.role})</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">ITN</label><input id="fc-itn" class="form-input" placeholder="Internal tracking number"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Contact Name</label><input id="fc-contact" class="form-input" placeholder="Authorized person"></div>
        <div class="form-group"><label class="form-label">Mobile No.</label><input id="fc-mobile" class="form-input" type="tel" placeholder="+91 XXXXX XXXXX"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">E-mail</label><input id="fc-email" class="form-input" type="email" placeholder="client@example.com"></div>
        <div class="form-group"><label class="form-label">Reference</label><input id="fc-ref" class="form-input" placeholder="Source reference"></div></div>
        <div class="form-group"><label class="form-label">Assignment Type <span class="req">*</span></label>
          <div class="cf-radio-group cf-assignment-options" role="radiogroup" aria-label="Assignment type">
                        <label class="cf-radio"><input type="radio" name="fc-atype" value="reply-scn" checked><span>SCN Reply / DRC-06</span></label>
            <label class="cf-radio"><input type="radio" name="fc-atype" value="appeal-comm"><span>Appeal to Appellate Authority - Sec. 107 / APL-01</span></label>
            <label class="cf-radio"><input type="radio" name="fc-atype" value="appeal-tribunal"><span>Appeal to Appellate Tribunal - Sec. 112 / APL-05</span></label>
            <label class="cf-radio"><input type="radio" name="fc-atype" value="hc-appeal-writ"><span>High Court Appeal / Writ - Sec. 117 / Art. 226</span></label>
            <label class="cf-radio"><input type="radio" name="fc-atype" value="sc-appeal-slp"><span>Supreme Court Appeal / SLP - Sec. 118 / Art. 136</span></label>
            <label class="cf-radio"><input type="radio" name="fc-atype" value="revision-sec108"><span>Revision by Revisional Authority - Sec. 108</span></label>
            <label class="cf-radio"><input type="radio" name="fc-atype" value="rectification-sec161"><span>Rectification of Mistake - Sec. 161</span></label>
            <label class="cf-radio"><input type="radio" name="fc-atype" value="written-opinion"><span>Written Legal Opinion</span></label>
            <label class="cf-radio"><input type="radio" name="fc-atype" value="other"><span>Other GST Proceeding</span></label>
          </div>
        </div>
        <div class="form-row"><div class="form-group"><label class="form-label">Priority</label>
          <select id="fc-priority" class="form-select"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="critical">Critical</option></select>
        </div><div class="form-group"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Date of Receipt</label><input id="fc-receipt-date" class="form-input" type="date"></div>
        <div class="form-group"><label class="form-label">Commitment Date to Client</label><input id="fc-commit-date" class="form-input" type="date"></div></div>
      </div>
    </div>
    <!-- Section 2: Basic Details & Amounts -->
    <div class="cf-section">
      <div class="cf-section-header" onclick="this.parentElement.classList.toggle('collapsed')"><i class="fas fa-file-alt"></i><span>2. Basic Details & Amounts</span><i class="fas fa-chevron-down cf-chev"></i></div>
      <div class="cf-section-body">
        <div class="form-group"><label class="form-label">Case Origin Category</label>
          <select id="fc-origin" class="form-select">
            <option value="">-- Select Origin --</option>
            <option value="return-scrutiny">Return Scrutiny (Section 61)</option>
            <option value="dept-audit">Departmental Audit (Section 65)</option>
            <option value="special-audit">Special Audit (Section 66)</option>
            <option value="investigation">Investigation by Intelligence Authorities</option>
            <option value="inspection">Inspection, Search or Seizure (Section 67)</option>
            <option value="eway-detention">E-Way Bill Interception / Detention of Goods</option>
            <option value="data-mismatch">Data Analytics or System-Based Mismatch</option>
            <option value="refund">Refund Proceedings (Section 54)</option>
            <option value="registration">Registration Proceedings</option>
          </select>
        </div>
        <div class="form-row"><div class="form-group"><label class="form-label">Section Invoked <span class="req">*</span></label>
          <select id="fc-section" class="form-select"><option value="73">Section 73 (No Fraud)</option><option value="74">Section 74 (Fraud)</option><option value="76">Section 76 (Tax Collected)</option><option value="129">Section 129 (Transit Detention)</option><option value="54">Section 54 (Refund)</option><option value="65">Section 65 (Audit)</option><option value="Other">Other</option></select>
        </div>
        <div class="form-group"><label class="form-label">Period Involved</label><input id="fc-period" class="form-input" placeholder="FY 2022-23"></div></div>
        <div class="form-group"><label class="form-label">Issue in Detail</label><textarea id="fc-issue" class="form-textarea" rows="4" placeholder="Detailed description of the issue / demand / allegationâ€¦"></textarea></div>
        <div class="form-group"><label class="form-label">Status</label>
          <select id="fc-status" class="form-select"><option value="new-lead">New Lead</option><option value="scn-received" selected>SCN Received</option><option value="reply-filed">Reply of SCN Filed</option><option value="ph-pending">Personal Hearing (Adjudication)</option><option value="oio-received">OIO Received</option><option value="appeal-filed">Appeal Filed (APL-01)</option><option value="appeal-ph">Personal Hearing (Appeal)</option><option value="oia-received">OIA Received</option><option value="gstat-appeal-filed">GSTAT Appeal Filed (APL-05)</option><option value="gstat-ph">Personal Hearing (GSTAT)</option><option value="tribunal-order">Tribunal Order</option><option value="hc-petition-filed">High Court Petition Filed</option><option value="sc-petition-filed">Supreme Court Petition Filed</option><option value="writ-filed">Writ Filed</option><option value="closed">Closed</option><option value="dropped">Dropped</option></select>
        </div>
        <b class="text-sm" style="display:block;margin:16px 0 10px;color:var(--gold)"><i class="fas fa-rupee-sign"></i> Amount Involved</b>
        <div class="cf-amount-grid">
          <div class="form-group"><label class="form-label">Tax (&#8377;)</label><input id="fc-tax" class="form-input cf-amt" type="number" placeholder="0" oninput="calcCaseTotal()"></div>
          <div class="form-group"><label class="form-label">Penalty (&#8377;)</label><input id="fc-penalty" class="form-input cf-amt" type="number" placeholder="0" oninput="calcCaseTotal()"></div>
          <div class="form-group"><label class="form-label">Interest (&#8377;)</label><input id="fc-interest" class="form-input cf-amt" type="number" placeholder="0" oninput="calcCaseTotal()"></div>
          <div class="form-group"><label class="form-label">Other (&#8377;)</label><input id="fc-other-amt" class="form-input cf-amt" type="number" placeholder="0" oninput="calcCaseTotal()"></div>
          <div class="form-group cf-total-group"><label class="form-label">Total Demand (&#8377;)</label><div id="fc-total" class="cf-total-display">&#8377; 0</div></div>
          <div class="form-group"><label class="form-label" style="color:var(--green)">Collected / Paid (&#8377;)</label><input id="fc-collected" class="form-input cf-amt" type="number" placeholder="0"></div>
        </div>
      </div>
    </div>

    <!-- Section 3: Dates & Authority -->
    <div class="cf-section">
      <div class="cf-section-header" onclick="this.parentElement.classList.toggle('collapsed')"><i class="fas fa-calendar-alt"></i><span>3. Key Dates & Authority</span><i class="fas fa-chevron-down cf-chev"></i></div>
      <div class="cf-section-body">
        <fieldset style="border:1px solid var(--border);border-radius:6px;padding:12px;margin-bottom:12px;background:var(--bg2)">
          <legend style="font-size:12px;font-weight:700;color:var(--orange);padding:0 6px">SCN Details</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">Date of SCN</label><input id="fc-scndate" class="form-input" type="date"></div>
          <div class="form-group"><label class="form-label">Date of Comm. of SCN</label><input id="fc-scn-comm" class="form-input" type="date"></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">Case / SCN Ref No.</label><input id="fc-case" class="form-input" placeholder="CGST/SCN/2024/001"></div>
          <div class="form-group"><label class="form-label">DIN (Document Id No.)</label><input id="fc-din" class="form-input" placeholder="e.g. 20240854M10000XY"></div></div>
        </fieldset>

        <fieldset style="border:1px solid var(--border);border-radius:6px;padding:12px;margin-bottom:12px;background:var(--bg2)">
          <legend style="font-size:12px;font-weight:700;color:var(--red);padding:0 6px">OIO Details</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">Date of Issue of OIO</label><input id="fc-oio-date" class="form-input" type="date"></div>
          <div class="form-group"><label class="form-label">Date of Comm. of OIO</label><input id="fc-oio-comm" class="form-input" type="date"></div></div>
        </fieldset>

        <fieldset style="border:1px solid var(--border);border-radius:6px;padding:12px;margin-bottom:12px;background:var(--bg2)">
          <legend style="font-size:12px;font-weight:700;color:var(--purple);padding:0 6px">OIA Details</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">Date of OIA</label><input id="fc-oia-date" class="form-input" type="date"></div>
          <div class="form-group"><label class="form-label">Date of Comm. of OIA</label><input id="fc-oia-comm" class="form-input" type="date"></div></div>
        </fieldset>

        <fieldset style="border:1px solid var(--border);border-radius:6px;padding:12px;margin-bottom:12px;background:var(--bg2)">
          <legend style="font-size:12px;font-weight:700;color:var(--blue);padding:0 6px">Filing & Compliance Dates</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">Due Date (Reply / Appeal)</label><input id="fc-due-date" class="form-input" type="date"></div>
          <div class="form-group"><label class="form-label">Date of Online Filing</label><input id="fc-online-date" class="form-input" type="date"></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">Date of Physical Submission</label><input id="fc-physical-date" class="form-input" type="date"></div>
          <div class="form-group"><label class="form-label">ARN (Application Ref No.)</label><input id="fc-arn" class="form-input" placeholder="e.g. AA220824XXXXXX"></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">GSTAT Appeal Date</label><input id="fc-gstat-date" class="form-input" type="date"></div>
          <div class="form-group"><label class="form-label">GSTAT ARN / Ref No.</label><input id="fc-gstat-arn" class="form-input" placeholder="e.g. GSTAT ref"></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">HC Petition Date</label><input id="fc-hc-date" class="form-input" type="date"></div>
          <div class="form-group"><label class="form-label">HC Writ / Ref No.</label><input id="fc-hc-ref" class="form-input" placeholder="e.g. WP ref"></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">SC Petition Date</label><input id="fc-sc-date" class="form-input" type="date"></div>
          <div class="form-group"><label class="form-label">SC SLP / Ref No.</label><input id="fc-sc-ref" class="form-input" placeholder="e.g. SLP ref"></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">Bill No. & Date</label><input id="fc-bill" class="form-input" placeholder="Bill reference"></div>
          <div class="form-group"></div></div>
        </fieldset>

        ${renderJurisdictionSelect('fc')}
        <div class="form-group"><label class="form-label">Adjudicating / Appellate Authority with Address</label><textarea id="fc-authority" class="form-textarea" rows="2" placeholder="Name, designation and address of authority"></textarea></div>
        <fieldset style="border:1px solid #10b98144;border-radius:6px;padding:12px;margin-bottom:12px;background:var(--bg2)">
          <legend style="font-size:12px;font-weight:700;color:#10b981;padding:0 6px">Closure / Outcome Details</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">Closure Date</label><input id="fc-closure-date" class="form-input" type="date"></div>
          <div class="form-group"><label class="form-label">Outcome Summary</label><input id="fc-closure-outcome" class="form-input" placeholder="Final outcome if case is closed / dropped"></div></div>
          <div class="form-group"><label class="form-label">Final Authority / Order Ref</label><input id="fc-closure-authority" class="form-input" placeholder="Final authority, bench, order or settlement ref"></div>
          <div class="form-group"><label class="form-label">Closure Notes / Reason</label><textarea id="fc-closure-reason" class="form-textarea" rows="2" placeholder="Required when status is Closed or Dropped"></textarea></div>
        </fieldset>
        <div class="form-group"><label class="form-label">Notes</label><textarea id="fc-notes" class="form-textarea" rows="2" placeholder="Any additional notesâ€¦"></textarea></div>
      </div>
    </div>
    </div>`,
    `<button class="btn btn-outline" onclick="Modal.close()">Cancel</button><button class="btn btn-primary" onclick="saveCase()"><i class="fas fa-save"></i> Create Case File</button>`
  );
  if (!Auth.can('assign-cases')) {
    const allotted = document.getElementById('fc-allotted');
    const user = Auth.currentUser || {};
    if (allotted && user.id) {
      allotted.value = user.id;
      allotted.disabled = true;
    }
  }
  window.calcCaseTotal = function () {
    const t = (Number(document.getElementById('fc-tax').value) || 0) + (Number(document.getElementById('fc-penalty').value) || 0) + (Number(document.getElementById('fc-interest').value) || 0) + (Number(document.getElementById('fc-other-amt').value) || 0);
    document.getElementById('fc-total').textContent = '&#8377; ' + t.toLocaleString('en-IN');
  };
};

window.saveCase = function () {
  const legalNameVal = (document.getElementById('fc-legal-name') ? document.getElementById('fc-legal-name').value.trim() : '');
  const tradeNameVal  = (document.getElementById('fc-trade-name')  ? document.getElementById('fc-trade-name').value.trim()  : '');
  const name = legalNameVal || tradeNameVal || (document.getElementById('fc-name') ? document.getElementById('fc-name').value.trim() : '');
  const gstin = document.getElementById('fc-gstin') ? document.getElementById('fc-gstin').value.trim() : '';
  const section = document.getElementById('fc-section') ? document.getElementById('fc-section').value : '';
  
  if (!name) { toast('Legal or Trade Name is required', 'error'); return; }
  if (!gstin) { toast('GSTIN / PAN is required', 'error'); return; }
  
  if (gstin) {
    const gstinUpper = gstin.toUpperCase();
    if (gstinUpper.length === 15) {
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstinUpper)) {
        toast('Invalid GSTIN format', 'error'); return;
      }
    } else if (gstinUpper.length === 10) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(gstinUpper)) {
        toast('Invalid PAN format', 'error'); return;
      }
    } else {
      toast('GSTIN must be 15 chars or PAN 10 chars', 'error'); return;
    }
  }

  if (!section) { toast('Section Invoked is required', 'error'); return; }
  
  const atype = document.querySelector('input[name="fc-atype"]:checked');
  const atypeLabels = { 'reply-scn': 'SCN Reply / DRC-06', 'appeal-comm': 'Appeal to Appellate Authority - Sec. 107 / APL-01', 'appeal-tribunal': 'Appeal to Appellate Tribunal - Sec. 112 / APL-05', 'hc-appeal-writ': 'High Court Appeal / Writ - Sec. 117 / Art. 226', 'sc-appeal-slp': 'Supreme Court Appeal / SLP - Sec. 118 / Art. 136', 'revision-sec108': 'Revision by Revisional Authority - Sec. 108', 'rectification-sec161': 'Rectification of Mistake - Sec. 161', 'written-opinion': 'Written Legal Opinion', 'other': 'Other GST Proceeding' };
  const taxAmt = Number(document.getElementById('fc-tax').value) || 0;
  const penAmt = Number(document.getElementById('fc-penalty').value) || 0;
  const intAmt = Number(document.getElementById('fc-interest').value) || 0;
  const othAmt = Number(document.getElementById('fc-other-amt').value) || 0;
  const statusVal = document.getElementById('fc-status').value;
  const closureData = readClosureFields('fc-');
  if (!validateClosureForStatus(statusVal, closureData)) return;
  const currentUser = Auth.currentUser || {};
  const allottedValue = Auth.can('assign-cases') ? document.getElementById('fc-allotted').value : currentUser.id;
  const newCase = normalizeCaseRecord({
    id: 'CASE-' + Date.now(),
    caseNo: document.getElementById('fc-case').value.trim() || 'CASE-' + Date.now(),
    taxpayerName: name, legalName: legalNameVal, tradeName: tradeNameVal, gstin,
    clientId: document.getElementById('fc-client-picker') ? document.getElementById('fc-client-picker').value : '',
    clientAddress: document.getElementById('fc-address').value.trim(),
    allottedTo: allottedValue,
    createdBy: currentUser.id || '',
    createdByName: currentUser.name || '',
    itn: document.getElementById('fc-itn').value,
    contactName: document.getElementById('fc-contact').value,
    mobile: document.getElementById('fc-mobile').value,
    email: document.getElementById('fc-email').value,
    state: document.getElementById('fc-state') ? document.getElementById('fc-state').value.trim() : '',
    reference: document.getElementById('fc-ref').value,
    assignmentType: atype ? atype.value : 'reply-scn',
    assignmentTypeLabel: atype ? atypeLabels[atype.value] : 'Reply to SCN',
    section: document.getElementById('fc-section').value,
    caseOrigin: document.getElementById('fc-origin').value,
    period: document.getElementById('fc-period').value,
    status: statusVal,
    demandAmount: taxAmt, penaltyAmount: penAmt, interestAmount: intAmt, otherAmount: othAmt,
    totalAmount: taxAmt + penAmt + intAmt + othAmt,
    amountCollected: Number(document.getElementById('fc-collected').value) || 0,
    priority: document.getElementById('fc-priority').value,
    issue: document.getElementById('fc-issue').value,
    scnDate: document.getElementById('fc-scndate').value,
    scnCommDate: document.getElementById('fc-scn-comm').value,
    din: document.getElementById('fc-din').value,
    oioDate: document.getElementById('fc-oio-date').value,
    oioCommDate: document.getElementById('fc-oio-comm').value,
    oiaDate: document.getElementById('fc-oia-date').value,
    oiaCommDate: document.getElementById('fc-oia-comm').value,
    dueDate: document.getElementById('fc-due-date').value,
    onlineFilingDate: document.getElementById('fc-online-date').value,
    physicalSubmitDate: document.getElementById('fc-physical-date').value,
    arn: document.getElementById('fc-arn').value,
    gstatAppealDate: document.getElementById('fc-gstat-date').value,
    gstatArn: document.getElementById('fc-gstat-arn').value,
    hcPetitionDate: document.getElementById('fc-hc-date').value,
    hcRef: document.getElementById('fc-hc-ref').value,
    scPetitionDate: document.getElementById('fc-sc-date').value,
    scRef: document.getElementById('fc-sc-ref').value,
    billRef: document.getElementById('fc-bill').value,
    receiptDate: document.getElementById('fc-receipt-date').value,
    commitDate: document.getElementById('fc-commit-date').value,
    jurisdiction: getJurisdictionValue('fc'),
    authority: document.getElementById('fc-authority').value,
    closureDate: closureData.closureDate,
    closureOutcome: closureData.closureOutcome,
    closureAuthority: closureData.closureAuthority,
    closureReason: closureData.closureReason,
    notes: document.getElementById('fc-notes').value,
    // Checklist (10 stages from PDF)
    checklist: [
      { code: 'S01', name: 'Receipt of Assignment & Understanding of Issue', level: 'L11', status: 'pending' },
      { code: 'S02', name: 'Understanding of Work & Pre-initiation Stage', level: 'L21', status: 'pending' },
      { code: 'S03', name: 'Preparation of Case File', level: 'L3_', status: 'pending' },
      { code: 'S04', name: 'Detailed Study & Finalization of Points', level: 'L21', status: 'pending' },
      { code: 'S05', name: 'Preparation of Documents & Basic Draft', level: 'L3_', status: 'pending' },
      { code: 'S06', name: 'Preparation of Draft by L2', level: 'L21', status: 'pending' },
      { code: 'S07', name: 'Review by Team Leader & Inputs', level: 'L11', status: 'pending' },
      { code: 'S08', name: 'Finalization of Draft', level: 'L21', status: 'pending' },
      { code: 'S09', name: 'Preparation of Final PDF & Submission', level: 'L3_', status: 'pending' },
      { code: 'S10', name: 'Conclusion', level: 'L21', status: 'pending' },
    ],
    // Grounds â€” seeded dynamically based on origin
    grounds: (() => {
      const generalGrounds = [
        'Value Inclusive of Tax', 'Quantification', 'Suppression', 'Limitation',
        'DIN', 'Jurisdiction', 'Penalties', 'Interest', 'RUD not given', 'Monetary Limitation'
      ].map((name, i) => ({ sr: i + 1, name, applicable: false, taken: false, category: 'general' }));

      const _originGroundsMap = {
        'return-scrutiny': [
          'No suppression â€“ all returns filed regularly and correctly',
          'ITC correctly availed as per GSTR-2A/2B matching',
          'Turnover difference is reconcilable (timing / credit notes)',
          'Demand based on assumptions without verifying books',
          'No allegation of fraud â€“ extended period not invocable',
          'Department failed to issue ASMT-12 before proceeding to SCN',
          'Reconciliation statement already filed and accepted',
          'Tax already paid on reverse charge â€“ no short payment',
          'Classification / valuation adopted is legally correct',
          'Principles of natural justice violated â€“ no proper hearing'
        ],
        'dept-audit': [
          'Audit observations are not binding â€“ only recommendatory',
          'All records and documents duly produced during audit',
          'No discrepancy found during audit â€“ demand without basis',
          'Audit period already covered â€“ no fresh grounds for SCN',
          'ITC reversal already done voluntarily during audit',
          'Reconciliation accepted by audit team but SCN still issued',
          'Audit memo not served properly â€“ procedural lapse',
          'Demand raised beyond scope of original audit',
          'Tax difference is due to provisional assessment corrections',
          'Findings based on sampling â€“ not representative of full records'
        ],
        'special-audit': [
          'Direction for special audit without valid reasons under Sec 66',
          'CA / Cost Accountant report is opinion â€“ not conclusive evidence',
          'All documents provided to special auditor â€“ no non-cooperation',
          'Valuation methodology adopted by auditor is incorrect',
          'Special audit findings contradict departmental audit observations',
          'No opportunity given to rebut special audit report before SCN',
          'Audit conducted beyond prescribed time limit',
          'Expenses incurred on special audit not justified â€“ no complexity',
          'Demand based solely on special audit without independent verification',
          'ITC disallowance in audit report is contrary to statutory provisions'
        ],
        'investigation': [
          'Statement recorded under duress / coercion â€“ retracted',
          'No corroborative evidence to support department allegations',
          'Goods and transactions are genuine â€“ not bogus / fictitious',
          'ITC availed on actual receipt of goods / services with documents',
          'Supplier default cannot be attributed to recipient (Sec 16)',
          'Investigation based on third party data without cross-verification',
          'Bank transactions and payment trail confirms genuineness',
          'No mens rea / intention to evade tax â€“ bonafide error',
          'Department relied on unsigned / unverified documents',
          'Investigation findings not put to assessee before issuing SCN'
        ],
        'inspection': [
          'Authorization for inspection / search not valid or proper',
          'Seizure of goods / documents beyond scope of authorization',
          'Panchnama not prepared as per statutory requirements',
          'Goods seized are not liable to confiscation under Sec 130',
          'No reasonable belief for initiating search proceedings',
          'Seized goods released on bond â€“ no further proceedings warranted',
          'Statement recorded during search under coercion â€“ retracted',
          'Inventory prepared during search does not match seizure order',
          'Inspection conducted without following mandatory procedures',
          'No show cause notice issued within statutory timeline after seizure'
        ],
        'eway-detention': [
          'Minor / technical infraction â€“ goods and tax fully accounted',
          'E-way bill generated but expired due to circumstances beyond control',
          'Goods duly recorded in books â€“ no intention to evade',
          'Penalty under Sec 129 not applicable â€“ goods not in transit',
          'Tax invoice and delivery challan accompanied the goods',
          'Discrepancy in quantity is within permissible tolerance limit',
          'Vehicle breakdown / route deviation caused delay â€“ not evasion',
          'Confiscation under Sec 130 not warranted â€“ no intent to evade',
          'Detention order issued without providing opportunity of hearing',
          'Penalty already paid under protest â€“ appeal filed within time'
        ],
        'data-mismatch': [
          'Mismatch due to timing differences in return filing',
          'Reconciliation statement filed and accepted by department',
          'GSTR-2A/2B data not updated by supplier â€“ not recipient fault',
          'Difference due to credit notes / debit notes issued in next period',
          'HSN code difference is cosmetic â€“ correct tax rate applied',
          'System generated mismatch without manual verification by officer',
          'Turnover difference due to advances received / refunded',
          'E-commerce operator reporting difference â€“ already reconciled',
          'ITC availed on valid invoices â€“ supplier filing delay',
          'DRC-01A issued without proper verification â€“ premature demand'
        ],
        'refund': [
          'Unjust enrichment clause not applicable â€“ burden not passed on',
          'Documentary proof of non-passing of incidence furnished',
          'Refund application filed within statutory time limit (Sec 54)',
          'CA certificate confirming non-passing of burden submitted',
          'Inverted duty structure correctly computed per Rule 89(5)',
          'Export documents (shipping bill, BRC, FIRC) duly furnished',
          'Deficiency memo issued beyond prescribed time â€“ deemed accepted',
          'Provisional refund under Sec 54(6) sanctioned â€“ balance due',
          'Relevant date correctly computed under Explanation to Sec 54',
          'Refund of accumulated ITC is a vested right â€“ cannot be denied'
        ],
        'registration': [
          'Business is operational and active â€“ cancellation unjustified',
          'Returns filed regularly â€“ no persistent non-compliance',
          'SCN for cancellation issued without valid grounds (Sec 29)',
          'Revocation application filed within prescribed time (30 days)',
          'Non-filing of returns was for valid business reasons (seasonal)',
          'Tax dues paid in full before revocation application',
          'Cancellation order passed without granting personal hearing',
          'Registration cannot be cancelled retrospectively without justification',
          'Suo motu cancellation without following procedure under Rule 22',
          'ITC reversal and output liability computed incorrectly in order'
        ]
      };
      const origin = document.getElementById('fc-origin').value;
      const specificNames = _originGroundsMap[origin] || [];
      const specificGrounds = specificNames.map((name, i) => ({ sr: generalGrounds.length + i + 1, name, applicable: false, taken: false, category: 'specific' }));
      return [...generalGrounds, ...specificGrounds];
    })(),
    // Documents â€” seeded dynamically based on origin
    documents: (() => {
      const commonDocs = [
        'Summons', 'Reply to Summons', 'Statement', 'Panchnama', 'Audit Query Memo',
        'FAR', 'SCN', 'Reply to SCN', 'OIO', 'APL-01',
        'Representation Before Comm. A', 'OIA (Comm. Appeals)', 'Contracts', 'Invoices', 'AFS'
      ].map((name, i) => ({ sr: i + 1, name, physical: false, soft: false, na: false, category: 'common' }));

      const _originDocsMap = {
        'return-scrutiny': [
          'GSTR-1 (Outward Supplies)', 'GSTR-3B (Summary Return)', 'GSTR-9 (Annual Return)',
          'GSTR-9C (Reconciliation Statement)', 'ASMT-10 (Scrutiny Notice)', 'Reply to ASMT-10',
          'Books of Accounts & Ledgers', 'E-Ledger Extracts (Cash, Credit, Liability)',
          'Turnover Reconciliation Statement', 'ITC Reconciliation (GSTR-2A/2B vs 3B)'
        ],
        'dept-audit': [
          'Audit Initiation Letter (ADT-01)', 'Audit Query Memo / Points of Objection',
          'Books of Accounts & Trial Balance', 'Purchase & Sales Registers',
          'ITC Register & Supporting Invoices', 'Stock Register / Inventory Records',
          'Bank Statements (Relevant Period)', 'Final Audit Report (FAR / ADT-04)',
          'Reply to Audit Observations', 'Reconciliation Statement Filed'
        ],
        'special-audit': [
          'Direction Order for Special Audit (Sec 66)', 'Appointment Letter of CA / Cost Accountant',
          'Books of Accounts Provided to Auditor', 'Valuation Records & Working Sheets',
          'Special Audit Report (ADT-04)', 'Objections / Response to Audit Findings',
          'Cost Records & Cost Audit Reports', 'Transfer Pricing Documents (if applicable)',
          'ITC Working Papers & Reconciliation', 'Correspondence with Special Auditor'
        ],
        'investigation': [
          'Summons Copy (Sec 70)', 'Recorded Statements (Sec 70)',
          'Retraction Affidavit (if statement retracted)', 'Seized Documents Inventory',
          'Bank Statements & Transaction Records', 'Purchase Invoices & GRN / Weighment Slips',
          'E-Way Bills & Transport Documents', 'DRC-03 (Voluntary Payment Challan)',
          'Correspondence with Investigation Wing', 'CA Certificate / Chartered Engineer Report'
        ],
        'inspection': [
          'Authorization for Inspection / Search (Sec 67)', 'Panchnama / Mahazar',
          'Seizure Memo & Inventory of Seized Goods', 'Provisional Release Order / Bond',
          'Statements Recorded During Inspection', 'Photographs / Video Evidence of Premises',
          'Stock Verification Report', 'Order of Provisional Attachment (DRC-22)',
          'Release Application & Response', 'Correspondence with Jurisdictional Officer'
        ],
        'eway-detention': [
          'E-Way Bill (EWB-01 / EWB-02)', 'Tax Invoice / Bill of Supply / Delivery Challan',
          'Lorry Receipt / Transport Documents', 'MOV-02 (Order of Physical Verification)',
          'MOV-04 (Physical Verification Report)', 'MOV-06 (Detention Order)',
          'MOV-07 (Notice for Tax & Penalty)', 'MOV-09 (Order of Demand & Penalty)',
          'DRC-03 (Payment Challan under Protest)', 'Vehicle Registration & Driver Documents'
        ],
        'data-mismatch': [
          'GSTR-1 & GSTR-3B (Relevant Periods)', 'GSTR-2A / GSTR-2B (Auto-Generated)',
          'DRC-01 / DRC-01A (Intimation Notice)', 'Reply to DRC-01A Intimation',
          'Turnover Reconciliation Working', 'ITC Reconciliation Working (2A/2B vs 3B)',
          'Credit Notes & Debit Notes Register', 'HSN-wise Summary & Tax Rate Working',
          'E-Commerce TCS Reconciliation (if applicable)', 'Books of Accounts Extracts'
        ],
        'refund': [
          'RFD-01 (Refund Application)', 'RFD-03 (Deficiency Memo â€“ if received)',
          'Statement of Invoices (Annexure)', 'CA / Cost Accountant Certificate',
          'Shipping Bills / BRC / FIRC (for exports)', 'Bank Realization Certificate',
          'Undertaking / Declaration of No Unjust Enrichment', 'GSTR-1, GSTR-3B, GSTR-2A for refund period',
          'ITC Ledger & Inverted Duty Computation', 'RFD-06 (Provisional Refund Order â€“ if any)'
        ],
        'registration': [
          'GST Registration Certificate (REG-06)', 'REG-17 (SCN for Cancellation)',
          'Reply to REG-17', 'REG-19 (Order of Cancellation)',
          'REG-21 (Application for Revocation)', 'REG-05 (Rejection Order â€“ if applicable)',
          'Returns Filed (GSTR-3B, GSTR-1) â€“ proof of compliance', 'Bank Statements & Business Activity Proof',
          'Electricity Bill / Rent Agreement of Business Premises', 'All Pending Tax Dues Payment Challans'
        ]
      };
      const origin = document.getElementById('fc-origin').value;
      const specificNames = _originDocsMap[origin] || [];
      const specificDocs = specificNames.map((name, i) => ({ sr: commonDocs.length + i + 1, name, physical: false, soft: false, na: false, category: 'origin' }));
      return [...commonDocs, ...specificDocs];
    })(),
    // Facts â€” seeded dynamically based on origin
    facts: (() => {
      const generalFacts = [
        { sr: 1, name: 'Background of Noticee / Appellant â€“ Name, GSTIN, Constitution & Principal Place of Business', applicable: false, taken: false, category: 'general' },
        { sr: 2, name: 'Nature of Business Activity â€“ Goods / Services Dealt In, HSN / SAC Codes & Industry', applicable: false, taken: false, category: 'general' },
        { sr: 3, name: 'GST Registration History â€“ Effective Date, Status, Amendments & Additional Registrations', applicable: false, taken: false, category: 'general' },
        { sr: 4, name: 'Chronology of Events â€“ Complete Timeline from Trigger to Present Stage', applicable: false, taken: false, category: 'general' },
        { sr: 5, name: 'Return Filing & Compliance Record â€“ GSTR-1, GSTR-3B, GSTR-9, GSTR-9C Status (Period-wise)', applicable: false, taken: false, category: 'general' },
        { sr: 6, name: 'Tax Payment Track Record â€“ Ledger Balances (Electronic Cash, Credit & Liability)', applicable: false, taken: false, category: 'general' },
        { sr: 7, name: 'Input Tax Credit Position â€“ ITC Availed, Utilized, Reversed & Blocked Credits (Sec 17(5))', applicable: false, taken: false, category: 'general' },
        { sr: 8, name: 'Show Cause Notice / Order â€“ Date, Reference No., Sections Invoked & Specific Allegations', applicable: false, taken: false, category: 'general' },
        { sr: 9, name: 'Demand Breakup â€“ Tax, Interest (Sec 50), Penalty (Sec 122/125/129) & Other Amounts', applicable: false, taken: false, category: 'general' },
        { sr: 10, name: 'Reply / Submissions Filed â€“ Date, Key Arguments, Legal Grounds & Evidence Attached', applicable: false, taken: false, category: 'general' },
        { sr: 11, name: 'Principles of Natural Justice â€“ Whether Adequate Opportunity of Hearing Was Provided', applicable: false, taken: false, category: 'general' },
        { sr: 12, name: 'Limitation Analysis â€“ Whether SCN / Order Issued Within Prescribed Time (Sec 73/74/107)', applicable: false, taken: false, category: 'general' },
        { sr: 13, name: 'Personal Hearing â€“ All Dates, Adjournments (Sought / Granted), Submissions & Attendance Record', applicable: false, taken: false, category: 'general' },
        { sr: 14, name: 'Order Passed â€“ Date, Authority, Demand Confirmed / Modified / Dropped & Key Reasoning', applicable: false, taken: false, category: 'general' },
        { sr: 15, name: 'Appeal / Remedy â€“ Forum Chosen (Appellate Authority / Tribunal / HC / SC), Pre-deposit & Current Status', applicable: false, taken: false, category: 'general' }
      ];
      const _originFactsMap = {
        'return-scrutiny': [
          'Details of Returns Filed â€“ GSTR-1, GSTR-3B, GSTR-9 & GSTR-9C (Period-wise)',
          'ASMT-10 Notice â€“ Date, Discrepancies Pointed Out & Reply Timeline',
          'Response / Explanation Submitted to Scrutiny Notice (ASMT-11)',
          'Turnover Mismatch â€“ GSTR-1 vs GSTR-3B vs Books of Accounts (with working)',
          'ITC Mismatch â€“ GSTR-2A/2B vs GSTR-3B (Period-wise reconciliation)',
          'Outward Supply â€“ Tax Rate Classification Applied & HSN-wise Breakup',
          'Exempt, Nil-Rated & Non-GST Supplies Segregation',
          'Credit Notes & Debit Notes Issued â€“ Impact on Net Turnover & Tax',
          'Advances Received & Adjustment Against Invoices',
          'RCM Liability â€“ Identification, Payment & ITC Claimed',
          'Reconciliation of E-way Bills Generated vs Returns Filed',
          'Reconciliation of TDS/TCS Credit with Returns',
          'Tax Already Paid / Short Payment Working (Ledger-wise)',
          'DRC-01A Intimation â€“ Whether Issued Before SCN & Response',
          'SCN under Sec 73/74 â€“ Specific Allegations, Amounts Demanded & Sections Invoked',
          'Whether Extended Period Invoked â€“ Basis & Justification by Department',
          'Pre-deposit / Voluntary Payment Made (DRC-03) â€“ Amount & Date',
          'Adjournment History & Compliance with Hearing Schedule',
          'Cross-examination of Witnesses / Statements (if any)',
          'Comparable Cases â€“ Similar Scrutiny Dropped / Favourable Orders'
        ],
        'dept-audit': [
          'Audit Initiation â€“ ADT-01 Notice, Period Covered & Scope of Audit (Sec 65)',
          'Audit Team â€“ Names, Designations & Jurisdiction',
          'Documents & Records Submitted During Audit (with acknowledgements)',
          'Audit Observations â€“ Point-wise Objections Raised by Officers',
          'Reply to Each Audit Query Memo / Point of Objection',
          'Turnover Reconciliation â€“ Books vs Returns vs E-way Bills',
          'ITC Verification â€“ Eligibility, Blocked Credits (Sec 17(5)), Apportionment',
          'Valuation Issues â€“ Related Party Transactions, Discounts, Inclusions/Exclusions',
          'Classification Disputes â€“ HSN/SAC Codes & Rate Differences',
          'RCM Applicability â€“ Unregistered Purchases, Specified Services',
          'Job Work Transactions â€“ Sec 143 Compliance & Timelines',
          'Final Audit Report (FAR / ADT-04) â€“ Key Findings & Quantification',
          'Reconciliation of ITC with GSTR-2A/2B (Period-wise)',
          'Department Acceptance / Rejection of Reconciliation Submitted',
          'SCN Issued Post Audit under Sec 73/74 â€“ Specific Demands',
          'Whether Audit Observations Go Beyond Scope of Original Audit Period',
          'Tax Already Self-Assessed & Paid â€“ No Short Payment Working',
          'Comparable Industry Practices & Revenue Neutral Arguments',
          'Voluntary Compliance Done During Audit (DRC-03)',
          'Pending Issues Not Covered in Final Report'
        ],
        'special-audit': [
          'Direction for Special Audit â€“ Order by Commissioner & Reasons Recorded (Sec 66)',
          'Whether Complexity / Revenue Interest Justified Special Audit Direction',
          'Appointment of CA / Cost Accountant â€“ Name, Firm & Qualification',
          'Period & Scope Defined in Special Audit Order',
          'Documents & Records Provided to Special Auditor (with receipts)',
          'Additional Information / Clarifications Sought by Auditor',
          'Special Audit Report (ADT-04) â€“ Observations & Quantified Findings',
          'Valuation Methodology Adopted by Auditor & Basis of Computation',
          'ITC Discrepancies Highlighted â€“ Blocked Credits, Ineligible Claims',
          'Cost Records Analysis & Transfer Pricing Observations (if any)',
          'Contradictions Between Special Audit & Regular Departmental Audit',
          'Response / Objections Filed by Taxpayer to Audit Findings',
          'Whether Opportunity to Rebut Audit Report Given Before SCN',
          'SCN / Demand Proceedings Initiated Based on Special Audit',
          'Special Auditor Exceeded Scope of Mandate â€“ Specific Instances',
          'Time Limit Compliance â€“ Whether Report Submitted Within 90 Days (Sec 66(4))',
          'Expenses Incurred on Special Audit â€“ Justification & Proportionality',
          'Taxpayer Cooperation Throughout Audit Process',
          'Impact on Business Operations During Audit Period',
          'Parallel Proceedings â€“ Whether Same Issues in Departmental Audit / Investigation'
        ],
        'investigation': [
          'Intelligence Input â€“ Source, Nature & Basis of Investigation (DGGI / State Anti-Evasion)',
          'Investigation Wing & Officers â€“ Names, Designations & Jurisdiction',
          'Summons Issued â€“ Dates, Persons Summoned & Subject Matter (Sec 70)',
          'Statements Recorded â€“ Who, When, Key Admissions & Denials (Sec 70)',
          'Whether Statements Voluntary or Recorded Under Duress / Coercion',
          'Retraction of Statement â€“ Date, Mode & Grounds of Retraction',
          'Search & Seizure Operations â€“ Authorization, Premises, Date (Sec 67)',
          'Documents / Digital Devices / Records Seized â€“ Inventory & Panchnama',
          'Bank Account Scrutiny â€“ Transactions Flagged & Cash Flow Analysis',
          'Third Party Statements & Cross-Verification with Suppliers/Buyers',
          'Allegations â€“ Specific Nature (Tax Evasion / Fake Invoicing / Bogus ITC / Circular Trading)',
          'Supplier Verification â€“ Physical Existence, GST Compliance, Transport Evidence',
          'Buyer Verification â€“ Genuineness of Receipts, Usage in Manufacturing/Trading',
          'Quantification of Alleged Evasion â€“ Department Working & Methodology',
          'ITC Chain Analysis â€“ First Supplier to End Consumer Trail',
          'E-way Bill & Transport Document Verification for Goods Movement',
          'Voluntary Payment / DRC-03 Deposited During Investigation â€“ Amount & Circumstances',
          'Whether Payment Was Under Coercion or Voluntary',
          'SCN Issued under Sec 74 â€“ Specific Demand Heads (Tax, Interest, Penalty)',
          'Arrest / Bail Proceedings (if any) â€“ Sec 69 Compliance',
          'Provisional Attachment of Property (DRC-22) â€“ If Ordered',
          'Corroborative Documentary Evidence vs Mere Statements',
          'Whether Investigation Findings Were Put to Assessee Before SCN',
          'Comparable Cases Where Similar Allegations Were Dropped'
        ],
        'inspection': [
          'Authorization for Inspection â€“ Form GST INS-01 & Signing Authority (Sec 67)',
          'Reason to Believe â€“ Specific Grounds Recorded for Inspection/Search',
          'Details of Premises Inspected / Searched â€“ Address, Type & Ownership',
          'Date, Time & Duration of Inspection / Search',
          'Officers Present â€“ Names, Designations & Independent Witnesses',
          'Goods Found â€“ Description, Quantity, Value & Tax Classification',
          'Whether Goods Were Accounted in Books & Returns',
          'Documents Seized â€“ Physical Files, Digital Records, Hard Drives',
          'Panchnama Prepared â€“ Whether As Per Statutory Requirements of Sec 67(5)',
          'Statements Recorded During Inspection â€“ Persons & Key Depositions',
          'Stock Verification â€“ Physical Count vs Book Stock Reconciliation',
          'Goods Detained â€“ MOV-06 Order of Detention & Grounds',
          'Seizure Order â€“ Whether Sec 67(2) Conditions Fulfilled',
          'Provisional Release of Goods on Bond/Security â€“ Terms & Conditions',
          'Provisional Attachment of Property/Bank Account (DRC-22) â€“ Justification',
          'Follow-up SCN â€“ Whether Issued Within Statutory Timeline After Seizure',
          'Confiscation Proceedings under Sec 130 â€“ Grounds & Penalty Imposed',
          'Release Application Filed & Department Response',
          'Impact on Business â€“ Stock Shortage, Revenue Loss During Detention',
          'Whether Inspection Was Based on Valid Intelligence / Bonafide Belief',
          'Cross-verification of Seized Documents with Returns Filed',
          'Photographic / Video Evidence Collected During Inspection'
        ],
        'eway-detention': [
          'Goods Being Transported â€“ Description, HSN, Quantity & Value',
          'E-Way Bill Details â€“ EBN Number, Date of Generation, Validity & Route',
          'Tax Invoice / Bill of Supply / Delivery Challan Accompanying Goods',
          'Vehicle & Conveyance Details â€“ Registration, Driver, Transporter',
          'Consignor & Consignee Details â€“ GSTIN, Address & Authorization',
          'Interception Details â€“ Exact Place, Date, Time & Intercepting Officer',
          'MOV-02 Order of Physical Verification & Officer Who Ordered',
          'MOV-04 Physical Verification Report â€“ Discrepancies Found',
          'Nature of Discrepancy â€“ Part A vs Part B, Qty Mismatch, Document Shortage',
          'Whether Discrepancy Is Minor / Technical or Substantive',
          'MOV-06 Detention Order â€“ Date, Grounds & Tax + Penalty Computed',
          'MOV-07 Notice for Payment of Tax & Penalty â€“ Amount Demanded',
          'Tax & Penalty Computation under Sec 129(1)(a) or 129(1)(b)',
          'Whether Goods Are Exempted Under Any Notification â€“ E-way Bill Exemption',
          'Response Filed by Owner / Transporter / Driver',
          'Payment Made Under Protest & MOV-05 Release Order',
          'MOV-09 Order of Demand & Penalty â€“ Final Determination',
          'MOV-11 Confiscation and Penalty â€“ If Sec 130 Invoked',
          'Vehicle Breakdown / Route Deviation â€“ Evidence & Justification',
          'E-Way Bill Extended / Re-generated â€“ Timeline & Validity',
          'Goods Duly Recorded in Books & Tax Accounted in Returns',
          'Transport Documents â€“ LR, GR, Weighment Slip, Delivery Confirmation',
          'Previous Clean Transit Record â€“ No Prior Detention History',
          'Appeal Filed Against Detention / Penalty Order â€“ Timeline & Grounds',
          'Whether Sec 129 Proceedings Completed Within Statutory Time (14 days)'
        ],
        'data-mismatch': [
          'GSTN System Alert â€“ Type of Mismatch & Auto-Generated Report',
          'Data Analytics Trigger â€“ BIFA / ADVAIT / Return Scrutiny Tool Used',
          'Type of Mismatch â€“ Outward Turnover (GSTR-1 vs 3B)',
          'Type of Mismatch â€“ ITC Claimed (GSTR-3B vs 2A/2B)',
          'Type of Mismatch â€“ HSN Summary vs Actual Tax Rate Applied',
          'Type of Mismatch â€“ GSTR-9/9C Annual Return vs Monthly Returns',
          'Period-wise Quantum of Mismatch â€“ Month/Quarter-wise Breakup',
          'DRC-01A Intimation Notice â€“ Whether Issued Before SCN',
          'Response Filed to DRC-01A â€“ Reconciliation Explanation',
          'Turnover Reconciliation â€“ GSTR-1 vs GSTR-3B vs Books vs GSTR-9',
          'ITC Reconciliation â€“ GSTR-2A/2B vs GSTR-3B vs Purchase Register',
          'Timing Differences â€“ Invoices Reported in Different Return Periods',
          'Credit Notes / Debit Notes Impact on Reported Figures',
          'Advances Received & Tax Paid vs Adjusted Against Supplies',
          'Export Turnover â€“ LUT vs IGST Refund Route Bifurcation',
          'SEZ / Deemed Export Supplies â€“ Zero-Rated Treatment Verification',
          'Composition Dealer Transition Period Adjustments (if any)',
          'Documentary Evidence Supporting Each Reconciled Difference',
          'Department Acceptance of Partially Reconciled Items',
          'SCN under Sec 73/74 â€“ Demand on Remaining Unreconciled Differences',
          'Whether Department Applied GSTR-2A/2B Data Correctly (Cut-off Dates)',
          'Supplier-Level Breakup of ITC Mismatch â€“ Top Disputed Suppliers',
          'Auto-Population Errors by GSTN Portal â€“ Evidence of System Glitches'
        ],
        'refund': [
          'Type of Refund â€“ Export (with/without IGST), Inverted Duty, Excess Balance, Deemed Export',
          'Refund Application â€“ RFD-01 Details, Date Filed, Amount Claimed & ARN',
          'Grounds & Legal Basis for Refund Claim (Sec 54 / Rule 89)',
          'Computation of Refund â€“ Formula Applied (Rule 89(4) or 89(5)) with Working',
          'Supporting Documents Filed â€“ Statement 3/3A/3B, Invoice Lists',
          'For Exports â€“ Shipping Bills, BRC, FIRC, Let Export Orders',
          'For Inverted Duty â€“ HSN-wise Input-Output Tax Rate Comparison',
          'Turnover of Zero-Rated Supplies vs Adjusted Total Turnover',
          'ITC Availed on Inputs & Input Services â€“ Net ITC After Reversals',
          'Acknowledgement (RFD-02) / Deficiency Memo (RFD-03) â€“ Timeline',
          'Response to Deficiency Memo & Resubmission with Fresh Application',
          'Provisional Refund under Sec 54(6) â€“ 90% Sanctioned & Balance Pending',
          'Verification by Proper Officer â€“ Site Visit, Document Scrutiny, Observations',
          'Unjust Enrichment â€“ CA Certificate / Cost Accountant Certificate Submitted',
          'Whether Incidence of Tax Passed On to Customer â€“ Documentary Proof',
          'Relevant Date Computation under Explanation to Sec 54 â€“ Last Date Verification',
          'RFD-06 (Provisional Refund Order) & RFD-04 (Provisional Refund Payment)',
          'Final Order â€“ RFD-06 (Sanction) / RFD-08 (Rejection) with Reasons',
          'Interest on Delayed Refund â€“ Sec 56 Applicability (6% / 9%)',
          'Partial Rejection â€“ Specific Heads Disallowed & Reasons',
          'Appeal Against Rejection / Short Sanction â€“ Timeline & Grounds',
          'Refund Withheld under Sec 54(11) â€“ Pending Assessment / Demand',
          'Circular 125/44/2019-GST & Circular 135/05/2020-GST Compliance'
        ],
        'registration': [
          'GST Registration History â€“ REG-06 Certificate, Effective Date & State Code',
          'Constitutional Category â€“ Proprietor / Partnership / LLP / Pvt Ltd / Trust',
          'Principal Place of Business & Additional Places â€“ Verification Status',
          'Compliance Record â€“ GSTR-1, GSTR-3B Filing Status (Period-wise)',
          'Tax Payment Track Record â€“ Any Outstanding Demands / Dues',
          'Trigger for Cancellation â€“ Non-Filing / Fraud / Voluntary / Suo Motu',
          'REG-17 SCN for Cancellation â€“ Date, Grounds Cited & Reply Timeline',
          'Specific Grounds Invoked â€“ Sec 29(2)(a)/(b)/(c)/(d)/(e)',
          'Reply Filed to REG-17 â€“ Submissions & Supporting Documents',
          'Whether Adequate Opportunity of Being Heard Was Provided',
          'REG-19 Cancellation Order â€“ Date, Retrospective Effect & Reasons',
          'Whether Retrospective Cancellation Justified â€“ Impact Analysis',
          'REG-21 Revocation Application â€“ Date Filed, Within 30/90 Days Limit',
          'Extension of Revocation Period â€“ High Court / CBIC Circular Directions',
          'Pending Tax Dues Cleared Before Revocation Application',
          'All Pending Returns Filed Up to Date of Cancellation',
          'Department Response to Revocation â€“ Acceptance / Rejection / Silence',
          'Impact on ITC of Buyers/Recipients â€“ Sec 18(6) Reversal',
          'Impact on Ongoing Contracts, Purchase Orders & Business Operations',
          'Writ Petition Filed Against Cancellation (if any) â€“ HC Order',
          'CBIC Instructions / Circulars Allowing Condonation of Delay',
          'Amnesty Scheme â€“ Whether Applied for Revocation Under Special Window'
        ]
      };
      const origin = document.getElementById('fc-origin').value;
      const specificNames = _originFactsMap[origin] || [];
      const specificFacts = specificNames.map((name, i) => ({ sr: generalFacts.length + i + 1, name, applicable: false, taken: false, category: 'specific' }));
      return [...generalFacts, ...specificFacts];
    })(),
    updateNotes: [],
    pendingList: [],
    sequence: '',
    createdAt: new Date().toISOString(),
  });
  const cases = DB.getArr('cases');
  cases.unshift(newCase);
  DB.set('cases', cases);
  App.updateBadges();
  Modal.close();
  App.navigate('cases');
  toast('Case file created successfully', 'success');
};

window.deleteCase = function (id) {
  if (!confirm('Delete this case? This cannot be undone.')) return;
  DB.set('cases', DB.getArr('cases').filter(c => c.id !== id));
  App.updateBadges();
  Modal.close();
  App.navigate('cases');
  toast('Case deleted', 'warning');
};

window.openEditCase = function (id) {
  const c = DB.getArr('cases').find(x => x.id === id);
  if (!c) return;
  const atypeLabels = { 'reply-scn': 'SCN Reply / DRC-06', 'appeal-comm': 'Appeal to Appellate Authority - Sec. 107 / APL-01', 'appeal-tribunal': 'Appeal to Appellate Tribunal - Sec. 112 / APL-05', 'hc-appeal-writ': 'High Court Appeal / Writ - Sec. 117 / Art. 226', 'sc-appeal-slp': 'Supreme Court Appeal / SLP - Sec. 118 / Art. 136', 'revision-sec108': 'Revision by Revisional Authority - Sec. 108', 'rectification-sec161': 'Rectification of Mistake - Sec. 161', 'written-opinion': 'Written Legal Opinion', 'other': 'Other GST Proceeding' };
  Modal.open('Edit Case File', `
    <div class="cf-form-sections">
    <!-- Section 1: Assignment Details -->
    <div class="cf-section">
      <div class="cf-section-header" onclick="this.parentElement.classList.toggle('collapsed')"><i class="fas fa-briefcase"></i><span>1. Assignment Details</span><i class="fas fa-chevron-down cf-chev"></i></div>
      <div class="cf-section-body">
        <div class="form-row"><div class="form-group"><label class="form-label">Legal Name <span class="req">*</span></label><input id="fe-legal-name" class="form-input" value="${(c.legalName || c.taxpayerName).replace(/"/g, '&quot;')}" placeholder="Legal / Registered Name"></div>
        <div class="form-group"><label class="form-label">Trade Name</label><input id="fe-trade-name" class="form-input" value="${(c.tradeName || '').replace(/"/g, '&quot;')}" placeholder="Trade / Brand Name"></div></div>
        <div class="form-row"><div class="form-group" style="display:none"><input id="fe-name" class="form-input" value="${c.taxpayerName.replace(/"/g, '&quot;')}" placeholder="M/s Company Name"></div>
        <div class="form-group"><label class="form-label">GSTIN / PAN <span class="req">*</span></label><input id="fe-gstin" class="form-input" value="${c.gstin||''}" maxlength="15" oninput="this.value=this.value.toUpperCase(); if(window.autoFillFromGSTIN) window.autoFillFromGSTIN(this.value, 'fe-pan', 'fe-state');"></div>
        <div class="form-group"><label class="form-label">State</label><input id="fe-state" class="form-input" value="${c.state||''}" placeholder="State (Auto-filled from GSTIN)"></div></div>
        <div class="form-group"><label class="form-label">Client Address</label><textarea id="fe-address" class="form-textarea" rows="2" placeholder="Registered office address...">${c.clientAddress || ''}</textarea></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Allotted To</label>
          <select id="fe-allotted" class="form-select">
            <option value="">-- Unassigned --</option>
            ${DB.getArr('employees').filter(e=>e.status!=='Inactive' || e.id===c.allottedTo).map(e => `<option value="${e.id}" ${e.id===c.allottedTo?'selected':''}>${e.name} (${e.role})</option>`).join('')}
            ${c.allottedTo && !DB.getArr('employees').some(e=>e.id===c.allottedTo) ? `<option value="${c.allottedTo}" selected>${c.allottedTo} (Legacy Text)</option>` : ''}
          </select>
        </div>
        <div class="form-group"><label class="form-label">ITN</label><input id="fe-itn" class="form-input" value="${c.itn || ''}" placeholder="Internal tracking number"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Contact Name</label><input id="fe-contact" class="form-input" value="${c.contactName || ''}" placeholder="Authorized person"></div>
        <div class="form-group"><label class="form-label">Mobile No.</label><input id="fe-mobile" class="form-input" type="tel" value="${c.mobile || ''}" placeholder="+91 XXXXX XXXXX"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">E-mail</label><input id="fe-email" class="form-input" type="email" value="${c.email || ''}" placeholder="client@example.com"></div>
        <div class="form-group"><label class="form-label">Reference</label><input id="fe-ref" class="form-input" value="${c.reference || ''}" placeholder="Source reference"></div></div>
        <div class="form-group"><label class="form-label">Assignment Type <span class="req">*</span></label>
          <div class="cf-radio-group cf-assignment-options" role="radiogroup" aria-label="Assignment type">
                        <label class="cf-radio"><input type="radio" name="fe-atype" value="reply-scn" ${(c.assignmentType || 'reply-scn') === 'reply-scn' ? 'checked' : ''}><span>SCN Reply / DRC-06</span></label>
            <label class="cf-radio"><input type="radio" name="fe-atype" value="appeal-comm" ${c.assignmentType === 'appeal-comm' ? 'checked' : ''}><span>Appeal to Appellate Authority - Sec. 107 / APL-01</span></label>
            <label class="cf-radio"><input type="radio" name="fe-atype" value="appeal-tribunal" ${c.assignmentType === 'appeal-tribunal' ? 'checked' : ''}><span>Appeal to Appellate Tribunal - Sec. 112 / APL-05</span></label>
            <label class="cf-radio"><input type="radio" name="fe-atype" value="hc-appeal-writ" ${c.assignmentType === 'hc-appeal-writ' ? 'checked' : ''}><span>High Court Appeal / Writ - Sec. 117 / Art. 226</span></label>
            <label class="cf-radio"><input type="radio" name="fe-atype" value="sc-appeal-slp" ${c.assignmentType === 'sc-appeal-slp' ? 'checked' : ''}><span>Supreme Court Appeal / SLP - Sec. 118 / Art. 136</span></label>
            <label class="cf-radio"><input type="radio" name="fe-atype" value="revision-sec108" ${c.assignmentType === 'revision-sec108' ? 'checked' : ''}><span>Revision by Revisional Authority - Sec. 108</span></label>
            <label class="cf-radio"><input type="radio" name="fe-atype" value="rectification-sec161" ${c.assignmentType === 'rectification-sec161' ? 'checked' : ''}><span>Rectification of Mistake - Sec. 161</span></label>
            <label class="cf-radio"><input type="radio" name="fe-atype" value="written-opinion" ${c.assignmentType === 'written-opinion' ? 'checked' : ''}><span>Written Legal Opinion</span></label>
            <label class="cf-radio"><input type="radio" name="fe-atype" value="other" ${c.assignmentType === 'other' ? 'checked' : ''}><span>Other GST Proceeding</span></label>
          </div>
        </div>
        <div class="form-row"><div class="form-group"><label class="form-label">Priority</label>
          <select id="fe-priority" class="form-select"><option value="low" ${c.priority === 'low' ? 'selected' : ''}>Low</option><option value="medium" ${(!c.priority || c.priority === 'medium') ? 'selected' : ''}>Medium</option><option value="high" ${c.priority === 'high' ? 'selected' : ''}>High</option><option value="critical" ${c.priority === 'critical' ? 'selected' : ''}>Critical</option></select>
        </div><div class="form-group"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Date of Receipt</label><input id="fe-receipt-date" class="form-input" type="date" value="${c.receiptDate || ''}"></div>
        <div class="form-group"><label class="form-label">Commitment Date to Client</label><input id="fe-commit-date" class="form-input" type="date" value="${c.commitDate || ''}"></div></div>
      </div>
    </div>

    <!-- Section 2: Basic Details & Amounts -->
    <div class="cf-section">
      <div class="cf-section-header" onclick="this.parentElement.classList.toggle('collapsed')"><i class="fas fa-file-alt"></i><span>2. Basic Details &amp; Amounts</span><i class="fas fa-chevron-down cf-chev"></i></div>
      <div class="cf-section-body">
        <div class="form-group"><label class="form-label">Case Origin Category</label>
          <select id="fe-origin" class="form-select">
            <option value="" ${!c.caseOrigin ? 'selected' : ''}>-- Select Origin --</option>
            <option value="return-scrutiny" ${c.caseOrigin === 'return-scrutiny' ? 'selected' : ''}>Return Scrutiny (Section 61)</option>
            <option value="dept-audit" ${c.caseOrigin === 'dept-audit' ? 'selected' : ''}>Departmental Audit (Section 65)</option>
            <option value="special-audit" ${c.caseOrigin === 'special-audit' ? 'selected' : ''}>Special Audit (Section 66)</option>
            <option value="investigation" ${c.caseOrigin === 'investigation' ? 'selected' : ''}>Investigation by Intelligence Authorities</option>
            <option value="inspection" ${c.caseOrigin === 'inspection' ? 'selected' : ''}>Inspection, Search or Seizure (Section 67)</option>
            <option value="eway-detention" ${c.caseOrigin === 'eway-detention' ? 'selected' : ''}>E-Way Bill Interception / Detention of Goods</option>
            <option value="data-mismatch" ${c.caseOrigin === 'data-mismatch' ? 'selected' : ''}>Data Analytics or System-Based Mismatch</option>
            <option value="refund" ${c.caseOrigin === 'refund' ? 'selected' : ''}>Refund Proceedings (Section 54)</option>
            <option value="registration" ${c.caseOrigin === 'registration' ? 'selected' : ''}>Registration Proceedings</option>
          </select>
        </div>
        <div class="form-row"><div class="form-group"><label class="form-label">Section Invoked <span class="req">*</span></label>
          <select id="fe-section" class="form-select"><option value="73" ${c.section === '73' ? 'selected' : ''}>Section 73 (No Fraud)</option><option value="74" ${c.section === '74' ? 'selected' : ''}>Section 74 (Fraud)</option><option value="76" ${c.section === '76' ? 'selected' : ''}>Section 76 (Tax Collected)</option><option value="129" ${c.section === '129' ? 'selected' : ''}>Section 129 (Transit Detention)</option><option value="54" ${c.section === '54' ? 'selected' : ''}>Section 54 (Refund)</option><option value="65" ${c.section === '65' ? 'selected' : ''}>Section 65 (Audit)</option><option value="Other" ${c.section === 'Other' ? 'selected' : ''}>Other</option></select>
        </div>
        <div class="form-group"><label class="form-label">Period Involved</label><input id="fe-period" class="form-input" value="${c.period || ''}" placeholder="FY 2022-23"></div></div>
        <div class="form-group"><label class="form-label">Issue in Detail</label><textarea id="fe-issue" class="form-textarea" rows="4" placeholder="Detailed description of issue...">${c.issue || ''}</textarea></div>
        <div class="form-group"><label class="form-label">Status</label>
          <select id="fe-status" class="form-select"><option value="new-lead" ${c.status === 'new-lead' ? 'selected' : ''}>New Lead</option><option value="scn-received" ${c.status === 'scn-received' ? 'selected' : ''}>SCN Received</option><option value="reply-filed" ${c.status === 'reply-filed' ? 'selected' : ''}>Reply of SCN Filed</option><option value="ph-pending" ${c.status === 'ph-pending' ? 'selected' : ''}>Personal Hearing (Adjudication)</option><option value="oio-received" ${c.status === 'oio-received' ? 'selected' : ''}>OIO Received</option><option value="appeal-filed" ${c.status === 'appeal-filed' ? 'selected' : ''}>Appeal Filed (APL-01)</option><option value="appeal-ph" ${c.status === 'appeal-ph' ? 'selected' : ''}>Personal Hearing (Appeal)</option><option value="oia-received" ${c.status === 'oia-received' ? 'selected' : ''}>OIA Received</option><option value="gstat-appeal-filed" ${c.status === 'gstat-appeal-filed' ? 'selected' : ''}>GSTAT Appeal Filed (APL-05)</option><option value="gstat-ph" ${c.status === 'gstat-ph' ? 'selected' : ''}>Personal Hearing (GSTAT)</option><option value="tribunal-order" ${c.status === 'tribunal-order' ? 'selected' : ''}>Tribunal Order</option><option value="hc-petition-filed" ${c.status === 'hc-petition-filed' ? 'selected' : ''}>High Court Petition Filed</option><option value="sc-petition-filed" ${c.status === 'sc-petition-filed' ? 'selected' : ''}>Supreme Court Petition Filed</option><option value="writ-filed" ${c.status === 'writ-filed' ? 'selected' : ''}>Writ Filed</option><option value="closed" ${c.status === 'closed' ? 'selected' : ''}>Closed</option><option value="dropped" ${c.status === 'dropped' ? 'selected' : ''}>Dropped</option></select>
        </div>
        </div>
        <b class="text-sm" style="display:block;margin:16px 0 10px;color:var(--gold)"><i class="fas fa-rupee-sign"></i> Amount Involved</b>
        <div class="cf-amount-grid">
          <div class="form-group"><label class="form-label">Tax (&#8377;)</label><input id="fe-tax" class="form-input cf-amt" type="number" value="${c.demandAmount || 0}" oninput="calcEditTotal()"></div>
          <div class="form-group"><label class="form-label">Penalty (&#8377;)</label><input id="fe-penalty" class="form-input cf-amt" type="number" value="${c.penaltyAmount || 0}" oninput="calcEditTotal()"></div>
          <div class="form-group"><label class="form-label">Interest (&#8377;)</label><input id="fe-interest" class="form-input cf-amt" type="number" value="${c.interestAmount || 0}" oninput="calcEditTotal()"></div>
          <div class="form-group"><label class="form-label">Other (&#8377;)</label><input id="fe-other-amt" class="form-input cf-amt" type="number" value="${c.otherAmount || 0}" oninput="calcEditTotal()"></div>
          <div class="form-group cf-total-group"><label class="form-label">Total Demand (&#8377;)</label><div id="fe-total" class="cf-total-display">&#8377; ${((c.demandAmount || 0) + (c.penaltyAmount || 0) + (c.interestAmount || 0) + (c.otherAmount || 0)).toLocaleString('en-IN')}</div></div>
          <div class="form-group"><label class="form-label" style="color:var(--green)">Collected / Paid (&#8377;)</label><input id="fe-collected" class="form-input cf-amt" type="number" value="${c.amountCollected || 0}"></div>
        </div>
      </div>
    </div>

    <!-- Section 3: Key Dates & Authority -->
    <div class="cf-section">
      <div class="cf-section-header" onclick="this.parentElement.classList.toggle('collapsed')"><i class="fas fa-calendar-alt"></i><span>3. Key Dates &amp; Authority</span><i class="fas fa-chevron-down cf-chev"></i></div>
      <div class="cf-section-body">

        <!-- ADJUDICATION -->
        <div style="font-size:10px;font-weight:800;letter-spacing:1.2px;color:#f59e0b;text-transform:uppercase;margin:0 0 8px;padding:4px 8px;background:#f59e0b18;border-radius:4px;border-left:3px solid #f59e0b"><i class="fas fa-balance-scale-left" style="margin-right:5px"></i>Adjudication Stage</div>
        <fieldset style="border:1px solid #f59e0b44;border-radius:6px;padding:12px;margin-bottom:8px;background:var(--bg2)">
          <legend style="font-size:11px;font-weight:700;color:#f59e0b;padding:0 6px">SCN â€“ DRC-01</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">Date of SCN</label><input id="fe-scndate" class="form-input" type="date" value="${c.scnDate || ''}"></div>
          <div class="form-group"><label class="form-label">Date of Comm. of SCN</label><input id="fe-scn-comm" class="form-input" type="date" value="${c.scnCommDate || ''}"></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">SCN Ref No.</label><input id="fe-case" class="form-input" value="${c.caseNo || ''}" placeholder="CGST/SCN/2024/001"></div>
          <div class="form-group"><label class="form-label">DIN (Document Identification No.)</label><input id="fe-din" class="form-input" value="${c.din || ''}" placeholder="e.g. 20240854M10000XY"></div></div>
        </fieldset>
        <fieldset style="border:1px solid #3b82f644;border-radius:6px;padding:12px;margin-bottom:8px;background:var(--bg2)">
          <legend style="font-size:11px;font-weight:700;color:#3b82f6;padding:0 6px">Reply to SCN â€“ DRC-06</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">Due Date</label><input id="fe-due-date" class="form-input" type="date" value="${c.dueDate || ''}"></div>
          <div class="form-group"><label class="form-label">Date of Online Filing</label><input id="fe-online-date" class="form-input" type="date" value="${c.onlineFilingDate || ''}"></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">Date of Physical Submission</label><input id="fe-physical-date" class="form-input" type="date" value="${c.physicalSubmitDate || ''}"></div>
          <div class="form-group"><label class="form-label">ARN (Application Ref No.)</label><input id="fe-arn" class="form-input" value="${c.arn || ''}" placeholder="e.g. AA220824XXXXXX"></div></div>
        </fieldset>
        <fieldset style="border:1px solid #0ea5e944;border-radius:6px;padding:12px;margin-bottom:8px;background:var(--bg2)">
          <legend style="font-size:11px;font-weight:700;color:#0ea5e9;padding:0 6px">Personal Hearing â€“ Adjudication (Sec 75)</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">PH Date (Primary)</label><input id="fe-adj-ph-date" class="form-input" type="date" value="${c.adjPhDate || ''}"></div>
          <div class="form-group"><label class="form-label">Notice / Order Ref</label><input id="fe-adj-ph-ref" class="form-input" value="${c.adjPhRef || ''}" placeholder="PH Notice ref"></div></div>
        </fieldset>
        <fieldset style="border:1px solid #ef444444;border-radius:6px;padding:12px;margin-bottom:16px;background:var(--bg2)">
          <legend style="font-size:11px;font-weight:700;color:#ef4444;padding:0 6px">OIO â€“ DRC-07</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">Date of Issue of OIO</label><input id="fe-oio-date" class="form-input" type="date" value="${c.oioDate || ''}"></div>
          <div class="form-group"><label class="form-label">Date of Comm. of OIO</label><input id="fe-oio-comm" class="form-input" type="date" value="${c.oioCommDate || ''}"></div></div>
        </fieldset>

        <!-- FIRST APPEAL -->
        <div style="font-size:10px;font-weight:800;letter-spacing:1.2px;color:#8b5cf6;text-transform:uppercase;margin:0 0 8px;padding:4px 8px;background:#8b5cf618;border-radius:4px;border-left:3px solid #8b5cf6"><i class="fas fa-arrow-up" style="margin-right:5px"></i>First Appeal Stage</div>
        <fieldset style="border:1px solid #8b5cf644;border-radius:6px;padding:12px;margin-bottom:8px;background:var(--bg2)">
          <legend style="font-size:11px;font-weight:700;color:#8b5cf6;padding:0 6px">Appeal against OIO â€“ APL-01</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">Appeal Filing Date</label><input id="fe-oia-date" class="form-input" type="date" value="${c.oiaDate || ''}"></div>
          <div class="form-group"><label class="form-label">APL-01 ARN / Ref</label><input id="fe-apl01-ref" class="form-input" value="${c.apl01Ref || ''}" placeholder="e.g. APL-01 ref"></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">Pre-deposit Amount (10%)</label><input id="fe-pre-deposit" class="form-input" type="number" value="${c.preDeposit || ''}" placeholder="â‚¹ Amount"></div>
          <div class="form-group"></div></div>
        </fieldset>
        <fieldset style="border:1px solid #a855f744;border-radius:6px;padding:12px;margin-bottom:8px;background:var(--bg2)">
          <legend style="font-size:11px;font-weight:700;color:#a855f7;padding:0 6px">Personal Hearing â€“ First Appeal (Sec 107)</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">Hearing Date</label><input id="fe-aph-date" class="form-input" type="date" value="${c.appealPhDate || ''}"></div>
          <div class="form-group"><label class="form-label">Notice / Order Ref</label><input id="fe-aph-ref" class="form-input" value="${c.appealPhRef || ''}" placeholder="Notice ref"></div></div>
        </fieldset>
        <fieldset style="border:1px solid #7c3aed44;border-radius:6px;padding:12px;margin-bottom:16px;background:var(--bg2)">
          <legend style="font-size:11px;font-weight:700;color:#7c3aed;padding:0 6px">Order-in-Appeal (OIA)</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">Date of OIA</label><input id="fe-oia-comm" class="form-input" type="date" value="${c.oiaCommDate || ''}"></div>
          <div class="form-group"><label class="form-label">Date of Comm. of OIA</label><input id="fe-oia-order-comm" class="form-input" type="date" value="${c.oiaOrderCommDate || ''}"></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">OIA Ref No.</label><input id="fe-oia-ref" class="form-input" value="${c.oiaRef || ''}" placeholder="OIA ref"></div>
          <div class="form-group"></div></div>
        </fieldset>

        <!-- SECOND APPEAL / GSTAT -->
        <div style="font-size:10px;font-weight:800;letter-spacing:1.2px;color:#6366f1;text-transform:uppercase;margin:0 0 8px;padding:4px 8px;background:#6366f118;border-radius:4px;border-left:3px solid #6366f1"><i class="fas fa-layer-group" style="margin-right:5px"></i>Second Appeal Stage (GSTAT)</div>
        <fieldset style="border:1px solid #6366f144;border-radius:6px;padding:12px;margin-bottom:8px;background:var(--bg2)">
          <legend style="font-size:11px;font-weight:700;color:#6366f1;padding:0 6px">Appeal against OIA â€“ APL-05 (GSTAT)</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">GSTAT Appeal Filing Date</label><input id="fe-gstat-date" class="form-input" type="date" value="${c.gstatAppealDate || ''}"></div>
          <div class="form-group"><label class="form-label">GSTAT ARN / Ref No.</label><input id="fe-gstat-arn" class="form-input" value="${c.gstatArn || ''}" placeholder="e.g. GSTAT ref"></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">Pre-deposit Amount (20%)</label><input id="fe-gstat-deposit" class="form-input" type="number" value="${c.gstatPreDeposit || ''}" placeholder="â‚¹ Amount"></div>
          <div class="form-group"></div></div>
        </fieldset>
        <fieldset style="border:1px solid #818cf844;border-radius:6px;padding:12px;margin-bottom:8px;background:var(--bg2)">
          <legend style="font-size:11px;font-weight:700;color:#818cf8;padding:0 6px">Personal Hearing â€“ GSTAT (Sec 112)</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">Hearing Date</label><input id="fe-gph-date" class="form-input" type="date" value="${c.gstatPhDate || ''}"></div>
          <div class="form-group"><label class="form-label">Notice / Order Ref</label><input id="fe-gph-ref" class="form-input" value="${c.gstatPhRef || ''}" placeholder="Notice ref"></div></div>
        </fieldset>
        <fieldset style="border:1px solid #4f46e544;border-radius:6px;padding:12px;margin-bottom:16px;background:var(--bg2)">
          <legend style="font-size:11px;font-weight:700;color:#4f46e5;padding:0 6px">Order of Tribunal</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">Tribunal Order Date</label><input id="fe-gstat-order-date" class="form-input" type="date" value="${c.gstatOrderDate || ''}"></div>
          <div class="form-group"><label class="form-label">Tribunal Comm. Date</label><input id="fe-gstat-order-comm" class="form-input" type="date" value="${c.gstatOrderCommDate || ''}"></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">Tribunal Order Ref</label><input id="fe-gstat-order-ref" class="form-input" value="${c.gstatOrderRef || ''}" placeholder="Tribunal ref"></div>
          <div class="form-group"></div></div>
        </fieldset>

        <!-- JUDICIAL REVIEW -->
        <div style="font-size:10px;font-weight:800;letter-spacing:1.2px;color:#dc2626;text-transform:uppercase;margin:0 0 8px;padding:4px 8px;background:#dc262618;border-radius:4px;border-left:3px solid #dc2626"><i class="fas fa-university" style="margin-right:5px"></i>Judicial Review</div>
        <fieldset style="border:1px solid #ec489944;border-radius:6px;padding:12px;margin-bottom:8px;background:var(--bg2)">
          <legend style="font-size:11px;font-weight:700;color:#ec4899;padding:0 6px">High Court (Sec 117)</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">HC Petition Date</label><input id="fe-hc-date" class="form-input" type="date" value="${c.hcPetitionDate || ''}"></div>
          <div class="form-group"><label class="form-label">HC Writ / Ref No.</label><input id="fe-hc-ref" class="form-input" value="${c.hcRef || ''}" placeholder="e.g. WP ref"></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">HC Order Date</label><input id="fe-hc-order-date" class="form-input" type="date" value="${c.hcOrderDate || ''}"></div>
          <div class="form-group"></div></div>
        </fieldset>
        <fieldset style="border:1px solid #dc262644;border-radius:6px;padding:12px;margin-bottom:16px;background:var(--bg2)">
          <legend style="font-size:11px;font-weight:700;color:#dc2626;padding:0 6px">Supreme Court (Sec 118)</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">SC / SLP Date</label><input id="fe-sc-date" class="form-input" type="date" value="${c.scPetitionDate || ''}"></div>
          <div class="form-group"><label class="form-label">SC SLP / Ref No.</label><input id="fe-sc-ref" class="form-input" value="${c.scRef || ''}" placeholder="e.g. SLP ref"></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">SC Order Date</label><input id="fe-sc-order-date" class="form-input" type="date" value="${c.scOrderDate || ''}"></div>
          <div class="form-group"></div></div>
        </fieldset>

        <!-- AUTHORITY & NOTES -->
        <div style="font-size:10px;font-weight:800;letter-spacing:1.2px;color:var(--text-muted);text-transform:uppercase;margin:0 0 8px;padding:4px 8px;background:var(--bg2);border-radius:4px;border-left:3px solid var(--border)"><i class="fas fa-building" style="margin-right:5px"></i>Authority &amp; Notes</div>
        <div class="form-row">${renderJurisdictionSelect('fe', c.jurisdiction || '')}
          <div class="form-group"><label class="form-label">Bill No. &amp; Date</label><input id="fe-bill" class="form-input" value="${c.billRef || ''}" placeholder="Bill reference"></div></div>
        <div class="form-group"><label class="form-label">Adjudicating / Appellate Authority with Address</label><textarea id="fe-authority" class="form-textarea" rows="2" placeholder="Name, designation and address of authority">${c.authority || ''}</textarea></div>
        <div class="form-group"><label class="form-label">Notes</label><textarea id="fe-notes" class="form-textarea" rows="2" placeholder="Any additional notes...">${escapeHTML(c.notes || '')}</textarea></div>
        <fieldset style="border:1px solid #10b98144;border-radius:6px;padding:12px;margin-bottom:12px;background:var(--bg2)">
          <legend style="font-size:12px;font-weight:700;color:#10b981;padding:0 6px">Closure / Outcome Details</legend>
          <div class="form-row"><div class="form-group"><label class="form-label">Closure Date</label><input id="fe-closure-date" class="form-input" type="date" value="${c.closureDate || ''}"></div>
          <div class="form-group"><label class="form-label">Outcome Summary</label><input id="fe-closure-outcome" class="form-input" value="${c.closureOutcome || ''}" placeholder="Final outcome if case is closed / dropped"></div></div>
          <div class="form-group"><label class="form-label">Final Authority / Order Ref</label><input id="fe-closure-authority" class="form-input" value="${c.closureAuthority || ''}" placeholder="Final authority, bench, order or settlement ref"></div>
          <div class="form-group"><label class="form-label">Closure Notes / Reason</label><textarea id="fe-closure-reason" class="form-textarea" rows="2" placeholder="Required when status is Closed or Dropped">${c.closureReason || ''}</textarea></div>
        </fieldset>
    </div>`,
    `<button class="btn btn-outline" onclick="Modal.close()">Cancel</button><button id="fe-save-case-btn" class="btn btn-primary" onclick="saveEditCase('${id}')"><i class="fas fa-save"></i> Save Changes</button>`
  );
  window.calcEditTotal = function () {
    const t = (Number(document.getElementById('fe-tax').value) || 0) + (Number(document.getElementById('fe-penalty').value) || 0) + (Number(document.getElementById('fe-interest').value) || 0) + (Number(document.getElementById('fe-other-amt').value) || 0);
    document.getElementById('fe-total').textContent = '\u20B9 ' + t.toLocaleString('en-IN');
  };
  if (!Auth.can('assign-cases')) {
    const allotted = document.getElementById('fe-allotted');
    if (allotted) allotted.disabled = true;
  }
};

window.saveEditCase = async function (id) {
  const saveBtn = document.getElementById('fe-save-case-btn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  }
  const restoreSaveButton = () => {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
    }
  };
  const legalNameVal = (document.getElementById('fe-legal-name') ? document.getElementById('fe-legal-name').value.trim() : '');
  const tradeNameVal  = (document.getElementById('fe-trade-name')  ? document.getElementById('fe-trade-name').value.trim()  : '');
  const name = legalNameVal || tradeNameVal || (document.getElementById('fe-name') ? document.getElementById('fe-name').value.trim() : '');
  const gstin = document.getElementById('fe-gstin') ? document.getElementById('fe-gstin').value.trim() : '';
  const section = document.getElementById('fe-section') ? document.getElementById('fe-section').value : '';

  if (!name) { toast('Legal or Trade Name is required', 'error'); restoreSaveButton(); return; }
  if (!gstin) { toast('GSTIN / PAN is required', 'error'); restoreSaveButton(); return; }
  
  if (gstin) {
    const gstinUpper = gstin.toUpperCase();
    if (gstinUpper.length === 15) {
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstinUpper)) {
        toast('Invalid GSTIN format', 'error'); restoreSaveButton(); return;
      }
    } else if (gstinUpper.length === 10) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(gstinUpper)) {
        toast('Invalid PAN format', 'error'); restoreSaveButton(); return;
      }
    } else {
      toast('GSTIN must be 15 chars or PAN 10 chars', 'error'); restoreSaveButton(); return;
    }
  }

  if (!section) { toast('Section Invoked is required', 'error'); restoreSaveButton(); return; }

  const atype = document.querySelector('input[name="fe-atype"]:checked');
  const atypeLabels = { 'reply-scn': 'SCN Reply / DRC-06', 'appeal-comm': 'Appeal to Appellate Authority - Sec. 107 / APL-01', 'appeal-tribunal': 'Appeal to Appellate Tribunal - Sec. 112 / APL-05', 'hc-appeal-writ': 'High Court Appeal / Writ - Sec. 117 / Art. 226', 'sc-appeal-slp': 'Supreme Court Appeal / SLP - Sec. 118 / Art. 136', 'revision-sec108': 'Revision by Revisional Authority - Sec. 108', 'rectification-sec161': 'Rectification of Mistake - Sec. 161', 'written-opinion': 'Written Legal Opinion', 'other': 'Other GST Proceeding' };
  const taxAmt = Number(document.getElementById('fe-tax').value) || 0;
  const penAmt = Number(document.getElementById('fe-penalty').value) || 0;
  const intAmt = Number(document.getElementById('fe-interest').value) || 0;
  const othAmt = Number(document.getElementById('fe-other-amt').value) || 0;
  const statusVal = document.getElementById('fe-status').value;
  const closureData = readClosureFields('fe-');
  if (!validateClosureForStatus(statusVal, closureData)) { restoreSaveButton(); return; }
  const updatedCase = _updateCase(id, c => {
    c.legalName = (document.getElementById('fe-legal-name') ? document.getElementById('fe-legal-name').value.trim() : '') || name;
  c.tradeName = (document.getElementById('fe-trade-name') ? document.getElementById('fe-trade-name').value.trim() : '');
  c.taxpayerName = c.legalName || name;
    c.gstin = gstin;
    c.clientAddress = document.getElementById('fe-address').value.trim();
    c.allottedTo = document.getElementById('fe-allotted').value;
    c.itn = document.getElementById('fe-itn').value;
    c.contactName = document.getElementById('fe-contact').value;
    c.mobile = document.getElementById('fe-mobile').value;
    c.email = document.getElementById('fe-email').value;
    c.state = document.getElementById('fe-state') ? document.getElementById('fe-state').value.trim() : '';
    c.reference = document.getElementById('fe-ref').value;
    c.assignmentType = atype ? atype.value : c.assignmentType;
    c.assignmentTypeLabel = atype ? atypeLabels[atype.value] : c.assignmentTypeLabel;
    c.caseNo = document.getElementById('fe-case').value.trim() || c.caseNo;
    c.priority = document.getElementById('fe-priority').value;
    c.receiptDate = document.getElementById('fe-receipt-date').value;
    c.commitDate = document.getElementById('fe-commit-date').value;
    c.section = document.getElementById('fe-section').value;
    c.caseOrigin = document.getElementById('fe-origin').value;
    c.period = document.getElementById('fe-period').value;
    c.issue = document.getElementById('fe-issue').value;
    c.status = statusVal;
    c.demandAmount = taxAmt;
    c.penaltyAmount = penAmt;
    c.interestAmount = intAmt;
    c.otherAmount = othAmt;
    c.totalAmount = taxAmt + penAmt + intAmt + othAmt;
    c.amountCollected = Number(document.getElementById('fe-collected').value) || 0;
    c.scnDate = document.getElementById('fe-scndate').value;
    c.scnCommDate = document.getElementById('fe-scn-comm').value;
    c.adjPhDate = document.getElementById('fe-adj-ph-date') ? document.getElementById('fe-adj-ph-date').value : (c.adjPhDate || '');
    c.adjPhRef = document.getElementById('fe-adj-ph-ref') ? document.getElementById('fe-adj-ph-ref').value : (c.adjPhRef || '');
    c.oioDate = document.getElementById('fe-oio-date').value;
    c.oioCommDate = document.getElementById('fe-oio-comm').value;
    c.oiaDate = document.getElementById('fe-oia-date') ? document.getElementById('fe-oia-date').value : (c.oiaDate || '');
    c.oiaCommDate = document.getElementById('fe-oia-comm') ? document.getElementById('fe-oia-comm').value : (c.oiaCommDate || '');
    c.oiaOrderCommDate = document.getElementById('fe-oia-order-comm') ? document.getElementById('fe-oia-order-comm').value : (c.oiaOrderCommDate || '');
    c.oiaRef = document.getElementById('fe-oia-ref') ? document.getElementById('fe-oia-ref').value : (c.oiaRef || '');
    c.apl01Ref = document.getElementById('fe-apl01-ref') ? document.getElementById('fe-apl01-ref').value : (c.apl01Ref || '');
    c.preDeposit = document.getElementById('fe-pre-deposit') ? (Number(document.getElementById('fe-pre-deposit').value) || 0) : (c.preDeposit || 0);
    c.dueDate = document.getElementById('fe-due-date').value;
    c.onlineFilingDate = document.getElementById('fe-online-date').value;
    c.physicalSubmitDate = document.getElementById('fe-physical-date').value;
    c.arn = document.getElementById('fe-arn').value;
    c.gstatAppealDate = document.getElementById('fe-gstat-date').value;
    c.gstatArn = document.getElementById('fe-gstat-arn').value;
    c.gstatPreDeposit = document.getElementById('fe-gstat-deposit') ? (Number(document.getElementById('fe-gstat-deposit').value) || 0) : (c.gstatPreDeposit || 0);
    c.gstatOrderDate = document.getElementById('fe-gstat-order-date') ? document.getElementById('fe-gstat-order-date').value : (c.gstatOrderDate || '');
    c.gstatOrderCommDate = document.getElementById('fe-gstat-order-comm') ? document.getElementById('fe-gstat-order-comm').value : (c.gstatOrderCommDate || '');
    c.gstatOrderRef = document.getElementById('fe-gstat-order-ref') ? document.getElementById('fe-gstat-order-ref').value : (c.gstatOrderRef || '');
    c.appealPhDate = document.getElementById('fe-aph-date') ? document.getElementById('fe-aph-date').value : (c.appealPhDate || '');
    c.appealPhRef = document.getElementById('fe-aph-ref') ? document.getElementById('fe-aph-ref').value : (c.appealPhRef || '');
    c.gstatPhDate = document.getElementById('fe-gph-date') ? document.getElementById('fe-gph-date').value : (c.gstatPhDate || '');
    c.gstatPhRef = document.getElementById('fe-gph-ref') ? document.getElementById('fe-gph-ref').value : (c.gstatPhRef || '');
    c.hcPetitionDate = document.getElementById('fe-hc-date').value;
    c.hcRef = document.getElementById('fe-hc-ref').value;
    c.hcOrderDate = document.getElementById('fe-hc-order-date') ? document.getElementById('fe-hc-order-date').value : (c.hcOrderDate || '');
    c.scPetitionDate = document.getElementById('fe-sc-date').value;
    c.scRef = document.getElementById('fe-sc-ref').value;
    c.scOrderDate = document.getElementById('fe-sc-order-date') ? document.getElementById('fe-sc-order-date').value : (c.scOrderDate || '');
    c.billRef = document.getElementById('fe-bill') ? document.getElementById('fe-bill').value : (c.billRef || '');
    c.jurisdiction = getJurisdictionValue('fe');
    c.authority = document.getElementById('fe-authority').value;
    c.closureDate = closureData.closureDate;
    c.closureOutcome = closureData.closureOutcome;
    c.closureAuthority = closureData.closureAuthority;
    c.closureReason = closureData.closureReason;
    c.notes = fieldValue('fe-notes', c.notes || '');
    normalizeCaseRecord(c);
  });
  if (!updatedCase) { restoreSaveButton(); return; }
  App.updateBadges();
  App.checkDeadlineAlerts();
  let excelSaved = false;
  try {
    excelSaved = await DB.flushNow();
  } catch (err) {
    showAppError('Could not sync case to Excel', err);
  }
  if (!excelSaved) {
    restoreSaveButton();
    toast('Case saved locally. Excel sync is pending; check the sync status chip.', 'warning', 5000);
    return;
  }
  Modal.close();
  showCaseDetail(id);
  toast('Case updated and saved to Excel', 'success');
};



// â”€â”€â”€ MODULE: DEADLINE CALCULATOR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
App.modules.deadlines = function () {
  document.getElementById('app-content').innerHTML = `
    <div class="page-header"><div class="page-title">Deadline Calculator</div><div class="page-subtitle">Auto-calculate statutory deadlines under the CGST Act 2017</div></div>
  <div class="grid-2">
    <div class="card">
      <b style="font-size:14px;display:block;margin-bottom:16px">Calculate GST Deadlines</b>
      <div class="form-group"><label class="form-label">Proceeding Type <span class="req">*</span></label>
        <select id="dl-type" class="form-select" onchange="calcDL()">
          <option value="sec73">Section 73 &mdash; No Fraud Demand (Up to FY 23-24)</option>
          <option value="sec74">Section 74 &mdash; Fraud Demand (Up to FY 23-24)</option>
          <option value="sec74A" style="font-weight:bold;color:#2563EB">Section 74A &mdash; Unified Proceeding (FY24-25 Onwards)</option>
          <option value="sec107">Section 107 &mdash; Appeal (Taxpayer)</option>
          <option value="sec112">Section 112 &mdash; GSTAT Appeal</option>
          <option value="sec54">Section 54 &mdash; Refund Application</option>
        </select>
      </div>
      <div class="form-group" id="dl-label-wrap"><label class="form-label" id="dl-base-label">Annual Return Due Date / Erroneous Refund Date</label>
        <input type="date" id="dl-base" class="form-input" onchange="calcDL()" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group" id="dl-scn-wrap"><label class="form-label">SCN Issue Date (if applicable)</label>
        <input type="date" id="dl-scn" class="form-input" onchange="calcDL()">
      </div>
      <div class="form-group" id="dl-order-wrap"><label class="form-label">Order/Decision Date (for appeal calculation)</label>
        <input type="date" id="dl-order" class="form-input" onchange="calcDL()" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <button class="btn btn-primary w-full" onclick="calcDL()"><i class="fas fa-calculator"></i> Calculate All Deadlines</button>
      <div id="dl-result"></div>
    </div>
    <div class="card">
      <b style="font-size:14px;display:block;margin-bottom:14px">Statutory Reference</b>
      <div id="dl-ref">${buildDLRef()}</div>
    </div>
  </div>`;
  calcDL();
};

function addMonths(d, m) { const r = new Date(d); r.setMonth(r.getMonth() + m); return r; }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function dlRow(label, date, note = '') {
  if (!date || isNaN(date)) return '';
  const days = Math.round((date - new Date()) / 86400000);
  const cls = days < 0 ? 'expired' : days <= 30 ? 'due-soon' : 'ok';
  return `<div class="deadline-row"><div><div class="deadline-label">${label}</div>${note ? `<div class="text-xs text-muted">${note}</div>` : ''}</div>
    <div class="text-right"><div class="deadline-date ${cls}">${fmtDate(date)}</div>
    <span class="deadline-days ${cls}">${days < 0 ? 'Expired ' + Math.abs(days) + 'd ago' : days === 0 ? 'TODAY' : days + 'd left'}</span></div></div>`;
}

window.calcDL = function () {
  const type = (document.getElementById('dl-type') ? document.getElementById('dl-type').value : null);
  const base = new Date((document.getElementById('dl-base') ? document.getElementById('dl-base').value : null));
  const scnVal = (document.getElementById('dl-scn') ? document.getElementById('dl-scn').value : null);
  const scnDate = scnVal ? new Date(scnVal) : null;
  const orderVal = (document.getElementById('dl-order') ? document.getElementById('dl-order').value : null);
  const orderDate = orderVal ? new Date(orderVal) : null;
  let rows = '';

  if (type === 'sec73') {
    rows += dlRow('Order must be passed by (3 years / 36 months from annual return)', addMonths(base, 36), 'Section 73(10)');
    rows += dlRow('SCN must be issued by (33 months from annual return)', addMonths(base, 33), 'At least 3 months prior to order deadline &rarr; Section 73(2)');
    if (scnDate) { rows += dlRow('Opportunity to pay without penalty (within 30 days of SCN)', addDays(scnDate, 30), 'Pay tax + interest &rarr; no penalty (Section 73(8))'); }
    rows += dlRow('Voluntary audit correction (self-assess before SCN)', base, 'Pay tax + interest &rarr; avoids all proceedings (Section 73(5))');
  } else if (type === 'sec74A') {
    rows += dlRow('SCN must be issued by (42 months from annual return)', addMonths(base, 42), 'Unified deadline for FY 24-25 onwards &rarr; Section 74A');
    if (scnDate) {
      rows += dlRow('Order must be passed by (12 months from SCN)', addMonths(scnDate, 12), 'Extendable by 6 months maximum');
      rows += dlRow('Pay at 15% penalty (within 60 days of SCN)', addDays(scnDate, 60), 'Reduced penalty if paid early');
      rows += dlRow('Pay at 25% penalty (within 60 days of Order)', orderDate ? addDays(orderDate, 60) : null, 'Penalty after adjudication');
    }
  } else if (type === 'sec74') {
    rows += dlRow('Order must be passed by (5 years / 60 months from annual return)', addMonths(base, 60), 'Extended period for fraud &rarr; Section 74(10)');
    rows += dlRow('SCN must be issued by (54 months from annual return)', addMonths(base, 54), 'At least 6 months prior to order deadline &rarr; Section 74(2)');
    if (scnDate) { rows += dlRow('Pay at 25% penalty (within 30 days of SCN)', addDays(scnDate, 30), 'Section 74(8)'); }
    if (orderDate) { rows += dlRow('Pay at 50% penalty (within 30 days of Order)', addDays(orderDate, 30), 'Section 74(11)'); }
  } else if (type === 'sec107') {
    if (orderDate) {
      rows += dlRow('Appeal filing deadline (taxpayer &mdash; 3 months)', addMonths(orderDate, 3), 'Section 107(1)');
      rows += dlRow('Condonation limit (1 extra month)', addMonths(orderDate, 4), 'If sufficient cause shown');
      rows += dlRow('Pre-deposit due before appeal: 10% of disputed tax', orderDate, 'Max &#8377;25 Cr (CGST+SGST+IGST)');
      rows += dlRow('Dept appeal deadline (6 months)', addMonths(orderDate, 6), 'Section 107(2)');
    }
  } else if (type === 'sec112') {
    if (orderDate) {
      rows += dlRow('GSTAT appeal deadline (3 months)', addMonths(orderDate, 3), 'Section 112(1)');
      rows += dlRow('Additional pre-deposit: 20% of remaining disputed tax', orderDate, 'Max &#8377;50 Cr (CGST+SGST shared)');
      rows += dlRow('HC appeal from GSTAT order (180 days)', addDays(orderDate, 180), 'Section 117 &mdash; condonable');
    }
  } else if (type === 'sec54') {
    rows += dlRow('Refund application deadline (2 years from relevant date)', addMonths(base, 24), 'Section 54(1)');
    rows += `<div class="deadline-row"><div class="deadline-label">Processing time</div><div><span class="deadline-days ok">60 days</span></div></div>`;
    rows += `<div class="deadline-row"><div><div class="deadline-label">Interest on delay (beyond 60 days)</div><div class="text-xs text-muted">6% p.a. (standard) | 9% p.a. (court ordered)</div></div></div>`;
  }

  const result = document.getElementById('dl-result');
  if (result) result.innerHTML = rows ? `<div class="deadline-result-box mt-3">${rows}</div>` : '';
};

function buildDLRef() {
  return `<div class="timeline">
  ${[
      ['Section 73 SCN', '33 months from annual return', 'For periods up to FY 23-24'],
      ['Section 73 Order', '3 years (36 months)', 'Demand without fraud'],
      ['Section 74 SCN', '54 months from annual return', 'For periods up to FY 23-24'],
      ['Section 74 Order', '5 years (60 months)', 'Fraud cases only'],
      ['Section 74A SCN', '42 months from annual return', 'Unified Proceeding (FY24-25 onwards)'],
      ['Section 74A Order', '12 months from SCN', 'Extendable by 6 months'],
      ['Appeal &mdash; Sec 107 (Taxpayer)', '3 months + 1 month condonation', '10% pre-deposit required'],
      ['Appeal &mdash; Sec 107 (Dept)', '6 months from order', ''],
      ['GSTAT &mdash; Sec 112', '3 months from AA order', '20% additional pre-deposit'],
      ['High Court &mdash; Sec 117', '180 days from GSTAT order', 'Substantial question of law'],
      ['Refund &mdash; Sec 54', '2 years from relevant date', 'Provisional: 90% in 7 days']
    ].map(([t, d, n], i) => `<div class="timeline-item ${i % 2 === 0 ? 'done' : 'active'}">
      <div class="timeline-dot" style="font-size:9px">${i + 1}</div>
      <div class="timeline-line"></div>
      <div class="timeline-content">
        <div class="timeline-title">${t}</div>
        <div class="timeline-date text-gold">${d}</div>
        ${n ? `<div class="text-xs text-muted">${n}</div>` : ''}
      </div></div>`).join('')
    }
  </div>`;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// â”€â”€â”€ BOOT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window.addEventListener('error', function(e) {
  console.error('[WindowError]', e.error || e.message);
  if (document.getElementById('toast-container')) toast('A screen error was caught. Your data is still safe.', 'error', 4500);
});
window.addEventListener('unhandledrejection', function(e) {
  console.error('[UnhandledPromise]', e.reason);
  if (document.getElementById('toast-container')) toast('A background task failed but the app stayed open.', 'warning', 4500);
});
document.addEventListener('DOMContentLoaded', () => { if (!App._booted) { App._booted = true; App.init(); } });
setTimeout(() => { if (!App._booted) { App._booted = true; App.init(); } }, 200);
setTimeout(() => { if (!App._booted) { App._booted = true; App.init(); } }, 800);

window.pickClientForCase = function(clientId) {
  if (!clientId) return;
  const cl = DB.getArr("clients").find(c => c.id === clientId);
  if (!cl) return;
  if (document.getElementById("fc-legal-name")) document.getElementById("fc-legal-name").value = cl.legalName || cl.name || "";
  if (document.getElementById("fc-trade-name")) document.getElementById("fc-trade-name").value = cl.tradeName || "";
  if (document.getElementById("fc-gstin")) document.getElementById("fc-gstin").value = cl.gstin || "";
  if (document.getElementById("fc-address")) document.getElementById("fc-address").value = cl.address || "";
  if (document.getElementById("fc-mobile")) document.getElementById("fc-mobile").value = cl.mobile || "";
  if (document.getElementById("fc-email")) document.getElementById("fc-email").value = cl.email || "";
  if (document.getElementById("fc-contact")) document.getElementById("fc-contact").value = cl.contactName || cl.legalName || cl.name || "";
  toast("Client details pre-filled","info");
};


