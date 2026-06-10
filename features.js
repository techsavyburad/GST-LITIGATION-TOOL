// ============================================================
// GST LITIGATION PRO — features.js
// CORE MODULES: Pipeline, Clients, Hearings, Tasks, Notifications
// ============================================================

// ─── MODULE LABELS ───────────────────────────────────────────
(function() {
  const orig = App.moduleLabel.bind(App);
  App.moduleLabel = function(mod) {
    const extra = {
      dashboard: 'Executive Dashboard',
      pipeline: 'Case Pipeline', 
      clients: 'Client Master',
      hearings: 'Hearing Tracker', 
      tasks: 'Task Manager',
      notifications: 'Notifications',
      reports: 'Reports'
    };
    return extra[mod] || orig(mod);
  };
})();

// ─── HELPERS ─────────────────────────────────────────────────
function fmtDateShort(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function caseOptions() {
  return DB.getArr('cases').map(c =>
    `<option value="${c.id}">${c.taxpayerName} — ${c.caseNo}</option>`).join('');
}

// ═══════════════════════════════════════════════════════════════
// MODULE 0: EXECUTIVE DASHBOARD
// ═══════════════════════════════════════════════════════════════
App.modules.dashboard = function() {
  const cases = DB.getArr('cases');
  const activeCases = cases.filter(c => !['closed', 'dropped'].includes(c.status));
  const upcomingHearings = cases.flatMap(c => (c.hearings || []).map(h => ({ ...h, caseNo: c.caseNo, taxpayerName: c.taxpayerName, caseId: c.id })))
    .filter(h => h.date && daysFromNow(h.date) >= 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalDemand = activeCases.reduce((s, c) => s + (c.totalAmount || (c.demandAmount||0)+(c.penaltyAmount||0)+(c.interestAmount||0)), 0);
  const criticalCases = activeCases.filter(c => c.priority === 'critical').length;
  const dueIn7Days = activeCases.filter(c => c.dueDate && daysFromNow(c.dueDate) <= 7 && daysFromNow(c.dueDate) >= 0).length;

  document.getElementById('app-content').innerHTML = `
    <div class="page-header">
      <div class="page-header-row">
        <div>
          <div class="page-title">Executive Dashboard</div>
          <div class="page-subtitle">Litigation Portfolio Performance Summary</div>
        </div>
        <div class="flex gap-2">
           <button class="btn btn-outline" onclick="App.navigate('cases')"><i class="fas fa-list"></i> Case Register</button>
           <button class="btn btn-primary" onclick="openAddCase()"><i class="fas fa-plus-circle"></i> New Case</button>
        </div>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
      <div class="stat-card" style="border-bottom: 3px solid var(--blue)">
        <div class="stat-card-top"><span class="stat-label">ACTIVE CASES</span><span class="stat-icon blue"><i class="fas fa-folder-open"></i></span></div>
        <div class="stat-value">${activeCases.length}</div>
        <div class="stat-change">${cases.length} total filed</div>
      </div>
      <div class="stat-card" style="border-bottom: 3px solid var(--orange)">
        <div class="stat-card-top"><span class="stat-label">TOTAL EXPOSURE</span><span class="stat-icon orange"><i class="fas fa-rupee-sign"></i></span></div>
        <div class="stat-value" style="font-size: 20px;">₹${(totalDemand/10000000).toFixed(2)} Cr</div>
        <div class="stat-change">Principal + Int + Pen</div>
      </div>
      <div class="stat-card" style="border-bottom: 3px solid var(--red)">
        <div class="stat-card-top"><span class="stat-label">CRITICAL</span><span class="stat-icon red"><i class="fas fa-fire"></i></span></div>
        <div class="stat-value">${criticalCases}</div>
        <div class="stat-change">Immediate Attention</div>
      </div>
      <div class="stat-card" style="border-bottom: 3px solid var(--purple)">
        <div class="stat-card-top"><span class="stat-label">DEADLINES (7D)</span><span class="stat-icon purple"><i class="fas fa-clock"></i></span></div>
        <div class="stat-value">${dueIn7Days}</div>
        <div class="stat-change">Upcoming Submissions</div>
      </div>
    </div>

    <div class="grid-2 mb-4">
      <div class="card p-0 overflow-hidden">
        <div class="p-4 border-bottom flex justify-between items-center bg-light">
          <b style="font-size: 14px;"><i class="fas fa-chart-pie mr-2"></i> Demand Distribution</b>
          <div class="text-muted text-xs">By Case Status</div>
        </div>
        <div class="p-4" style="height: 250px;">
          <canvas id="demandChart"></canvas>
        </div>
      </div>
      
      <div class="card p-0 overflow-hidden">
        <div class="p-4 border-bottom flex justify-between items-center bg-light">
          <b style="font-size: 14px;"><i class="fas fa-gem mr-2"></i> High Value Cases</b>
          <button class="btn btn-ghost btn-xs" onclick="App.navigate('cases')">View Register</button>
        </div>
        <div class="p-2" id="dash-high-value-list">
          ${renderHighValueCases()}
        </div>
      </div>
    </div>

    <div class="card p-0 overflow-hidden">
      <div class="p-4 border-bottom bg-light flex justify-between items-center">
        <b style="font-size: 14px;"><i class="fas fa-calendar-check mr-2"></i> Hearing Schedule</b>
        <button class="btn btn-ghost btn-xs" onclick="App.navigate('hearings')">Full Tracker</button>
      </div>
      <div class="p-0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client / Case</th>
              <th>Authority</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${upcomingHearings.slice(0, 5).map(h => `
              <tr>
                <td class="font-mono"><b>${fmtDateShort(h.date)}</b></td>
                <td>
                  <div style="font-weight:600">${h.taxpayerName}</div>
                  <div class="text-muted text-xs">${h.caseNo}</div>
                </td>
                <td>${h.authority || '—'}</td>
                <td><span class="badge badge-blue">${h.status || 'SCHEDULED'}</span></td>
                <td><button class="btn btn-xs btn-outline" onclick="showCaseDetail('${h.caseId}')">View</button></td>
              </tr>
            `).join('') || '<tr><td colspan="5" class="text-center p-4 text-muted">No upcoming hearings found</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  setTimeout(() => initDemandChart(), 100);
};

function renderHighValueCases() {
  const cases = DB.getArr('cases')
    .sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0))
    .slice(0, 5);

  if (cases.length === 0) return '<div class="p-6 text-center text-muted text-sm">No cases found.</div>';

  return cases.map(c => `
    <div class="flex items-center gap-3 p-3 hover-bg-light rounded-sm transition cursor-pointer mb-1" onclick="showCaseDetail('${c.id}')">
      <div style="width:32px;height:32px;border-radius:50%;background:var(--gold-dim);display:flex;align-items:center;justify-content:center;color:var(--gold);flex-shrink:0">
        <i class="fas fa-rupee-sign" style="font-size:12px"></i>
      </div>
      <div class="flex-1 min-width-0">
        <div style="font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.taxpayerName}</div>
        <div class="text-muted text-xs">${c.caseNo} &middot; <span style="color:var(--orange);font-weight:700">${fmtINR(c.totalAmount || 0)}</span></div>
      </div>
    </div>
  `).join('');
}

function initDemandChart() {
  const ctx = document.getElementById('demandChart');
  if (!ctx || !window.Chart) return;

  const cases = DB.getArr('cases');
  const stats = {};
  cases.forEach(c => {
    const status = c.status || 'new-lead';
    const amount = (c.totalAmount || (c.demandAmount || 0) + (c.penaltyAmount || 0) + (c.interestAmount || 0));
    stats[status] = (stats[status] || 0) + amount;
  });

  const labels = Object.keys(stats).map(s => s.replace(/-/g, ' ').toUpperCase());
  const data = Object.values(stats);

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#2563EB', '#D97706', '#DC2626', '#059669', '#7C3AED', '#EA580C', '#64748B'],
        borderWidth: 0,
        hoverOffset: 12
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          position: 'right',
          labels: { usePointStyle: true, padding: 15, font: { size: 10, family: "'Inter', sans-serif" } }
        },
        tooltip: {
          callbacks: {
            label: function(c) { return ' ₹' + (c.raw/100000).toFixed(1) + ' L'; }
          }
        }
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// MODULE 1: CASE PIPELINE (KANBAN)
// ═══════════════════════════════════════════════════════════════
function dashCaseExposure(c) {
  return Number(c.totalAmount) || (Number(c.demandAmount) || 0) + (Number(c.penaltyAmount) || 0) + (Number(c.interestAmount) || 0) + (Number(c.otherAmount) || 0);
}

function dashCaseName(c) {
  return escapeHTML(c.taxpayerName || c.legalName || c.tradeName || 'Unnamed case');
}

function dashTopStage(cases) {
  const counts = {};
  cases.forEach(c => {
    const stage = c.status || 'new-lead';
    counts[stage] = (counts[stage] || 0) + 1;
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!top) return { label: 'No active matters', count: 0 };
  return { label: getCaseStageMeta(top[0]).label, count: top[1] };
}

function dashStageFlow(cases) {
  if (!cases.length) return '<div class="empty-state-sm">No active case flow to show.</div>';
  const maxCount = Math.max(1, ...CASE_STAGE_GROUPS.map(group => cases.filter(c => getCaseFilterStages(group.id).includes(c.status || 'new-lead')).length));
  return CASE_STAGE_GROUPS.map(group => {
    const groupStages = getCaseFilterStages(group.id);
    const list = cases.filter(c => groupStages.includes(c.status || 'new-lead'));
    const exposure = list.reduce((sum, c) => sum + dashCaseExposure(c), 0);
    const width = Math.max(6, Math.round((list.length / maxCount) * 100));
    return `
      <div class="stage-flow-row">
        <div class="stage-flow-top">
          <span>${escapeHTML(group.label)}</span>
          <b>${list.length} &middot; ${fmtINR(exposure)}</b>
        </div>
        <div class="dash-band-track"><div class="dash-band-fill ${escapeHTML(group.color)}" style="width:${width}%"></div></div>
      </div>`;
  }).join('');
}

function dashDeadlineList(cases) {
  const due = cases.filter(c => c.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 6);
  if (!due.length) return '<div class="empty-state-sm">No active deadlines recorded.</div>';
  return due.map(c => {
    const days = daysFromNow(c.dueDate);
    const tone = days < 0 ? 'danger' : days <= 7 ? 'warning' : 'info';
    const badge = tone === 'danger' ? 'red' : tone === 'warning' ? 'orange' : 'blue';
    const label = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`;
    return `
      <div class="tracker-item ${tone}" onclick="showCaseDetail('${c.id}')">
        <div class="tracker-head">
          <div>
            <div class="tracker-title">${dashCaseName(c)}</div>
            <div class="tracker-sub">${escapeHTML(c.caseNo || c.id)} &middot; ${escapeHTML(getCaseStageMeta(c.status).label)}</div>
          </div>
          <span class="badge badge-${badge}">${label}</span>
        </div>
        <div class="tracker-meta">
          <span class="mini-pill"><i class="fas fa-calendar"></i> ${fmtDateShort(c.dueDate)}</span>
          <span class="mini-pill"><i class="fas fa-user"></i> ${escapeHTML(resolveEmployeeName(c.allottedTo))}</span>
        </div>
      </div>`;
  }).join('');
}

function dashHighValueList(cases) {
  const highValue = cases.slice().sort((a, b) => dashCaseExposure(b) - dashCaseExposure(a)).slice(0, 5);
  if (!highValue.length) return '<div class="empty-state-sm">No high value active cases.</div>';
  return highValue.map(c => `
    <div class="spotlight-item" onclick="showCaseDetail('${c.id}')">
      <div class="spotlight-head">
        <div>
          <div class="spotlight-title">${dashCaseName(c)}</div>
          <div class="spotlight-sub">${escapeHTML(c.caseNo || c.id)} &middot; ${escapeHTML(getCaseStageMeta(c.status).label)}</div>
        </div>
        <span class="badge badge-${getCaseStageBadgeColor(c.status)}">${escapeHTML(c.priority || 'medium')}</span>
      </div>
      <div class="spotlight-metrics">
        <span class="mini-pill alert"><i class="fas fa-scale-balanced"></i> ${fmtINR(dashCaseExposure(c))}</span>
        <span class="mini-pill info"><i class="fas fa-book"></i> Sec ${escapeHTML(c.section || '-')}</span>
        ${c.dueDate ? `<span class="mini-pill ${daysFromNow(c.dueDate) <= 7 ? 'alert' : 'info'}"><i class="fas fa-clock"></i> ${fmtDateShort(c.dueDate)}</span>` : ''}
      </div>
    </div>`).join('');
}

function dashOwnerLoad(cases) {
  if (!cases.length) return '<div class="empty-state-sm">No active owner load.</div>';
  const owners = {};
  cases.forEach(c => {
    const name = resolveEmployeeName(c.allottedTo);
    if (!owners[name]) owners[name] = { name, count: 0, urgent: 0, exposure: 0 };
    owners[name].count += 1;
    owners[name].urgent += c.dueDate && daysFromNow(c.dueDate) <= 7 ? 1 : 0;
    owners[name].exposure += dashCaseExposure(c);
  });
  return Object.values(owners).sort((a, b) => b.count - a.count).slice(0, 5).map(owner => {
    const initials = owner.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'NA';
    return `
      <div class="owner-row">
        <div class="owner-avatar">${escapeHTML(initials)}</div>
        <div class="owner-main">
          <div class="owner-head"><b>${escapeHTML(owner.name)}</b><span>${owner.count} matter(s)</span></div>
          <div class="owner-meta">${owner.urgent} urgent &middot; ${fmtINR(owner.exposure)}</div>
        </div>
      </div>`;
  }).join('');
}

function dashHearingList(hearings) {
  if (!hearings.length) return '<div class="empty-state-sm">No upcoming hearings found.</div>';
  return hearings.slice(0, 5).map(h => `
    <div class="tracker-item" onclick="showCaseDetail('${h.caseId}')">
      <div class="tracker-head">
        <div>
          <div class="tracker-title">${escapeHTML(h.taxpayerName || 'Unnamed case')}</div>
          <div class="tracker-sub">${escapeHTML(h.caseNo || '')} &middot; ${escapeHTML(h.authority || 'Authority pending')}</div>
        </div>
        <span class="badge badge-blue">${escapeHTML(h.status || 'Scheduled')}</span>
      </div>
      <div class="tracker-meta">
        <span class="mini-pill info"><i class="fas fa-calendar-check"></i> ${fmtDateShort(h.date)}</span>
        <span class="mini-pill"><i class="fas fa-gavel"></i> PH / hearing</span>
      </div>
    </div>`).join('');
}

App.modules.dashboard = function() {
  const cases = DB.getArr('cases');
  const activeCases = cases.filter(c => !['closed', 'dropped'].includes(c.status));
  const upcomingHearings = cases.flatMap(c => (c.hearings || []).map(h => ({
    ...h,
    caseNo: c.caseNo,
    taxpayerName: c.taxpayerName,
    authority: h.authority || c.authority || c.jurisdiction,
    caseId: c.id
  }))).filter(h => h.date && daysFromNow(h.date) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date));
  const totalDemand = activeCases.reduce((s, c) => s + dashCaseExposure(c), 0);
  const totalCollected = activeCases.reduce((s, c) => s + (Number(c.amountCollected) || getCasePaidAmount(c) || 0), 0);
  const criticalCases = activeCases.filter(c => c.priority === 'critical').length;
  const dueIn7Days = activeCases.filter(c => c.dueDate && daysFromNow(c.dueDate) <= 7 && daysFromNow(c.dueDate) >= 0).length;
  const overdueCases = activeCases.filter(c => c.dueDate && daysFromNow(c.dueDate) < 0).length;
  const unassignedCases = activeCases.filter(c => !c.allottedTo).length;
  const topStage = dashTopStage(activeCases);
  const nextHearing = upcomingHearings[0];
  const healthScore = Math.max(8, Math.min(100, Math.round(100 - (criticalCases * 8) - (overdueCases * 10) - (unassignedCases * 4))));
  const recoveryRate = totalDemand > 0 ? Math.round((totalCollected / totalDemand) * 100) : 0;

  document.getElementById('app-content').innerHTML = `
    <div class="dashboard-shell motion-stagger">
      <div class="dashboard-toolbar">
        <div>
          <div class="page-title">Executive Dashboard</div>
          <div class="page-subtitle">Live litigation command center for deadlines, exposure, hearings, and drafting focus.</div>
        </div>
        <div class="dashboard-toolbar-actions">
          <button class="btn btn-outline" onclick="App.refreshDataNow()"><i class="fas fa-sync-alt"></i> Sync</button>
          <button class="btn btn-outline" onclick="App.navigate('cases')"><i class="fas fa-list"></i> Register</button>
          <button class="btn btn-primary" onclick="openAddCase()"><i class="fas fa-plus-circle"></i> New Case</button>
        </div>
      </div>

      <section class="command-hero dashboard-command-hero">
        <div class="command-hero-grid">
          <div>
            <div class="dashboard-eyebrow">GST Litigation Pro</div>
            <div class="page-title">Portfolio Control Room</div>
            <div class="page-subtitle">Prioritize matters by legal risk, demand exposure, stage movement, and client commitment dates.</div>
            <div class="dashboard-access-row">
              <span><i class="fas fa-scale-balanced"></i> ${activeCases.length} active</span>
              <span><i class="fas fa-calendar-day"></i> ${dueIn7Days} due in 7 days</span>
              <span><i class="fas fa-user-clock"></i> ${unassignedCases} unassigned</span>
            </div>
          </div>
          <div class="hero-meta">
            <div class="hero-health-card">
              <div class="health-ring" style="--score:${healthScore}"><span>${healthScore}</span></div>
              <div>
                <div class="hero-meta-label">Control Score</div>
                <div class="hero-meta-value">${healthScore >= 78 ? 'Healthy portfolio' : healthScore >= 55 ? 'Watch list active' : 'Immediate review needed'}</div>
                <div class="hero-kpi-note">${overdueCases} overdue &middot; ${criticalCases} critical</div>
              </div>
            </div>
            <div class="hero-meta-card">
              <div class="hero-meta-label">Next Hearing</div>
              <div class="hero-meta-value">${nextHearing ? `${escapeHTML(nextHearing.taxpayerName)} on ${fmtDateShort(nextHearing.date)}` : 'No upcoming hearing'}</div>
            </div>
          </div>
        </div>
        <div class="hero-kpis">
          <div class="hero-kpi">
            <div class="hero-kpi-label">Active Exposure</div>
            <div class="hero-kpi-value">${fmtINR(totalDemand)}</div>
            <div class="hero-kpi-note">Open matters only</div>
          </div>
          <div class="hero-kpi">
            <div class="hero-kpi-label">Recovered / Paid</div>
            <div class="hero-kpi-value">${recoveryRate}%</div>
            <div class="hero-kpi-note">${fmtINR(totalCollected)} captured</div>
          </div>
          <div class="hero-kpi">
            <div class="hero-kpi-label">Top Stage</div>
            <div class="hero-kpi-value">${topStage.count}</div>
            <div class="hero-kpi-note">${escapeHTML(topStage.label)}</div>
          </div>
        </div>
      </section>

      <div class="stats-grid dashboard-stats-grid">
        <button class="stat-card stat-card-action" onclick="App.navigate('cases')">
          <div class="stat-card-top"><span class="stat-label">ACTIVE CASES</span><span class="stat-icon blue"><i class="fas fa-folder-open"></i></span></div>
          <div class="stat-value">${activeCases.length}</div>
          <div class="stat-change">${cases.length} total records</div>
        </button>
        <button class="stat-card stat-card-action" onclick="App.navigate('cases')">
          <div class="stat-card-top"><span class="stat-label">OVERDUE</span><span class="stat-icon red"><i class="fas fa-triangle-exclamation"></i></span></div>
          <div class="stat-value">${overdueCases}</div>
          <div class="stat-change down">requires immediate action</div>
        </button>
        <button class="stat-card stat-card-action" onclick="App.navigate('hearings')">
          <div class="stat-card-top"><span class="stat-label">HEARINGS</span><span class="stat-icon purple"><i class="fas fa-gavel"></i></span></div>
          <div class="stat-value">${upcomingHearings.length}</div>
          <div class="stat-change">upcoming schedule</div>
        </button>
        <button class="stat-card stat-card-action" onclick="App.navigate('pipeline')">
          <div class="stat-card-top"><span class="stat-label">PIPELINE</span><span class="stat-icon green"><i class="fas fa-columns"></i></span></div>
          <div class="stat-value">${topStage.count}</div>
          <div class="stat-change">${escapeHTML(topStage.label)}</div>
        </button>
      </div>

      <div class="dashboard-lead-grid">
        <div class="card">
          <div class="card-header-line">
            <div><b>Stage Flow</b><div class="card-header-copy">Demand and case count by litigation stage.</div></div>
            <button class="btn btn-ghost btn-sm" onclick="App.navigate('pipeline')">Open Pipeline</button>
          </div>
          <div class="stage-flow-list">${dashStageFlow(activeCases)}</div>
        </div>

        <div class="card">
          <div class="card-header-line">
            <div><b>Deadline Focus</b><div class="card-header-copy">Nearest response, appeal, or hearing commitment.</div></div>
            <button class="btn btn-ghost btn-sm" onclick="App.navigate('cases')">View Cases</button>
          </div>
          <div class="tracker-list">${dashDeadlineList(activeCases)}</div>
        </div>
      </div>

      <div class="dashboard-insight-grid">
        <div class="card">
          <div class="card-header-line"><div><b>High Value Watch</b><div class="card-header-copy">Largest active exposures first.</div></div></div>
          <div class="spotlight-list">${dashHighValueList(activeCases)}</div>
        </div>
        <div class="card">
          <div class="card-header-line"><div><b>Owner Load</b><div class="card-header-copy">Matter allocation and urgent ownership.</div></div></div>
          <div class="owner-list">${dashOwnerLoad(activeCases)}</div>
        </div>
        <div class="card">
          <div class="card-header-line">
            <div><b>Hearing Schedule</b><div class="card-header-copy">Upcoming PH and appellate hearing events.</div></div>
            <button class="btn btn-ghost btn-sm" onclick="App.navigate('hearings')">Tracker</button>
          </div>
          <div class="tracker-list">${dashHearingList(upcomingHearings)}</div>
        </div>
      </div>
    </div>`;
};

window._polishedDashboard = App.modules.dashboard;

App.modules.pipeline = function() {

  // Stage groups with legal form codes and metadata
  const stageGroups = [
    {
      groupId: 'adjudication',
      groupLabel: 'Adjudication Stage',
      groupColor: '#f59e0b',
      groupIcon: 'fa-balance-scale-left',
      stages: [
        { id: 'new-lead',     label: 'New Lead',           subLabel: 'Pre-SCN',       form: '',        icon: 'fa-plus-circle',       color: '#94a3b8' },
        { id: 'scn-received', label: 'SCN Received',       subLabel: 'DRC-01',        form: 'DRC-01',  icon: 'fa-envelope-open-text', color: '#f59e0b' },
        { id: 'reply-filed',  label: 'Reply Filed',        subLabel: 'DRC-06',        form: 'DRC-06',  icon: 'fa-file-upload',        color: '#3b82f6' },
        { id: 'ph-pending',   label: 'Personal Hearing',   subLabel: 'Sec 75(4)',     form: 'PH',      icon: 'fa-microphone-alt',     color: '#0ea5e9' },
        { id: 'oio-received', label: 'OIO Received',       subLabel: 'DRC-07',        form: 'DRC-07',  icon: 'fa-gavel',              color: '#ef4444' },
      ]
    },
    {
      groupId: 'first-appeal',
      groupLabel: 'First Appeal Stage',
      groupColor: '#8b5cf6',
      groupIcon: 'fa-arrow-up',
      stages: [
        { id: 'appeal-filed', label: 'Appeal Filed',       subLabel: 'APL-01',        form: 'APL-01',  icon: 'fa-file-signature',     color: '#8b5cf6' },
        { id: 'appeal-ph',    label: 'Hearing (Appeal)',   subLabel: 'Sec 107',       form: 'PH',      icon: 'fa-microphone-alt',     color: '#a855f7' },
        { id: 'oia-received', label: 'OIA Received',       subLabel: 'Order-in-Appeal', form: 'OIA',   icon: 'fa-balance-scale',      color: '#7c3aed' },
      ]
    },
    {
      groupId: 'second-appeal',
      groupLabel: 'Second Appeal Stage',
      groupColor: '#6366f1',
      groupIcon: 'fa-layer-group',
      stages: [
        { id: 'gstat-appeal-filed', label: 'GSTAT Appeal',  subLabel: 'APL-05',      form: 'APL-05',  icon: 'fa-layer-group',        color: '#6366f1' },
        { id: 'gstat-ph',           label: 'Hearing (GSTAT)', subLabel: 'Sec 112',   form: 'PH',      icon: 'fa-microphone-alt',     color: '#818cf8' },
        { id: 'tribunal-order',     label: 'Tribunal Order', subLabel: 'Final Fact-finding', form: '',  icon: 'fa-scroll',            color: '#4f46e5' },
      ]
    },
    {
      groupId: 'judicial',
      groupLabel: 'Judicial Review',
      groupColor: '#dc2626',
      groupIcon: 'fa-university',
      stages: [
        { id: 'hc-petition-filed', label: 'High Court',    subLabel: 'Sec 117',      form: 'WP',      icon: 'fa-university',         color: '#ec4899' },
        { id: 'sc-petition-filed', label: 'Supreme Court', subLabel: 'Sec 118 / SLP', form: 'SLP',    icon: 'fa-gavel',              color: '#dc2626' },
      ]
    },
    {
      groupId: 'outcome',
      groupLabel: 'Outcome',
      groupColor: '#10b981',
      groupIcon: 'fa-flag-checkered',
      stages: [
        { id: 'closed',  label: 'Closed / Settled', subLabel: 'Resolved',    form: '',  icon: 'fa-check-circle',  color: '#10b981' },
        { id: 'dropped', label: 'Dropped',           subLabel: 'Abandoned',   form: '',  icon: 'fa-times-circle',  color: '#64748b' },
      ]
    }
  ];

  // Flatten all stages for iteration
  const allStages = stageGroups.flatMap(g => g.stages.map(s => ({ ...s, groupColor: g.groupColor, groupId: g.groupId })));

  const cases = DB.getArr('cases');
  const totalDemand = cases.reduce((s,c) => s + (c.totalAmount||(c.demandAmount||0)+(c.penaltyAmount||0)+(c.interestAmount||0)), 0);
  const totalCollected = cases.reduce((s,c) => s + (c.amountCollected||0), 0);
  const activeCases = cases.filter(c => !['closed','dropped'].includes(c.status||'new-lead'));

  // Build card HTML for a case
  function buildCard(c, stageColor) {
    const total = c.totalAmount || (c.demandAmount||0)+(c.penaltyAmount||0)+(c.interestAmount||0)+(c.otherAmount||0);
    const collected = c.amountCollected || 0;
    const ratio = total > 0 ? Math.round((collected/total)*100) : 0;
    const days = c.dueDate ? daysFromNow(c.dueDate) : null;
    const dueBg = days !== null ? (days < 0 ? '#ef444422' : days <= 7 ? '#f59e0b22' : '#10b98122') : '';
    const dueCol = days !== null ? (days < 0 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#10b981') : '';
    const dueText = days !== null ? (days < 0 ? Math.abs(days)+'d OD!' : days === 0 ? 'TODAY' : days+'d left') : '';
    const hearingCount = (c.hearings||[]).length;
    const priorityDot = c.priority === 'critical'
      ? `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#ef4444;margin-right:4px;animation:pulse 1.2s infinite"></span>`
      : c.priority === 'high'
      ? `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#f59e0b;margin-right:4px"></span>`
      : '';
    const gstin = (c.gstin||'').slice(-6) ? `<span style="font-family:var(--font-mono);font-size:9px;color:var(--text-muted);background:var(--bg);padding:1px 5px;border-radius:4px;border:1px solid var(--border)">${(c.gstin||'').slice(0,2)}·····${(c.gstin||'').slice(-4)}</span>` : '';
    return `<div class="kanban-card kc-new" data-id="${c.id}" onclick="showCaseDetail('${c.id}')" oncontextmenu="openPipelineCloseCaseModal(event, '${c.id}'); return false;" title="Right-click to close or drop this case">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px">
        <div>
          <div style="font-size:9.5px;font-weight:800;color:var(--text-muted);letter-spacing:0.6px;text-transform:uppercase">${c.caseNo}</div>
          ${gstin}
        </div>
        <div style="display:flex;align-items:center;gap:4px">
          ${priorityDot}
          ${c.priority === 'critical' ? '<i class="fas fa-fire" style="font-size:11px;color:#ef4444"></i>' : ''}
        </div>
      </div>
      <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:3px;line-height:1.3">${c.taxpayerName}</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:7px">
        <span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;background:${stageColor}18;color:${stageColor};border:1px solid ${stageColor}33">Sec ${c.section||'—'}</span>
        <span style="font-size:9px;padding:2px 6px;border-radius:4px;background:var(--bg2);color:var(--text-muted);border:1px solid var(--border)">${c.period||'—'}</span>
        ${hearingCount > 0 ? `<span style="font-size:9px;padding:2px 6px;border-radius:4px;background:var(--blue-dim);color:var(--blue);border:1px solid var(--blue-soft)"><i class="fas fa-gavel" style="font-size:8px"></i> ${hearingCount} PH</span>` : ''}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:13px;font-weight:800;color:var(--blue)">₹${(total/100000).toFixed(1)}L</div>
        ${days !== null ? `<div style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;background:${dueBg};color:${dueCol};border:1px solid ${dueCol}44"><i class="fas fa-clock" style="font-size:8px"></i> ${dueText}</div>` : ''}
      </div>
      ${collected > 0 ? `
      <div style="margin-top:7px">
        <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-muted);margin-bottom:3px">
          <span>Collected</span><span style="color:var(--green);font-weight:700">${ratio}%</span>
        </div>
        <div style="height:3px;background:var(--bg);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${ratio}%;background:var(--green);border-radius:2px;transition:width 0.4s ease"></div>
        </div>
      </div>` : ''}
    </div>`;
  }

  // Build column HTML
  function buildColumn(stage) {
    const stageCases = cases.filter(c => (c.status || 'new-lead') === stage.id);
    const colDemand = stageCases.reduce((s,c) => s + (c.totalAmount||(c.demandAmount||0)+(c.penaltyAmount||0)+(c.interestAmount||0)+(c.otherAmount||0)), 0);
    const colCollected = stageCases.reduce((s,c) => s + (c.amountCollected||0), 0);
    const colRatio = colDemand > 0 ? Math.round((colCollected/colDemand)*100) : 0;
    return `
    <div class="kanban-col" data-stage="${stage.id}" style="min-width:210px;flex:0 0 210px">
      <div class="kanban-col-header" style="border-top:3px solid ${stage.color};padding:10px 12px 8px;flex-direction:column;align-items:stretch;gap:5px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="display:flex;align-items:center;gap:6px">
            <i class="fas ${stage.icon}" style="font-size:12px;color:${stage.color}"></i>
            <span style="font-size:11px;font-weight:800;color:${stage.color}">${stage.label}</span>
          </div>
          <span style="font-size:10px;font-weight:800;padding:2px 7px;border-radius:10px;background:${stage.color}22;color:${stage.color}">${stageCases.length}</span>
        </div>
        ${stage.form ? `<div style="font-size:9px;font-weight:700;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase">${stage.subLabel} &nbsp;·&nbsp; <span style="color:${stage.color};font-family:var(--font-mono)">${stage.form}</span></div>` : `<div style="font-size:9px;color:var(--text-muted)">${stage.subLabel}</div>`}
        <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-muted);margin-top:2px">
          <span>D: <b style="color:var(--text)">${colDemand > 0 ? '₹'+(colDemand/100000).toFixed(1)+'L' : '—'}</b></span>
          <span style="color:var(--green)">C: <b>${colCollected > 0 ? '₹'+(colCollected/100000).toFixed(1)+'L' : '—'}</b></span>
        </div>
        ${colDemand > 0 ? `<div style="height:2px;background:var(--bg);border-radius:2px;overflow:hidden"><div style="height:100%;width:${colRatio}%;background:var(--green);border-radius:2px"></div></div>` : ''}
      </div>
      <div class="kanban-cards" id="kanban-${stage.id}" data-stage="${stage.id}">
        ${stageCases.length === 0
          ? `<div style="padding:20px 12px;text-align:center"><i class="fas ${stage.icon}" style="font-size:20px;opacity:0.15;color:${stage.color};display:block;margin-bottom:8px"></i><div style="font-size:11px;color:var(--text-muted);opacity:0.7">No cases</div></div>`
          : stageCases.map(c => buildCard(c, stage.color)).join('')
        }
      </div>
    </div>`;
  }

  // Build group divider
  function buildGroupDivider(group) {
    return `<div class="kp-group-divider" style="flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:14px;gap:4px">
      <div style="width:2px;flex:1;background:linear-gradient(180deg,${group.groupColor}66,transparent);border-radius:2px;min-height:60px"></div>
      <div style="writing-mode:vertical-rl;text-orientation:mixed;font-size:9px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${group.groupColor};opacity:0.8;padding:6px 3px;background:${group.groupColor}12;border-radius:4px;white-space:nowrap">
        <i class="fas ${group.groupIcon}" style="writing-mode:horizontal-tb;font-size:9px;display:block;margin-bottom:4px;transform:rotate(0)"></i>${group.groupLabel}
      </div>
      <div style="width:2px;flex:1;background:linear-gradient(180deg,transparent,${group.groupColor}66);border-radius:2px;min-height:60px"></div>
    </div>`;
  }

  // Assemble board HTML
  let boardHtml = '';
  stageGroups.forEach((group, gi) => {
    if (gi > 0) boardHtml += buildGroupDivider(group);
    group.stages.forEach(stage => { boardHtml += buildColumn({ ...stage, groupColor: group.groupColor }); });
  });

  document.getElementById('app-content').innerHTML = `
  <div class="page-header">
    <div class="page-header-row">
      <div>
        <div class="page-title">Case Pipeline</div>
        <div class="page-subtitle">Drag cases between stages — <b>${activeCases.length}</b> active &nbsp;·&nbsp; Total exposure <b>₹${(totalDemand/10000000).toFixed(2)} Cr</b> &nbsp;·&nbsp; Collected <b style="color:var(--green)">₹${(totalCollected/100000).toFixed(1)}L</b></div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-outline btn-sm" onclick="App.refreshDataNow()"><i class="fas fa-sync-alt"></i> Sync Data</button>
        <button class="btn btn-primary" onclick="openAddCase()"><i class="fas fa-plus"></i> New Case</button>
      </div>
    </div>
  </div>
  <div id="kanban-board" style="display:flex;gap:10px;overflow-x:auto;padding-bottom:20px;min-height:72vh;align-items:flex-start">
    ${boardHtml}
  </div>
  <style>
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
    .kc-new { animation: cardIn 0.25s ease both; }
    @keyframes cardIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
  </style>`;

  setTimeout(() => {
    document.querySelectorAll('.kanban-cards').forEach(col => {
      if (window.Sortable) {
        Sortable.create(col, {
          group: 'kanban', animation: 150,
          ghostClass: 'kanban-ghost',
          chosenClass: 'kanban-chosen',
          dragClass: 'kanban-drag',
          onEnd(evt) {
            const caseId = evt.item.dataset.id;
            const newStage = evt.to.dataset.stage;
            const oldStage = evt.from.dataset.stage;
            if (newStage === oldStage) return;
            App.modules.pipeline();
            openStageUpdateModal(caseId, newStage);
          }
        });
      }
    });
  }, 300);
};

function openStageUpdateModal(caseId, stage) {
  const cases = DB.getArr('cases');
  const c = cases.find(x => x.id === caseId);
  if (!c) return;

  const stageConfigs = {
    'new-lead': { title: 'New Lead Info', fields: [{ id: 'fc-notes', label: 'Initial Remarks', type: 'textarea', key: 'notes' }] },
    'scn-received': { title: 'SCN Received — DRC-01', fields: [
      { id: 'fc-scndate', label: 'Date of SCN', type: 'date', key: 'scnDate' },
      { id: 'fc-scncomm', label: 'Communication Date', type: 'date', key: 'scnCommDate' },
      { id: 'fc-case', label: 'SCN Reference No.', type: 'text', key: 'caseNo' },
      { id: 'fc-din', label: 'DIN', type: 'text', key: 'din' }
    ]},
    'reply-filed': { title: 'Reply to SCN — DRC-06', fields: [
      { id: 'fc-online-date', label: 'Online Filing Date', type: 'date', key: 'onlineFilingDate' },
      { id: 'fc-physical-date', label: 'Physical Submission Date', type: 'date', key: 'physicalSubmitDate' },
      { id: 'fc-arn', label: 'ARN / Acknowledgment No.', type: 'text', key: 'arn' }
    ]},
    'ph-pending': { title: 'Personal Hearing — Sec 75(4)', fields: [
      { id: 'fc-ph-date', label: 'Hearing Date', type: 'date', key: 'phDate' },
      { id: 'fc-ph-notice', label: 'Notice / Order Ref', type: 'text', key: 'phNoticeRef' }
    ]},
    'oio-received': { title: 'Order-in-Original — DRC-07', fields: [
      { id: 'fc-oio-date', label: 'Date of OIO', type: 'date', key: 'oioDate' },
      { id: 'fc-oio-comm', label: 'Communication Date', type: 'date', key: 'oioCommDate' },
      { id: 'fc-case-oio', label: 'OIO Ref No.', type: 'text', key: 'caseNo' }
    ]},
    'appeal-filed': { title: 'Appeal against OIO — APL-01', fields: [
      { id: 'fc-oia-date', label: 'Appeal Filing Date', type: 'date', key: 'oiaDate' },
      { id: 'fc-apl01-ref', label: 'Appeal ARN / APL-01 Ref', type: 'text', key: 'apl01Ref' },
      { id: 'fc-apl01-predep', label: 'Pre-Deposit Amount (10%)', type: 'number', key: 'preDeposit' }
    ]},
    'appeal-ph': { title: 'Personal Hearing — First Appeal (Sec 107)', fields: [
      { id: 'fc-aph-date', label: 'Hearing Date', type: 'date', key: 'appealPhDate' },
      { id: 'fc-aph-ref', label: 'Notice / Order Ref', type: 'text', key: 'appealPhRef' }
    ]},
    'oia-received': { title: 'Order-in-Appeal (OIA)', fields: [
      { id: 'fc-oia-order-date', label: 'Date of OIA', type: 'date', key: 'oiaCommDate' },
      { id: 'fc-oia-comm-date', label: 'Communication Date', type: 'date', key: 'oiaOrderCommDate' },
      { id: 'fc-oia-ref', label: 'OIA Ref No.', type: 'text', key: 'oiaRef' }
    ]},
    'gstat-appeal-filed': { title: 'GSTAT Appeal — APL-05', fields: [
      { id: 'fc-gstat-date', label: 'GSTAT Appeal Date', type: 'date', key: 'gstatAppealDate' },
      { id: 'fc-gstat-arn', label: 'ARN / APL-05 Ref No.', type: 'text', key: 'gstatArn' },
      { id: 'fc-gstat-predep', label: 'Pre-Deposit Amount (20%)', type: 'number', key: 'gstatPreDeposit' }
    ]},
    'gstat-ph': { title: 'Personal Hearing — GSTAT (Sec 112)', fields: [
      { id: 'fc-gph-date', label: 'Hearing Date', type: 'date', key: 'gstatPhDate' },
      { id: 'fc-gph-ref', label: 'Notice / Order Ref', type: 'text', key: 'gstatPhRef' }
    ]},
    'tribunal-order': { title: 'Order of Tribunal', fields: [
      { id: 'fc-tribunal-date', label: 'Tribunal Order Date', type: 'date', key: 'gstatOrderDate' },
      { id: 'fc-tribunal-comm', label: 'Communication Date', type: 'date', key: 'gstatOrderCommDate' },
      { id: 'fc-tribunal-ref', label: 'Tribunal Order Ref', type: 'text', key: 'gstatOrderRef' }
    ]},
    'hc-petition-filed': { title: 'Appeal to High Court — Sec 117', fields: [
      { id: 'fc-hc-date', label: 'HC Petition Date', type: 'date', key: 'hcPetitionDate' },
      { id: 'fc-hc-ref', label: 'Writ / Petition Ref No.', type: 'text', key: 'hcRef' }
    ]},
    'sc-petition-filed': { title: 'Appeal to Supreme Court — Sec 118', fields: [
      { id: 'fc-sc-date', label: 'SC / SLP Petition Date', type: 'date', key: 'scPetitionDate' },
      { id: 'fc-sc-ref', label: 'SLP / Petition Ref No.', type: 'text', key: 'scRef' }
    ]},
    'closed': { title: 'Closing Summary', fields: [
      { id: 'fc-closure-date', label: 'Closure Date', type: 'date', key: 'closureDate' },
      { id: 'fc-closure-outcome', label: 'Outcome Summary', type: 'text', key: 'closureOutcome' },
      { id: 'fc-closure-authority', label: 'Final Authority / Order Ref', type: 'text', key: 'closureAuthority' },
      { id: 'fc-notes-close', label: 'Closing Remarks / Outcome', type: 'textarea', key: 'closureReason' }
    ]},
    'dropped': { title: 'Mark as Dropped', fields: [
      { id: 'fc-drop-date', label: 'Closure Date', type: 'date', key: 'closureDate' },
      { id: 'fc-drop-outcome', label: 'Dropped Outcome Summary', type: 'text', key: 'closureOutcome' },
      { id: 'fc-drop-authority', label: 'Final Authority / Order Ref', type: 'text', key: 'closureAuthority' },
      { id: 'fc-notes-drop', label: 'Reason for Dropping', type: 'textarea', key: 'closureReason' }
    ]}
  };

  const config = stageConfigs[stage] || { title: 'Update Status', fields: [] };
  
  const formHtml = `
    <div style="padding:10px 0">
      <div style="background:var(--blue-dim);padding:12px;border-radius:8px;margin-bottom:20px;border:1px solid var(--blue-soft)">
        <div style="font-size:11px;color:var(--blue);font-weight:700;text-transform:uppercase;margin-bottom:4px">Target Stage</div>
        <div style="font-size:16px;font-weight:700;color:var(--text)">${stage.replace(/-/g,' ').toUpperCase()}</div>
      </div>
      <div class="form-grid">
        ${config.fields.map(f => `
          <div class="form-group" style="${f.type==='textarea'?'grid-column:1/-1':''}">
            <label class="form-label">${f.label}</label>
            ${f.type==='textarea' 
              ? `<textarea id="${f.id}" class="form-input" rows="3" placeholder="Enter ${f.label.toLowerCase()}...">${c[f.key] || ''}</textarea>`
              : `<input id="${f.id}" class="form-input" type="${f.type}" value="${c[f.key] || ''}" placeholder="Enter ${f.label.toLowerCase()}...">`
            }
          </div>
        `).join('')}
      </div>
    </div>
  `;

  Modal.open(config.title, formHtml, `
    <button class="btn btn-outline" onclick="Modal.close(); App.modules.pipeline()">Cancel</button>
    <button class="btn btn-primary" onclick="saveStageUpdate('${caseId}', '${stage}')"><i class="fas fa-check mr-1"></i> Update Status</button>
  `);
}

window.openPipelineCloseCaseModal = function(event, caseId) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const c = DB.getArr('cases').find(x => x.id === caseId);
  if (!c) return;

  Modal.open(`Close Case: ${c.caseNo}`, `
    <div style="padding:10px 0">
      <div style="background:var(--green-dim);padding:12px;border-radius:10px;margin-bottom:18px;border:1px solid var(--green-soft)">
        <div style="font-size:11px;color:var(--green);font-weight:700;text-transform:uppercase;margin-bottom:4px">Pipeline Quick Action</div>
        <div style="font-size:15px;font-weight:700;color:var(--text)">${c.taxpayerName}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px">Capture final closure details before moving this case out of the active pipeline.</div>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Final Status <span class="req">*</span></label>
          <select id="pc-close-status" class="form-select">
            <option value="closed" ${c.status === 'closed' ? 'selected' : ''}>Closed / Settled</option>
            <option value="dropped" ${c.status === 'dropped' ? 'selected' : ''}>Dropped</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Closure Date <span class="req">*</span></label>
          <input id="pc-close-date" class="form-input" type="date" value="${c.closureDate || new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group" style="grid-column:1/-1">
          <label class="form-label">Outcome Summary <span class="req">*</span></label>
          <input id="pc-close-outcome" class="form-input" value="${c.closureOutcome || ''}" placeholder="e.g. OIA accepted and demand set aside / settled after payment / appeal not pursued">
        </div>
        <div class="form-group">
          <label class="form-label">Final Authority / Order Ref</label>
          <input id="pc-close-authority" class="form-input" value="${c.closureAuthority || c.authority || ''}" placeholder="Authority, order no., tribunal bench, settlement ref">
        </div>
        <div class="form-group">
          <label class="form-label">Amount Collected / Paid</label>
          <input id="pc-close-collected" class="form-input" type="number" value="${c.amountCollected || 0}" placeholder="0">
        </div>
        <div class="form-group" style="grid-column:1/-1">
          <label class="form-label">Closure Notes / Reason <span class="req">*</span></label>
          <textarea id="pc-close-reason" class="form-textarea" rows="4" placeholder="Record why the case is being closed or dropped, and what happened at the final stage.">${c.closureReason || c.notes || ''}</textarea>
        </div>
      </div>
    </div>
  `, `
    <button class="btn btn-outline" onclick="Modal.close(); App.modules.pipeline()">Cancel</button>
    <button class="btn btn-primary" onclick="savePipelineClosure('${caseId}')"><i class="fas fa-check-circle mr-1"></i> Save & Close Case</button>
  `);
}

window.savePipelineClosure = function(caseId) {
  const finalStatus = document.getElementById('pc-close-status').value;
  const closureDate = document.getElementById('pc-close-date').value;
  const closureOutcome = document.getElementById('pc-close-outcome').value.trim();
  const closureAuthority = document.getElementById('pc-close-authority').value.trim();
  const closureReason = document.getElementById('pc-close-reason').value.trim();
  const amountCollected = Number(document.getElementById('pc-close-collected').value) || 0;

  if (!closureDate || !closureOutcome || !closureReason) {
    toast('Closure date, outcome summary, and closure notes are required', 'error');
    return;
  }

  const updatedCase = _updateCase(caseId, c => {
    c.status = finalStatus;
    c.closureDate = closureDate;
    c.closureOutcome = closureOutcome;
    c.closureAuthority = closureAuthority;
    c.closureReason = closureReason;
    c.amountCollected = amountCollected;
  });
  if (!updatedCase) return;

  Modal.close();
  App.modules.pipeline();
  toast(`Case marked as ${finalStatus === 'closed' ? 'closed' : 'dropped'} with final details`, 'success');
}

window.saveStageUpdate = function(caseId, stage) {
  const stageConfigs = {
    'new-lead': [{ id: 'fc-notes', key: 'notes' }],
    'scn-received': [{ id: 'fc-scndate', key: 'scnDate' }, { id: 'fc-scncomm', key: 'scnCommDate' }, { id: 'fc-case', key: 'caseNo' }, { id: 'fc-din', key: 'din' }],
    'reply-filed': [{ id: 'fc-online-date', key: 'onlineFilingDate' }, { id: 'fc-physical-date', key: 'physicalSubmitDate' }, { id: 'fc-arn', key: 'arn' }],
    'ph-pending': [{ id: 'fc-ph-date', key: 'phDate' }, { id: 'fc-ph-notice', key: 'phNoticeRef' }],
    'oio-received': [{ id: 'fc-oio-date', key: 'oioDate' }, { id: 'fc-oio-comm', key: 'oioCommDate' }, { id: 'fc-case-oio', key: 'caseNo' }],
    'appeal-filed': [{ id: 'fc-oia-date', key: 'oiaDate' }, { id: 'fc-apl01-ref', key: 'apl01Ref' }, { id: 'fc-apl01-predep', key: 'preDeposit' }],
    'appeal-ph': [{ id: 'fc-aph-date', key: 'appealPhDate' }, { id: 'fc-aph-ref', key: 'appealPhRef' }],
    'oia-received': [{ id: 'fc-oia-order-date', key: 'oiaCommDate' }, { id: 'fc-oia-comm-date', key: 'oiaOrderCommDate' }, { id: 'fc-oia-ref', key: 'oiaRef' }],
    'gstat-appeal-filed': [{ id: 'fc-gstat-date', key: 'gstatAppealDate' }, { id: 'fc-gstat-arn', key: 'gstatArn' }, { id: 'fc-gstat-predep', key: 'gstatPreDeposit' }],
    'gstat-ph': [{ id: 'fc-gph-date', key: 'gstatPhDate' }, { id: 'fc-gph-ref', key: 'gstatPhRef' }],
    'tribunal-order': [{ id: 'fc-tribunal-date', key: 'gstatOrderDate' }, { id: 'fc-tribunal-comm', key: 'gstatOrderCommDate' }, { id: 'fc-tribunal-ref', key: 'gstatOrderRef' }],
    'hc-petition-filed': [{ id: 'fc-hc-date', key: 'hcPetitionDate' }, { id: 'fc-hc-ref', key: 'hcRef' }],
    'sc-petition-filed': [{ id: 'fc-sc-date', key: 'scPetitionDate' }, { id: 'fc-sc-ref', key: 'scRef' }],
    'closed': [{ id: 'fc-closure-date', key: 'closureDate' }, { id: 'fc-closure-outcome', key: 'closureOutcome' }, { id: 'fc-closure-authority', key: 'closureAuthority' }, { id: 'fc-notes-close', key: 'closureReason' }],
    'dropped': [{ id: 'fc-drop-date', key: 'closureDate' }, { id: 'fc-drop-outcome', key: 'closureOutcome' }, { id: 'fc-drop-authority', key: 'closureAuthority' }, { id: 'fc-notes-drop', key: 'closureReason' }]
  };

  const fields = stageConfigs[stage] || [];
  const stageValues = {};
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    stageValues[f.key] = el ? el.value.trim() : '';
  });

  if (stage === 'closed' || stage === 'dropped') {
    const closureData = {
      closureDate: stageValues.closureDate,
      closureOutcome: stageValues.closureOutcome,
      closureReason: stageValues.closureReason
    };
    if (typeof validateClosureForStatus === 'function' && !validateClosureForStatus(stage, closureData)) {
      return;
    } else if (!stageValues.closureDate || !stageValues.closureOutcome || !stageValues.closureReason) {
      toast('Closure date, outcome summary, and closure notes are required', 'error');
      return;
    }
  }

  const updatedCase = _updateCase(caseId, c => {
    fields.forEach(f => {
      c[f.key] = stageValues[f.key];
    });

    c.status = stage;
    c.updatedAt = new Date().toISOString();
    normalizeCaseRecord(c);
  });
  if (!updatedCase) return;
  Modal.close();
  App.modules.pipeline();
  toast(`Case updated to ${stage.replace(/-/g,' ')}`, 'success');
};

window.autoFillFromGSTIN = function(gstin, panId = 'cl-pan', stateId = 'cl-state') {
  if (!gstin) return;
  gstin = gstin.toUpperCase();
  if (gstin.length >= 12) {
    const pan = gstin.substring(2, 12);
    const panEl = document.getElementById(panId);
    if (panEl) panEl.value = pan;
  }
  if (gstin.length >= 2) {
    const stateCode = gstin.substring(0, 2);
    const stateMap = {
      '01':'Jammu & Kashmir', '02':'Himachal Pradesh', '03':'Punjab', '04':'Chandigarh',
      '05':'Uttarakhand', '06':'Haryana', '07':'Delhi', '08':'Rajasthan',
      '09':'Uttar Pradesh', '10':'Bihar', '11':'Sikkim', '12':'Arunachal Pradesh',
      '13':'Nagaland', '14':'Manipur', '15':'Mizoram', '16':'Tripura', '17':'Meghalaya',
      '18':'Assam', '19':'West Bengal', '20':'Jharkhand', '21':'Odisha',
      '22':'Chhattisgarh', '23':'Madhya Pradesh', '24':'Gujarat', '25':'Daman & Diu',
      '26':'Dadra & Nagar Haveli', '27':'Maharashtra', '29':'Karnataka', '30':'Goa',
      '31':'Lakshadweep', '32':'Kerala', '33':'Tamil Nadu', '34':'Puducherry',
      '35':'Andaman & Nicobar Islands', '36':'Telangana', '37':'Andhra Pradesh', '38':'Ladakh'
    };
    if (stateMap[stateCode]) {
      const stateEl = document.getElementById(stateId);
      if (stateEl) stateEl.value = stateMap[stateCode];
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// MODULE 2: CLIENT MASTER
// ═══════════════════════════════════════════════════════════════
App.modules.clients = function() {
  function renderClients(search='') {
    let clients = DB.getArr('clients');
    if (search) clients = clients.filter(cl =>
      (cl.legalName||cl.name||'').toLowerCase().includes(search) ||
      (cl.tradeName||'').toLowerCase().includes(search) ||
      (cl.gstin||'').toLowerCase().includes(search) ||
      (cl.gstLoginId||'').toLowerCase().includes(search) ||
      (cl.pan||'').toLowerCase().includes(search));
    const cases = DB.getArr('cases');
    const el = document.getElementById('client-list');
    if (!el) return;
    if (!clients.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="fas fa-users"></i></div>
        <div class="empty-title">No clients yet</div>
        <div class="empty-desc">Add your first client to build a master database.</div>
        <button class="btn btn-primary mt-3" onclick="openAddClient()"><i class="fas fa-plus"></i> Add Client</button></div>`;
      return;
    }
    el.innerHTML = clients.map(cl => {
      const linked = cases.filter(c => c.clientId === cl.id || c.gstin === cl.gstin);
      const demand = linked.reduce((s,c)=>s+(c.totalAmount||(c.demandAmount||0)+(c.penaltyAmount||0)+(c.interestAmount||0)),0);
      return `<div class="card mb-3" style="cursor:pointer" onclick="openClientDetail('${cl.id}')">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:44px;height:44px;border-radius:12px;background:var(--blue-dim);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:var(--blue);flex-shrink:0">${(cl.name||'?')[0].toUpperCase()}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:15px">${cl.tradeName || cl.name}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:2px">${cl.legalName || ''}</div>
            <div style="font-size:12px;color:var(--text-muted)">
              <span class="badge badge-gray" style="font-size:9px;padding:1px 4px;margin-right:4px">${cl.groupName || 'No Group'}</span>
              ${cl.state ? `<span class="badge" style="background:#3b82f622;color:var(--blue);font-size:9px;padding:1px 4px;margin-right:4px">${cl.state}</span>` : ''}
              ${cl.gstin||'—'} &nbsp;|&nbsp; ${cl.constitution||'—'}
              ${cl.reference ? `&nbsp;|&nbsp; <span style="color:var(--blue)">${cl.reference}</span>` : ''}
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:12px;color:var(--text-muted)">${linked.length} case${linked.length!==1?'s':''}</div>
            ${demand?`<div style="font-size:13px;font-weight:700;color:var(--orange)">${fmtINR(demand)}</div>`:``}
          </div>
          <div style="display:flex; gap:4px">
            <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openEditClient('${cl.id}')" title="Edit Client"><i class="fas fa-edit"></i></button>
            <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();deleteClient('${cl.id}')" title="Delete Client"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  document.getElementById('app-content').innerHTML = `
  <div class="page-header">
    <div class="page-header-row">
      <div><div class="page-title">Client Master</div>
      <div class="page-subtitle">Centralized client & taxpayer database</div></div>
      <button class="btn btn-primary" onclick="openAddClient()"><i class="fas fa-plus"></i> Add Client</button>
    </div>
  </div>
  <div class="card mb-4">
    <input type="text" class="form-input" id="client-search" placeholder="Search by name, GSTIN, PAN…" oninput="renderClients(this.value.toLowerCase())" style="max-width:340px">
  </div>
  <div id="client-list"></div>`;

  window.renderClients = renderClients;
  renderClients();

  window.openAddClient = function() {
    Modal.open('Add Client', `
      <div class="form-grid">
        <div style="grid-column:1/-1;font-weight:700;font-size:13px;color:var(--gold);padding:6px 0 2px;border-bottom:1px solid var(--border);margin-bottom:4px"><i class="fas fa-building" style="margin-right:6px"></i>ENTITY INFORMATION</div>
        <div class="form-group"><label class="form-label">Legal Name *</label><input class="form-input" id="cl-legal-name" placeholder="As per PAN / Incorporation"></div>
        <div class="form-group"><label class="form-label">Trade Name / Brand</label><input class="form-input" id="cl-trade-name" placeholder="e.g. M/s ABC Traders"></div>
        <div class="form-group"><label class="form-label">Group Name</label><input class="form-input" id="cl-group" placeholder="e.g. Reliance Group"></div>
        <div class="form-group"><label class="form-label">Constitution</label>
          <select class="form-input" id="cl-constitution">
            <option>Proprietorship</option><option>Partnership</option><option>LLP</option>
            <option>Private Limited</option><option>Public Limited</option><option>Trust / NGO</option><option>Government</option>
          </select></div>
        <div class="form-group"><label class="form-label">Internal Reference</label><input class="form-input" id="cl-ref" placeholder="e.g. REF/2024/001"></div>

        <div style="grid-column:1/-1;font-weight:700;font-size:13px;color:var(--blue);padding:10px 0 2px;border-bottom:1px solid var(--border);margin-bottom:4px"><i class="fas fa-id-card" style="margin-right:6px"></i>GST REGISTRATION & PORTAL</div>
        <div class="form-group"><label class="form-label">GSTIN</label><input class="form-input" id="cl-gstin" placeholder="22AAAAA0000A1Z5" maxlength="15" style="font-family:monospace;text-transform:uppercase" oninput="window.autoFillFromGSTIN(this.value)"></div>
        <div class="form-group"><label class="form-label">PAN</label><input class="form-input" id="cl-pan" placeholder="AAAAA0000A" maxlength="10" style="font-family:monospace;text-transform:uppercase"></div>
        <div class="form-group"><label class="form-label">State</label><input class="form-input" id="cl-state" placeholder="Auto-filled from GSTIN"></div>
        <div class="form-group"><label class="form-label">GST Login ID</label><input class="form-input" id="cl-gstlogin" placeholder="Portal Username"></div>
        <div class="form-group"><label class="form-label">Login Password</label><input class="form-input" id="cl-pass" type="password" placeholder="Portal Password"></div>

        <div style="grid-column:1/-1;font-weight:700;font-size:13px;color:var(--green);padding:10px 0 2px;border-bottom:1px solid var(--border);margin-bottom:4px"><i class="fas fa-address-book" style="margin-right:6px"></i>CONTACT DETAILS</div>
        <div class="form-group"><label class="form-label">Contact Person</label><input class="form-input" id="cl-contact" placeholder="Name of key contact"></div>
        <div class="form-group"><label class="form-label">Mobile</label><input class="form-input" id="cl-mobile" placeholder="9876543210"></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="cl-email" type="email" placeholder="client@example.com"></div>
        <div class="form-group" style="grid-column:1/-1"><label class="form-label">Address</label><textarea class="form-input" id="cl-address" rows="2" placeholder="Registered / Principal Place of Business"></textarea></div>
      </div>`,
      `<button class="btn btn-primary" onclick="saveClient()"><i class="fas fa-save"></i> Save Client</button>`);
  };

  window.saveClient = function() {
    const legalName = document.getElementById('cl-legal-name').value.trim();
    const tradeName = document.getElementById('cl-trade-name').value.trim();
    if (!legalName) { toast('Legal Name is required','error'); return; }

    const gstin = document.getElementById('cl-gstin').value.trim().toUpperCase();
    const pan = document.getElementById('cl-pan').value.trim().toUpperCase();
    
    if (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin)) {
      toast('Invalid GSTIN format', 'error'); return;
    }
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      toast('Invalid PAN format', 'error'); return;
    }

    const cl = { id:uid(), name: legalName, legalName, tradeName,
      groupName:document.getElementById('cl-group').value.trim(),
      constitution:document.getElementById('cl-constitution').value,
      reference:document.getElementById('cl-ref').value.trim(),
      gstin:gstin,
      pan:pan,
      state:document.getElementById('cl-state').value.trim(),
      gstLoginId:document.getElementById('cl-gstlogin').value.trim(),
      portalPassword:document.getElementById('cl-pass').value.trim(),
      contactName:document.getElementById('cl-contact').value.trim(),
      mobile:document.getElementById('cl-mobile').value.trim(),
      email:document.getElementById('cl-email').value.trim(),
      address:document.getElementById('cl-address').value.trim(),
      createdAt:new Date().toISOString() };
    const clients = DB.getArr('clients'); clients.unshift(cl); DB.set('clients',clients);
    Modal.close(); renderClients(); toast('Client added','success');
  };

  window.deleteClient = function(id) {
    if (!confirm('Delete this client?')) return;
    DB.set('clients', DB.getArr('clients').filter(c=>c.id!==id));
    renderClients(); toast('Deleted','info');
  };
  
  window.openEditClient = function(id) {
    const cl = DB.getArr('clients').find(c=>c.id===id);
    if (!cl) return;
    Modal.open('Edit Client: ' + (cl.tradeName || cl.legalName || cl.name), `
      <div class="form-grid">
        <div style="grid-column:1/-1;font-weight:700;font-size:13px;color:var(--gold);padding:6px 0 2px;border-bottom:1px solid var(--border);margin-bottom:4px"><i class="fas fa-building" style="margin-right:6px"></i>ENTITY INFORMATION</div>
        <div class="form-group"><label class="form-label">Legal Name *</label><input class="form-input" id="cl-legal-name" value="${cl.legalName||cl.name||''}"></div>
        <div class="form-group"><label class="form-label">Trade Name / Brand</label><input class="form-input" id="cl-trade-name" value="${cl.tradeName||''}"></div>
        <div class="form-group"><label class="form-label">Group Name</label><input class="form-input" id="cl-group" value="${cl.groupName||''}"></div>
        <div class="form-group"><label class="form-label">Constitution</label>
          <select class="form-input" id="cl-constitution">
            ${['Proprietorship','Partnership','LLP','Private Limited','Public Limited','Trust / NGO','Government'].map(o => `<option ${cl.constitution===o?'selected':''}>${o}</option>`).join('')}
          </select></div>
        <div class="form-group"><label class="form-label">Internal Reference</label><input class="form-input" id="cl-ref" value="${cl.reference||''}"></div>

        <div style="grid-column:1/-1;font-weight:700;font-size:13px;color:var(--blue);padding:10px 0 2px;border-bottom:1px solid var(--border);margin-bottom:4px"><i class="fas fa-id-card" style="margin-right:6px"></i>GST REGISTRATION & PORTAL</div>
        <div class="form-group"><label class="form-label">GSTIN</label><input class="form-input" id="cl-gstin" value="${cl.gstin||''}" maxlength="15" style="font-family:monospace;text-transform:uppercase" oninput="window.autoFillFromGSTIN(this.value)"></div>
        <div class="form-group"><label class="form-label">PAN</label><input class="form-input" id="cl-pan" value="${cl.pan||''}" maxlength="10" style="font-family:monospace;text-transform:uppercase"></div>
        <div class="form-group"><label class="form-label">State</label><input class="form-input" id="cl-state" value="${cl.state||''}"></div>
        <div class="form-group"><label class="form-label">GST Login ID</label><input class="form-input" id="cl-gstlogin" value="${cl.gstLoginId||''}"></div>
        <div class="form-group"><label class="form-label">Login Password</label><input class="form-input" id="cl-pass" type="text" value="${cl.portalPassword||''}"></div>

        <div style="grid-column:1/-1;font-weight:700;font-size:13px;color:var(--green);padding:10px 0 2px;border-bottom:1px solid var(--border);margin-bottom:4px"><i class="fas fa-address-book" style="margin-right:6px"></i>CONTACT DETAILS</div>
        <div class="form-group"><label class="form-label">Contact Person</label><input class="form-input" id="cl-contact" value="${cl.contactName||''}"></div>
        <div class="form-group"><label class="form-label">Mobile</label><input class="form-input" id="cl-mobile" value="${cl.mobile||''}"></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="cl-email" type="email" value="${cl.email||''}"></div>
        <div class="form-group" style="grid-column:1/-1"><label class="form-label">Address</label><textarea class="form-input" id="cl-address" rows="2">${cl.address||''}</textarea></div>
      </div>`,
      `<button class="btn btn-primary" onclick="updateClient('${id}')"><i class="fas fa-save"></i> Update Client</button>`);
  };

  window.updateClient = function(id) {
    const clients = DB.getArr('clients');
    const idx = clients.findIndex(c => c.id === id);
    if (idx === -1) return;
    const legalName = document.getElementById('cl-legal-name').value.trim();
    const tradeName = document.getElementById('cl-trade-name').value.trim();
    if (!legalName) { toast('Legal Name is required','error'); return; }

    const gstin = document.getElementById('cl-gstin').value.trim().toUpperCase();
    const pan = document.getElementById('cl-pan').value.trim().toUpperCase();
    
    if (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin)) {
      toast('Invalid GSTIN format', 'error'); return;
    }
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      toast('Invalid PAN format', 'error'); return;
    }

    clients[idx] = { ...clients[idx],
      name: legalName, legalName, tradeName,
      groupName: document.getElementById('cl-group').value.trim(),
      constitution: document.getElementById('cl-constitution').value,
      reference: document.getElementById('cl-ref').value.trim(),
      gstin: gstin,
      pan: pan,
      state: document.getElementById('cl-state').value.trim(),
      gstLoginId: document.getElementById('cl-gstlogin').value.trim(),
      portalPassword: document.getElementById('cl-pass').value.trim(),
      contactName: document.getElementById('cl-contact').value.trim(),
      mobile: document.getElementById('cl-mobile').value.trim(),
      email: document.getElementById('cl-email').value.trim(),
      address: document.getElementById('cl-address').value.trim(),
      updatedAt: new Date().toISOString()
    };
    DB.set('clients', clients);
    Modal.close(); renderClients(); toast('Client updated','success');
  };

  window.openClientDetail = function(id) {
    const cl = DB.getArr('clients').find(c=>c.id===id);
    if (!cl) return;
    const linked = DB.getArr('cases').filter(c => c.clientId === id);
    Modal.open(`Client Profile: ${cl.legalName || cl.name}`, `
      <div style="font-weight:700;font-size:12px;color:var(--blue);padding-bottom:6px;border-bottom:1px solid var(--border);margin-bottom:10px;letter-spacing:0.5px"><i class="fas fa-building" style="margin-right:6px"></i>COMPANY DETAILS</div>
      <div class="cf-detail-grid">
        <div class="cf-detail-item"><span class="cf-detail-label">Legal Name</span><span class="cf-detail-value font-bold">${cl.legalName||cl.name||'—'}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">Trade Name</span><span class="cf-detail-value">${cl.tradeName||'—'}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">Group/Type</span><span class="cf-detail-value">${cl.groupName||'—'}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">Reference</span><span class="cf-detail-value">${cl.reference||'—'}</span></div>
      </div>
      <div style="font-weight:700;font-size:12px;color:var(--orange);padding:14px 0 6px;border-bottom:1px solid var(--border);margin-bottom:10px;letter-spacing:0.5px"><i class="fas fa-id-card" style="margin-right:6px"></i>TAX IDENTIFICATION</div>
      <div class="cf-detail-grid">
        <div class="cf-detail-item"><span class="cf-detail-label">GSTIN</span><span class="cf-detail-value font-mono">${cl.gstin||'—'}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">State</span><span class="cf-detail-value">${cl.state||'—'}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">PAN</span><span class="cf-detail-value font-mono">${cl.pan||'—'}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">GST Login ID</span><span class="cf-detail-value font-mono">${cl.gstLoginId||'—'}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">Portal Password</span><span class="cf-detail-value font-mono">${cl.portalPassword||'••••••••'}</span></div>
      </div>

      <div style="font-weight:700;font-size:12px;color:var(--green);padding:14px 0 6px;border-bottom:1px solid var(--border);margin-bottom:10px;letter-spacing:0.5px"><i class="fas fa-address-book" style="margin-right:6px"></i>CONTACT DETAILS</div>
      <div class="cf-detail-grid">
        <div class="cf-detail-item"><span class="cf-detail-label">Contact Person</span><span class="cf-detail-value">${cl.contactName||'—'}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">Mobile</span><span class="cf-detail-value">${cl.mobile||'—'}</span></div>
        <div class="cf-detail-item"><span class="cf-detail-label">Email</span><span class="cf-detail-value">${cl.email||'—'}</span></div>
        <div class="cf-detail-item" style="grid-column:1/-1"><span class="cf-detail-label">Address</span><span class="cf-detail-value">${cl.address||'—'}</span></div>
      </div>

      <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:8px">
        <button class="btn btn-primary btn-sm" onclick="Modal.close(); App.navigate('cases'); setTimeout(() => openAddCaseWithClient('${cl.id}'), 200)"><i class="fas fa-plus-circle mr-1"></i> New Case</button>
        <button class="btn btn-outline btn-sm" onclick="openEditClient('${cl.id}')"><i class="fas fa-edit mr-1"></i> Edit Profile</button>
      </div>
      <div style="margin-top:20px">
        <div class="section-title">Linked Cases (${linked.length})</div>
        <div style="max-height:300px;overflow-y:auto">
          ${linked.map(c => `<div class="cf-cl-row" onclick="Modal.close(); showCaseDetail('${c.id}')" style="cursor:pointer">
            <div class="cf-cl-code" style="color:var(--blue);font-weight:700">${c.caseNo}</div>
            <div class="cf-cl-name">${c.period||'No Period'} &middot; Sec ${c.section||'—'} &middot; <span style="font-size:10px;color:var(--text-muted)">${c.assignmentTypeLabel || 'SCN'}</span></div>
            <div class="cf-cl-level"><span class="badge badge-${c.status==='closed'?'green':'blue'}">${c.status.replace(/-/g,' ')}</span></div>
          </div>`).join('')}
        </div>
      </div>
    `);
  };
};

// ═══════════════════════════════════════════════════════════════
// MODULE 3: HEARING TRACKER
// ═══════════════════════════════════════════════════════════════
App.modules.hearings = function() {
  const cases = DB.getArr('cases');
  const today = new Date().toISOString().split('T')[0];
  const next7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const stageSections = [
    { id: 'adjudication', label: 'Adjudication Stage', icon: 'fa-balance-scale-left', color: '#f59e0b' },
    { id: 'first-appeal', label: 'First Appeal Stage', icon: 'fa-arrow-up', color: '#8b5cf6' },
    { id: 'second-appeal', label: 'Second Appeal Stage', icon: 'fa-layer-group', color: '#6366f1' },
    { id: 'judicial', label: 'Judicial Review', icon: 'fa-university', color: '#ec4899' },
    { id: 'outcome', label: 'Closed / Outcome', icon: 'fa-flag-checkered', color: '#10b981' }
  ];

  function getHearingStageBundle(caseObj, hearingObj) {
    const fallbackMeta = getCaseStageMeta(caseObj.status || 'new-lead');
    const stageGroupId = hearingObj.stageGroupId || fallbackMeta.groupId;
    const stageStatus = hearingObj.stageStatus || caseObj.status || 'new-lead';
    const stageMeta = getCaseStageMeta(stageStatus);
    const stageSection = stageSections.find(s => s.id === stageGroupId) || stageSections[0];
    return { stageGroupId, stageStatus, stageMeta, stageSection };
  }

  const allHearings = cases.flatMap(c => (c.hearings || []).map(h => {
    const stageBundle = getHearingStageBundle(c, h);
    return {
      ...h,
      caseNo: c.caseNo,
      taxpayerName: c.taxpayerName,
      caseId: c.id,
      caseStatus: c.status || 'new-lead',
      stageGroupId: stageBundle.stageGroupId,
      stageStatus: stageBundle.stageStatus,
      stageMeta: stageBundle.stageMeta,
      stageSection: stageBundle.stageSection
    };
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  function hearingMatchesWindow(h, filter) {
    if (filter === 'today') return h.date === today;
    if (filter === 'upcoming') return h.date >= today && h.date <= next7Days;
    if (filter === 'completed') return (h.status || '') === 'Completed';
    return true;
  }

  function buildStageSection(section, hearings) {
    const sorted = hearings.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    return `
      <section class="hearing-stage-shell" style="--hearing-stage-color:${section.color}">
        <div class="hearing-stage-head">
          <div class="hearing-stage-title">
            <i class="fas ${section.icon}"></i>
            <span>${section.label}</span>
          </div>
          <div class="hearing-stage-meta">
            <span class="badge badge-gray">${sorted.length} hearing${sorted.length > 1 ? 's' : ''}</span>
            <span class="hearing-stage-next">${sorted[0] ? 'Next: ' + fmtDateShort(sorted[0].date) : 'No upcoming date'}</span>
          </div>
        </div>
        <div class="hearing-stage-grid">
          ${sorted.map(h => {
            const isToday = h.date === today;
            const isCompleted = h.status === 'Completed';
            const statusBadge = isCompleted ? 'green' : isToday ? 'orange' : h.date < today ? 'red' : 'blue';
            return `
            <div class="hearing-card ${isToday ? 'active' : ''}" style="--hearing-card-color:${h.stageSection.color};border-left-color:${isCompleted ? 'var(--green)' : h.stageSection.color}">
              <div class="hearing-card-top">
                <div>
                  <div class="hearing-card-date">${fmtDateShort(h.date)} &bull; ${h.time || 'No Time'}</div>
                  <div class="hearing-card-case">${h.caseNo}</div>
                </div>
                <span class="badge badge-${statusBadge}" style="font-size:10px">${h.status || 'Scheduled'}</span>
              </div>
              <div class="hearing-card-party">${h.taxpayerName}</div>
              <div class="hearing-card-stage-row">
                <span class="badge badge-${getCaseStageBadgeColor(h.stageStatus)}">${h.stageMeta.label}</span>
                <span class="badge badge-gray">${h.type || 'Personal Hearing'}</span>
              </div>
              <div class="hearing-card-authority"><i class="fas fa-map-marker-alt"></i>${h.authority || 'No authority specified'}</div>
              <div class="hearing-card-actions">
                <button class="btn btn-ghost btn-sm" onclick="showCaseDetail('${h.caseId}')" title="View Case"><i class="fas fa-external-link-alt"></i></button>
                <button class="btn btn-ghost btn-sm" onclick="openAdjournModal('${h.caseId}', '${h.id}')" title="Request Adjournment"><i class="fas fa-calendar-alt"></i></button>
                <button class="btn btn-ghost btn-sm" onclick="markHearingDone('${h.caseId}', '${h.id}')" title="Mark Completed"><i class="fas fa-check-circle"></i></button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </section>`;
  }

  function renderHearingCards(filter = 'all', stageFilter = 'all') {
    let filtered = allHearings.filter(h => hearingMatchesWindow(h, filter));
    if (stageFilter !== 'all') filtered = filtered.filter(h => h.stageGroupId === stageFilter);

    const container = document.getElementById('hearings-grid');
    const summary = document.getElementById('hearing-stage-summary');
    if (!container || !summary) return;

    const todayCount = filtered.filter(h => h.date === today).length;
    const upcomingCount = filtered.filter(h => h.date >= today && h.date <= next7Days).length;
    const completedCount = filtered.filter(h => h.status === 'Completed').length;
    summary.innerHTML = `
      <div class="hearing-kpi-card"><span class="hearing-kpi-label">Visible Hearings</span><span class="hearing-kpi-value">${filtered.length}</span></div>
      <div class="hearing-kpi-card"><span class="hearing-kpi-label">Today</span><span class="hearing-kpi-value">${todayCount}</span></div>
      <div class="hearing-kpi-card"><span class="hearing-kpi-label">Next 7 Days</span><span class="hearing-kpi-value">${upcomingCount}</span></div>
      <div class="hearing-kpi-card"><span class="hearing-kpi-label">Completed</span><span class="hearing-kpi-value">${completedCount}</span></div>
    `;

    if (!filtered.length) {
      container.innerHTML = `<div class="empty-state-sm">No hearings found for the selected stage and date filter.</div>`;
      return;
    }

    container.innerHTML = stageSections
      .map(section => ({ section, items: filtered.filter(h => h.stageGroupId === section.id) }))
      .filter(group => group.items.length > 0)
      .map(group => buildStageSection(group.section, group.items))
      .join('');
  }

  document.getElementById('app-content').innerHTML = `
  <div class="page-header">
    <div class="page-header-row">
      <div><div class="page-title">Hearing Tracker</div>
      <div class="page-subtitle">Track hearings stage-wise across adjudication, appeals, tribunal, and courts</div></div>
      <button class="btn btn-primary" onclick="openAddHearing()"><i class="fas fa-plus"></i> Schedule Hearing</button>
    </div>
  </div>

  <div class="hearing-toolbar">
    <div class="hearing-filter-row">
      <button class="btn btn-outline btn-sm" onclick="renderHearingCards('all', window._hearingStageFilter || 'all')">All</button>
      <button class="btn btn-outline btn-sm" onclick="renderHearingCards('today', window._hearingStageFilter || 'all')">Today</button>
      <button class="btn btn-outline btn-sm" onclick="renderHearingCards('upcoming', window._hearingStageFilter || 'all')">Next 7 Days</button>
      <button class="btn btn-outline btn-sm" onclick="renderHearingCards('completed', window._hearingStageFilter || 'all')">Completed</button>
    </div>
    <div class="hearing-filter-row">
      <button class="btn btn-ghost btn-sm" onclick="window._hearingStageFilter='all'; renderHearingCards(window._hearingWindowFilter || 'all', 'all')">All Stages</button>
      ${stageSections.map(section => `<button class="btn btn-ghost btn-sm" onclick="window._hearingStageFilter='${section.id}'; renderHearingCards(window._hearingWindowFilter || 'all', '${section.id}')">${section.label}</button>`).join('')}
    </div>
  </div>

  <div id="hearing-stage-summary" class="hearing-kpi-grid"></div>
  <div id="hearings-grid" class="hearing-stage-board"></div>`;

  window.renderHearingCards = function(filter = 'all', stageFilter = 'all') {
    window._hearingWindowFilter = filter;
    window._hearingStageFilter = stageFilter;
    renderHearingCards(filter, stageFilter);
  };
  window._hearingWindowFilter = 'all';
  window._hearingStageFilter = 'all';
  window.renderHearingCards();

  window.openAddHearing = function() {
    Modal.open('Schedule Hearing', `
      <div class="form-grid">
        <div class="form-group" style="grid-column:1/-1">
          <label class="form-label">Select Case *</label>
          <select class="form-input" id="h-case-id">${caseOptions()}</select>
        </div>
        <div class="form-group"><label class="form-label">Hearing Date *</label><input type="date" class="form-input" id="h-date"></div>
        <div class="form-group"><label class="form-label">Time</label><input type="time" class="form-input" id="h-time"></div>
        <div class="form-group"><label class="form-label">Authority</label><input class="form-input" id="h-authority" placeholder="e.g. Dy. Commissioner, Circle-2"></div>
        <div class="form-group"><label class="form-label">Hearing Type</label>
          <select class="form-input" id="h-type"><option>Personal Hearing</option><option>Video Conference</option><option>Adjournment</option></select>
        </div>
      </div>`,
      '<button class="btn btn-primary" onclick="saveGlobalHearing()"><i class="fas fa-save"></i> Save Hearing</button>');
  };

  window.saveGlobalHearing = function() {
    const caseId = document.getElementById('h-case-id').value;
    const date = document.getElementById('h-date').value;
    if (!date) { toast('Date is required','error'); return; }
    const c = _updateCase(caseId, caseObj => {
      const stageMeta = getCaseStageMeta(caseObj.status || 'new-lead');
      if (!caseObj.hearings) caseObj.hearings = [];
      caseObj.hearings.push({
        id: uid(),
        date,
        time: document.getElementById('h-time').value,
        authority: document.getElementById('h-authority').value,
        type: document.getElementById('h-type').value,
        status: 'Scheduled',
        stageGroupId: stageMeta.groupId,
        stageStatus: caseObj.status || 'new-lead'
      });
    });
    if (c) {
      Modal.close(); App.modules.hearings(); toast('Hearing scheduled','success');
    }
  };
};


// ═══════════════════════════════════════════════════════════════
// MODULE 5: NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
App.modules.notifications = function() {
  const cases = DB.getArr('cases');
  const notifs = [];

  cases.forEach(c => {
    if (c.dueDate) {
      const days = daysFromNow(c.dueDate);
      if (days >= 0 && days <= 15) {
        notifs.push({ type: 'deadline', title: 'Case Deadline Approaching', text: `Case ${c.caseNo} (${c.taxpayerName}) is due in ${days} days.`, date: c.dueDate, caseId: c.id, severity: days <= 3 ? 'high' : 'medium' });
      }
    }
    (c.hearings || []).forEach(h => {
      const days = daysFromNow(h.date);
      if (days >= 0 && days <= 7) {
        notifs.push({ type: 'hearing', title: 'Upcoming Hearing', text: `Hearing for ${c.taxpayerName} scheduled on ${fmtDateShort(h.date)} at ${h.time || 'TBA'}.`, date: h.date, caseId: c.id, severity: days <= 1 ? 'high' : 'medium' });
      }
    });
  });

  notifs.sort((a,b) => new Date(a.date) - new Date(b.date));

  document.getElementById('app-content').innerHTML = `
    <div class="page-header">
      <div class="page-header-row">
        <div><div class="page-title">Notifications</div>
        <div class="page-subtitle">Critical alerts, deadlines and hearing reminders</div></div>
      </div>
    </div>
    <div class="notif-list">
      ${notifs.length ? notifs.map(n => `
        <div class="notif-item ${n.severity}" onclick="showCaseDetail('${n.caseId}')">
          <div class="notif-icon"><i class="fas ${n.type === 'deadline' ? 'fa-clock' : 'fa-gavel'}"></i></div>
          <div class="notif-body">
            <div class="notif-title">${n.title}</div>
            <div class="notif-text">${n.text}</div>
            <div class="notif-date">${fmtDateShort(n.date)}</div>
          </div>
        </div>`).join('') : '<div class="empty-state-sm">No active alerts.</div>'}
    </div>`;
};



// ═══════════════════════════════════════════════════════════════
// MODULE: EMPLOYEE MASTER
// ═══════════════════════════════════════════════════════════════
const EMPLOYEE_ROLE_OPTIONS = ['Partner', 'Manager', 'Assistant Manager', 'Article Assistant', 'Admin'];

function canonicalEmployeeRole(role) {
  const raw = String(role || '').trim();
  const compact = raw.toLowerCase().replace(/[^a-z]/g, '');
  if (compact === 'admin') return 'Admin';
  if (compact === 'partner') return 'Partner';
  if (compact === 'manager') return 'Manager';
  if (compact === 'assistantmanager' || compact === 'assisstantmanager') return 'Assistant Manager';
  if (compact === 'articleassistant' || compact === 'articleassisstant') return 'Article Assistant';
  if (compact === 'seniorassociate') return 'Assistant Manager';
  if (compact === 'associate' || compact === 'paralegal') return 'Article Assistant';
  return raw || 'Article Assistant';
}

function employeeRoleAccessLevel(role) {
  const normalized = canonicalEmployeeRole(role);
  return normalized === 'Partner' || normalized === 'Admin' ? 'admin' : 'own';
}

function employeeAccessScopeLabel(empOrRole) {
  const role = typeof empOrRole === 'string' ? empOrRole : (empOrRole && empOrRole.role);
  return employeeRoleAccessLevel(role) === 'admin' ? 'Full access' : 'Assigned and created cases';
}

function employeeRoleOptionsHtml(currentRole) {
  const selectedRole = canonicalEmployeeRole(currentRole);
  return EMPLOYEE_ROLE_OPTIONS.map(role => `<option value="${role}" ${selectedRole === role ? 'selected' : ''}>${role}</option>`).join('');
}

window.syncEmployeeAccessFromRole = function() {
  const roleEl = document.getElementById('fe-role');
  const accessEl = document.getElementById('fe-access');
  const noteEl = document.getElementById('fe-access-note');
  if (!roleEl || !accessEl) return;
  const access = employeeRoleAccessLevel(roleEl.value);
  accessEl.value = access;
  if (noteEl) {
    noteEl.textContent = access === 'admin'
      ? 'Full access to cases, clients, employees, settings, and reports.'
      : 'Can see cases assigned to them or created by them.';
  }
};

App.modules.employees = function() {
  function renderEmployees(search='') {
    let employees = DB.getArr('employees');
    if (search) {
      search = search.toLowerCase();
      employees = employees.filter(e => 
        (e.name||'').toLowerCase().includes(search) || 
        (e.role||'').toLowerCase().includes(search) ||
        (e.email||'').toLowerCase().includes(search)
      );
    }
    const cases = DB.getArr('cases');
    const el = document.getElementById('employee-list');
    if (!el) return;
    
    if (!employees.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="fas fa-id-badge"></i></div>
        <div class="empty-title">No employees yet</div>
        <div class="empty-desc">Add your first employee to the firm's master list.</div>
        <button class="btn btn-primary mt-3" onclick="openAddEmployee()"><i class="fas fa-plus"></i> Add Employee</button></div>`;
      return;
    }

    el.innerHTML = employees.map(emp => {
      const linked = cases.filter(c => c.allottedTo === emp.id || c.allottedTo === emp.name || c.createdBy === emp.id || c.createdBy === emp.name);
      const statusColor = emp.status === 'Active' ? 'green' : 'gray';
      
      return `<div class="card mb-3" style="cursor:pointer" onclick="openEmployeeDetail('${emp.id}')">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:44px;height:44px;border-radius:22px;background:var(--blue-dim);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:var(--blue);flex-shrink:0">
            ${(emp.name||'?')[0].toUpperCase()}
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:15px">${emp.name} <span class="badge badge-${statusColor}" style="font-size:10px;margin-left:8px">${emp.status || 'Active'}</span></div>
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:2px">${canonicalEmployeeRole(emp.role)} &nbsp;|&nbsp; ${employeeAccessScopeLabel(emp)}</div>
            <div style="font-size:12px;color:var(--text-muted)">
              <i class="fas fa-envelope mr-1"></i> ${emp.email || '—'} &nbsp;|&nbsp; 
              <i class="fas fa-phone mr-1"></i> ${emp.mobile || '—'}
            </div>
          </div>
          <div style="text-align:right; margin-right: 15px;">
            <div style="font-size:12px;color:var(--text-muted)">Accessible Cases</div>
            <div style="font-size:14px;font-weight:700;color:var(--blue)">${linked.length}</div>
          </div>
          <div style="display:flex; gap:4px">
            <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openEditEmployee('${emp.id}')" title="Edit Employee"><i class="fas fa-edit"></i></button>
            <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();deleteEmployee('${emp.id}')" title="Delete Employee"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  document.getElementById('app-content').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <div style="display:flex;gap:10px;flex:1;max-width:400px">
        <div class="search-box" style="flex:1">
          <i class="fas fa-search search-icon"></i>
          <input type="text" id="emp-search" class="form-input" placeholder="Search employees..." oninput="App.modules.employees.render(this.value)">
        </div>
      </div>
      <button class="btn btn-primary" onclick="openAddEmployee()"><i class="fas fa-plus"></i> Add Employee</button>
    </div>
    <div id="employee-list"></div>
  `;
  
  App.modules.employees.render = renderEmployees;
  renderEmployees();
};

window.openAddEmployee = function() {
  Modal.open('Add Employee', `
    <div class="form-group"><label class="form-label">Full Name <span class="req">*</span></label><input id="fe-name" class="form-input"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Role</label>
        <select id="fe-role" class="form-select" onchange="syncEmployeeAccessFromRole()">
          ${employeeRoleOptionsHtml('Article Assistant')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Status</label>
        <select id="fe-status" class="form-select"><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Email</label><input id="fe-email" class="form-input" type="email"></div>
      <div class="form-group"><label class="form-label">Mobile</label><input id="fe-mobile" class="form-input"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Username</label><input id="fe-username" class="form-input" autocomplete="off"></div>
      <div class="form-group"><label class="form-label">Temporary Password</label><input id="fe-password" class="form-input" type="password" autocomplete="new-password"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Access Level</label>
        <select id="fe-access" class="form-select" disabled>
          <option value="own" selected>Assigned and created cases</option>
          <option value="admin">Full access</option>
        </select>
        <div id="fe-access-note" style="font-size:11px;color:var(--text-muted);margin-top:6px">Can see cases assigned to them or created by them.</div>
      </div>
      <div class="form-group"><label class="form-label">Login Access</label>
        <select id="fe-can-login" class="form-select"><option value="true">Enabled</option><option value="">Disabled</option></select>
      </div>
    </div>
  `, `<button class="btn btn-primary" onclick="saveEmployee()"><i class="fas fa-check"></i> Save</button>`);
  syncEmployeeAccessFromRole();
};

window.openEditEmployee = function(id) {
  const emp = DB.getArr('employees').find(e => e.id === id);
  if (!emp) return;
  const role = canonicalEmployeeRole(emp.role);
  const access = employeeRoleAccessLevel(role);
  Modal.open('Edit Employee', `
    <input type="hidden" id="fe-id" value="${emp.id}">
    <div class="form-group"><label class="form-label">Full Name <span class="req">*</span></label><input id="fe-name" class="form-input" value="${emp.name||''}"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Role</label>
        <select id="fe-role" class="form-select" onchange="syncEmployeeAccessFromRole()">
          ${employeeRoleOptionsHtml(role)}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Status</label>
        <select id="fe-status" class="form-select">
          <option value="Active" ${emp.status==='Active'?'selected':''}>Active</option>
          <option value="Inactive" ${emp.status==='Inactive'?'selected':''}>Inactive</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Email</label><input id="fe-email" class="form-input" type="email" value="${emp.email||''}"></div>
      <div class="form-group"><label class="form-label">Mobile</label><input id="fe-mobile" class="form-input" value="${emp.mobile||''}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Username</label><input id="fe-username" class="form-input" value="${emp.username||emp.email||''}" autocomplete="off"></div>
      <div class="form-group"><label class="form-label">New Password</label><input id="fe-password" class="form-input" type="password" placeholder="Leave blank to keep current password" autocomplete="new-password"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Access Level</label>
        <select id="fe-access" class="form-select" disabled>
          <option value="own" ${access==='own'?'selected':''}>Assigned and created cases</option>
          <option value="admin" ${access==='admin'?'selected':''}>Full access</option>
        </select>
        <div id="fe-access-note" style="font-size:11px;color:var(--text-muted);margin-top:6px">${employeeAccessScopeLabel(role) === 'Full access' ? 'Full access to cases, clients, employees, settings, and reports.' : 'Can see cases assigned to them or created by them.'}</div>
      </div>
      <div class="form-group"><label class="form-label">Login Access</label>
        <select id="fe-can-login" class="form-select">
          <option value="true" ${emp.canLogin==='true'||emp.canLogin===true?'selected':''}>Enabled</option>
          <option value="" ${emp.canLogin==='true'||emp.canLogin===true?'':'selected'}>Disabled</option>
        </select>
      </div>
    </div>
  `, `<button class="btn btn-primary" onclick="saveEmployee()"><i class="fas fa-check"></i> Save Changes</button>`);
  syncEmployeeAccessFromRole();
};

window.saveEmployee = async function() {
  const id = document.getElementById('fe-id') ? document.getElementById('fe-id').value : null;
  const name = document.getElementById('fe-name').value.trim();
  if (!name) return alert('Name is required');
  const role = canonicalEmployeeRole(document.getElementById('fe-role').value);
  
  const emp = {
    id: id || 'EMP' + Date.now().toString(36).toUpperCase(),
    name,
    role,
    status: document.getElementById('fe-status').value,
    email: document.getElementById('fe-email').value,
    mobile: document.getElementById('fe-mobile').value,
    username: document.getElementById('fe-username').value.trim(),
    accessLevel: employeeRoleAccessLevel(role),
    canLogin: document.getElementById('fe-can-login').value,
    updatedAt: new Date().toISOString()
  };
  const password = document.getElementById('fe-password').value;
  if (emp.canLogin === 'true' && !emp.username && !emp.email) {
    toast('Username or email is required for login access', 'error');
    return;
  }
  if (!id && emp.canLogin === 'true' && !password) {
    toast('Temporary password is required for a new login', 'error');
    return;
  }
  if (password) emp.password = password;
  
  let employees = DB.getArr('employees');
  if (id) {
    emp.createdAt = employees.find(e => e.id === id)?.createdAt || new Date().toISOString();
    employees = employees.map(e => e.id === id ? emp : e);
  } else {
    emp.createdAt = new Date().toISOString();
    employees.push(emp);
  }
  
  DB.set('employees', employees);
  const synced = await DB.flushNow();
  Modal.close();
  toast(synced ? 'Employee saved and login synced' : 'Employee saved locally; backend sync pending', synced ? 'success' : 'warning');
  if (App.currentModule === 'employees') App.modules.employees();
};

window.deleteEmployee = function(id) {
  if (!confirm('Are you sure you want to delete this employee? Linked cases will retain the assignment ID but lose the employee link.')) return;
  DB.set('employees', DB.getArr('employees').filter(e => e.id !== id));
  toast('Employee deleted', 'success');
  if (App.currentModule === 'employees') App.modules.employees();
};

window.openEmployeeDetail = function(id) {
  const emp = DB.getArr('employees').find(e => e.id === id);
  if (!emp) return;
  
  const cases = DB.getArr('cases').filter(c => c.allottedTo === emp.id || c.allottedTo === emp.name || c.createdBy === emp.id || c.createdBy === emp.name);
  
  const html = `
    <div style="display:flex;align-items:center;gap:15px;margin-bottom:20px;padding-bottom:15px;border-bottom:1px solid var(--border)">
      <div style="width:60px;height:60px;border-radius:30px;background:var(--blue);color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">
        ${(emp.name||'?')[0].toUpperCase()}
      </div>
      <div>
        <h2 style="margin:0 0 5px">${emp.name}</h2>
        <div style="color:var(--text-muted);font-size:13px">${canonicalEmployeeRole(emp.role)} &nbsp;|&nbsp; ${employeeAccessScopeLabel(emp)} &nbsp;|&nbsp; Status: <b style="color:${emp.status==='Active'?'var(--green)':'var(--red)'}">${emp.status}</b></div>
      </div>
    </div>
    
    <div class="grid-2" style="margin-bottom:20px">
      <div class="card">
        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">Contact Info</div>
        <div style="font-size:14px;margin-bottom:5px"><i class="fas fa-envelope mr-2" style="color:var(--blue)"></i> ${emp.email || 'N/A'}</div>
        <div style="font-size:14px"><i class="fas fa-phone mr-2" style="color:var(--blue)"></i> ${emp.mobile || 'N/A'}</div>
      </div>
      <div class="card">
        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">Workload</div>
        <div style="font-size:24px;font-weight:800;color:var(--blue)">${cases.length} <span style="font-size:14px;font-weight:400;color:var(--text-muted)">active cases</span></div>
      </div>
    </div>
    
    <h3 style="margin:25px 0 15px;font-size:15px;color:var(--text);border-bottom:2px solid var(--border);padding-bottom:5px">Assigned Cases</h3>
    ${cases.length === 0 ? '<div class="empty-state" style="padding:20px"><div class="empty-desc">No cases assigned to this employee.</div></div>' : 
      cases.map(c => `
      <div class="card mb-2" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center" onclick="Modal.close(); showCaseDetail('${c.id}')">
        <div>
          <div style="font-weight:600;font-size:14px;color:var(--blue)">${c.caseNo}</div>
          <div style="font-size:13px;color:var(--text)">${c.taxpayerName}</div>
        </div>
        <div class="badge badge-gray">${c.status}</div>
      </div>
      `).join('')
    }
  `;
  
  Modal.open('Employee Profile', html);
};
  window.markHearingDone = function(caseId, hearingId) {
    const c = _updateCase(caseId, caseObj => {
      const h = (caseObj.hearings || []).find(x => x.id === hearingId);
      if (h) {
        h.status = 'Completed';
      }
    });
    if (c) {
      App.modules.hearings();
      toast('Hearing marked as completed', 'success');
    }
  };

  window.openAdjournModal = function(caseId, hearingId) {
    Modal.open('Request Adjournment', `
      <div class="form-group">
        <label class="form-label">Reason for Adjournment</label>
        <textarea class="form-input" id="adj-reason" rows="3" placeholder="e.g. Authorized representative unavailable"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Next Tentative Date</label>
        <input type="date" class="form-input" id="adj-next-date">
      </div>`,
      `<button class="btn btn-primary" onclick="saveAdjournment('${caseId}', '${hearingId}')"><i class="fas fa-save"></i> Save Adjournment</button>`);
  };

  window.saveAdjournment = function(caseId, hearingId) {
    const nextDate = document.getElementById('adj-next-date').value;
    const reason = document.getElementById('adj-reason').value;
    if (!nextDate) { toast('Next date is required', 'error'); return; }
    
    const c = _updateCase(caseId, caseObj => {
      const h = (caseObj.hearings || []).find(x => x.id === hearingId);
      if (h) {
        h.status = 'Adjourned';
        h.notes = (h.notes || '') + ' | Adjourned to ' + nextDate + ': ' + reason;
        // Automatically schedule next hearing
        caseObj.hearings.push({
          id: uid(),
          date: nextDate,
          authority: h.authority,
          type: h.type,
          status: 'Scheduled',
          notes: 'Adjourned from ' + h.date,
          stageGroupId: h.stageGroupId || getCaseStageMeta(caseObj.status || 'new-lead').groupId,
          stageStatus: h.stageStatus || caseObj.status || 'new-lead'
        });
      }
    });
    if (c) {
      Modal.close();
      App.modules.hearings();
      toast('Hearing adjourned and rescheduled', 'success');
    }
  };

window.openAddCaseWithClient = function(clientId) {
  const cl = DB.getArr('clients').find(c => c.id === clientId);
  if (!cl) return;
  
  // Reuse existing openAddCase if possible, or trigger it and pre-fill
  if (window.openAddCase) {
    window.openAddCase();
    setTimeout(() => {
      const sel = document.getElementById('case-client-id');
      if (sel) {
        sel.value = clientId;
        // Trigger any onchange if necessary to auto-fill other fields
        if (sel.onchange) sel.onchange();
      } else {
        // Fallback: fill fields directly if selector not found
        if (document.getElementById('c-legal')) document.getElementById('c-legal').value = cl.legalName || cl.name;
        if (document.getElementById('c-trade')) document.getElementById('c-trade').value = cl.tradeName || '';
        if (document.getElementById('c-gstin')) document.getElementById('c-gstin').value = cl.gstin || '';
        if (document.getElementById('c-addr')) document.getElementById('c-addr').value = cl.address || '';
      }
    }, 100);
  }
};

// Dashboard override: deeper operational audit + clearer presentation.
(function() {
  const DASH_STATUS_COLORS = {
    'new-lead': 'gray',
    'scn-received': 'orange',
    'reply-filed': 'blue',
    'ph-pending': 'orange',
    'oio-received': 'red',
    'appeal-filed': 'purple',
    'appeal-ph': 'purple',
    'oia-received': 'red',
    'gstat-appeal-filed': 'purple',
    'gstat-ph': 'purple',
    'tribunal-order': 'red',
    'hc-petition-filed': 'purple',
    'sc-petition-filed': 'red',
    closed: 'green',
    dropped: 'gray'
  };

  const DASH_STATUS_LABELS = {
    'new-lead': 'New Lead',
    'scn-received': 'SCN Received',
    'reply-filed': 'Reply Filed',
    'ph-pending': 'Personal Hearing',
    'oio-received': 'OIO Received',
    'appeal-filed': 'Appeal Filed',
    'appeal-ph': 'Appeal Hearing',
    'oia-received': 'OIA Received',
    'gstat-appeal-filed': 'GSTAT Appeal',
    'gstat-ph': 'GSTAT Hearing',
    'tribunal-order': 'Tribunal Order',
    'hc-petition-filed': 'High Court',
    'sc-petition-filed': 'Supreme Court',
    closed: 'Closed',
    dropped: 'Dropped'
  };

  function safeText(value) {
    return String(value || '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function caseExposure(c) {
    return c.totalAmount || (c.demandAmount || 0) + (c.penaltyAmount || 0) + (c.interestAmount || 0) + (c.otherAmount || 0);
  }

  function statusLabel(status) {
    return DASH_STATUS_LABELS[status] || (status || 'Unassigned');
  }

  function statusColor(status) {
    return DASH_STATUS_COLORS[status] || 'gray';
  }

  function priorityWeight(c) {
    const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 };
    const due = c.dueDate ? daysFromNow(c.dueDate) : null;
    const dueWeight = due === null ? 0 : due < 0 ? 6 : due <= 3 ? 5 : due <= 7 ? 4 : due <= 15 ? 3 : 1;
    return (priorityMap[c.priority] || 0) * 10 + dueWeight;
  }

  function caseAgeDays(c) {
    const raw = c.createdAt || c.receiptDate || c.scnDate;
    if (!raw) return 0;
    const created = new Date(raw);
    if (isNaN(created.getTime())) return 0;
    return Math.max(0, Math.floor((new Date() - created) / 86400000));
  }

  function buildSnapshot() {
    const cases = DB.getArr('cases');
    const employees = DB.getArr('employees');
    const activeCases = cases.filter(c => !['closed', 'dropped'].includes(c.status));
    const controlProfiles = activeCases.map(c => ({ caseRecord: c, profile: getLitigationControlProfile(c) }));
    const urgentCases = activeCases
      .filter(c => c.dueDate && daysFromNow(c.dueDate) !== null && daysFromNow(c.dueDate) <= 15)
      .sort((a, b) => priorityWeight(b) - priorityWeight(a))
      .slice(0, 5);
    const upcomingHearings = activeCases
      .flatMap(c => (c.hearings || []).map(h => ({ ...h, caseNo: c.caseNo, taxpayerName: c.taxpayerName, caseId: c.id })))
      .filter(h => h.date && daysFromNow(h.date) >= 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
    const totalExposure = activeCases.reduce((sum, c) => sum + caseExposure(c), 0);
    const totalCollected = activeCases.reduce((sum, c) => sum + (c.amountCollected || 0), 0);
    const controlQueue = controlProfiles
      .filter(item => item.profile.score >= 35 || item.profile.documentGaps.length || item.profile.preDeposit.pending > 0)
      .sort((a, b) => b.profile.score - a.profile.score || b.profile.exposure - a.profile.exposure)
      .slice(0, 5);
    const statutoryClockItems = controlProfiles
      .flatMap(item => item.profile.limitationItems.map(clock => ({ ...clock, caseRecord: item.caseRecord })))
      .filter(clock => clock.days <= 30)
      .sort((a, b) => a.days - b.days)
      .slice(0, 5);
    const probableExposure = controlProfiles.filter(item => item.profile.classification === 'Probable exposure').length;
    const possibleExposure = controlProfiles.filter(item => item.profile.classification === 'Possible exposure').length;
    const documentGapCases = controlProfiles.filter(item => item.profile.documentGaps.length > 0).length;
    const preDepositPending = controlProfiles.reduce((sum, item) => sum + item.profile.preDeposit.pending, 0);
    const suggestedProvision = controlProfiles.reduce((sum, item) => sum + item.profile.provisionAmount, 0);
    const missingOwner = activeCases.filter(c => !c.allottedTo).length;
    const missingNextStep = activeCases.filter(c => !c.whatIsToBeDone && !(c.pendingList || []).length).length;
    const missingDates = activeCases.filter(c => !c.dueDate && !(c.hearings || []).length).length;
    const stageMix = Object.entries(activeCases.reduce((acc, c) => {
      const key = c.status || 'new-lead';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const topExposureCases = [...activeCases].sort((a, b) => caseExposure(b) - caseExposure(a)).slice(0, 5);
    const criticalCases = activeCases.filter(c => c.priority === 'critical').length;
    const overdueCases = activeCases.filter(c => c.dueDate && daysFromNow(c.dueDate) < 0).length;
    const dueIn7Days = activeCases.filter(c => c.dueDate && daysFromNow(c.dueDate) >= 0 && daysFromNow(c.dueDate) <= 7).length;
    const dueIn15Days = activeCases.filter(c => c.dueDate && daysFromNow(c.dueDate) >= 0 && daysFromNow(c.dueDate) <= 15).length;
    const recoveryRate = totalExposure > 0 ? Math.round((totalCollected / totalExposure) * 100) : 0;
    const avgAge = activeCases.length ? Math.round(activeCases.reduce((sum, c) => sum + caseAgeDays(c), 0) / activeCases.length) : 0;
    const deadlineBands = [
      { label: 'Overdue', value: overdueCases, tone: 'alert' },
      { label: '0-7 days', value: dueIn7Days, tone: 'alert' },
      { label: '8-15 days', value: Math.max(0, dueIn15Days - dueIn7Days), tone: 'info' },
      { label: 'No date', value: missingDates, tone: 'watch' }
    ];
    const ownerLoad = employees
      .filter(e => e.status !== 'Inactive')
      .map(e => {
        const assigned = activeCases.filter(c => c.allottedTo === e.id || c.allottedTo === e.name);
        const urgent = assigned.filter(c => c.dueDate && daysFromNow(c.dueDate) <= 7).length;
        return {
          id: e.id,
          name: e.name,
          role: e.role,
          count: assigned.length,
          urgent,
          exposure: assigned.reduce((sum, c) => sum + caseExposure(c), 0)
        };
      })
      .sort((a, b) => b.urgent - a.urgent || b.count - a.count || b.exposure - a.exposure)
      .slice(0, 5);
    const readinessScore = activeCases.length
      ? Math.max(0, 100 - Math.round(((missingOwner + missingNextStep + missingDates) / (activeCases.length * 3)) * 100))
      : 100;

    return {
      cases,
      activeCases,
      urgentCases,
      upcomingHearings,
      totalExposure,
      totalCollected,
      controlQueue,
      statutoryClockItems,
      probableExposure,
      possibleExposure,
      documentGapCases,
      preDepositPending,
      suggestedProvision,
      missingOwner,
      missingNextStep,
      missingDates,
      stageMix,
      topExposureCases,
      criticalCases,
      overdueCases,
      dueIn7Days,
      dueIn15Days,
      recoveryRate,
      readinessScore,
      avgAge,
      deadlineBands,
      ownerLoad
    };
  }

  function renderPriorityQueue(urgentCases) {
    if (!urgentCases.length) {
      return '<div class="priority-item"><div class="priority-title">No urgent deadlines in the next 15 days</div><div class="priority-sub">Use this window to update notes, owners, and upcoming hearing details.</div></div>';
    }

    return urgentCases.map(c => {
      const due = daysFromNow(c.dueDate);
      const dueLabel = due < 0 ? Math.abs(due) + ' day(s) overdue' : due === 0 ? 'Due today' : 'Due in ' + due + ' day(s)';
      return `
        <div class="priority-item" onclick="showCaseDetail('${c.id}')" style="cursor:pointer">
          <div class="priority-head">
            <div>
              <div class="priority-title">${safeText(c.taxpayerName || 'Unnamed matter')}</div>
              <div class="priority-sub">${safeText(c.caseNo || 'Case number pending')} | ${safeText(statusLabel(c.status))}</div>
            </div>
            <span class="badge badge-${statusColor(c.status)}">${safeText((c.priority || 'watch').toUpperCase())}</span>
          </div>
          <div class="priority-meta">
            <span class="mini-pill ${due <= 3 ? 'alert' : 'info'}"><i class="fas fa-hourglass-half"></i> ${safeText(dueLabel)}</span>
            <span class="mini-pill"><i class="fas fa-scale-balanced"></i> ${fmtINR(caseExposure(c))}</span>
            <span class="mini-pill"><i class="fas fa-user-tie"></i> ${safeText(resolveEmployeeName(c.allottedTo) || 'Owner missing')}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderControlQueue(items) {
    if (!items.length) {
      return '<div class="control-queue-row"><div><b>Portfolio controls look stable</b><span>No high-risk case, deposit gap, or material document gap is currently flagged.</span></div><em>Clear</em></div>';
    }

    return items.map(item => {
      const c = item.caseRecord;
      const profile = item.profile;
      return `
        <div class="control-queue-row" onclick="showCaseDetail('${c.id}')">
          <div>
            <b>${safeText(c.taxpayerName || 'Unnamed matter')}</b>
            <span>${safeText(c.caseNo || 'Case number pending')} | ${safeText(profile.nextAction)}</span>
          </div>
          <em class="${profile.risk.tone}">${profile.score}</em>
        </div>
      `;
    }).join('');
  }

  function renderStatutoryClockWatch(items) {
    if (!items.length) {
      return '<div class="control-queue-row"><div><b>No statutory clock inside 30 days</b><span>Appeal and filing clocks will appear here once dates are recorded.</span></div><em>OK</em></div>';
    }

    return items.map(item => `
      <div class="control-queue-row" onclick="showCaseDetail('${item.caseRecord.id}')">
        <div>
          <b>${safeText(item.label)}</b>
          <span>${safeText(item.caseRecord.caseNo || 'Case number pending')} | ${safeText(item.reference || '')}</span>
        </div>
        <em class="${item.tone}">${item.days < 0 ? Math.abs(item.days) + 'd late' : item.days === 0 ? 'today' : item.days + 'd'}</em>
      </div>
    `).join('');
  }

  function renderExposureSpotlight(cases) {
    if (!cases.length) return '<div class="p-6 text-center text-muted text-sm">No active cases found.</div>';

    return cases.map(c => `
      <div class="spotlight-item" onclick="showCaseDetail('${c.id}')">
        <div class="spotlight-head">
          <div>
            <div class="spotlight-title">${safeText(c.taxpayerName || 'Unnamed matter')}</div>
            <div class="spotlight-sub">${safeText(c.caseNo || 'Case number pending')} | ${safeText(statusLabel(c.status))}</div>
          </div>
          <span class="badge badge-${statusColor(c.status)}">${safeText((c.priority || 'watch').toUpperCase())}</span>
        </div>
        <div class="spotlight-metrics">
          <span class="mini-pill info"><i class="fas fa-scale-balanced"></i> ${fmtINR(caseExposure(c))}</span>
          <span class="mini-pill"><i class="fas fa-calendar"></i> ${safeText(c.period || 'Period pending')}</span>
          <span class="mini-pill"><i class="fas fa-user-tie"></i> ${safeText(resolveEmployeeName(c.allottedTo) || 'Owner missing')}</span>
        </div>
      </div>
    `).join('');
  }

  function renderAuditList(snap) {
    const items = [
      {
        level: snap.missingOwner ? 'attention' : 'good',
        icon: snap.missingOwner ? 'fa-user-slash' : 'fa-user-check',
        title: snap.missingOwner ? snap.missingOwner + ' active case(s) without an owner' : 'Ownership assigned across active matters',
        note: snap.missingOwner ? 'Assign responsible team members so hearings, drafts, and follow-ups do not drift.' : 'Current staffing data looks usable for daily follow-through.',
        value: snap.missingOwner ? 'Fix now' : 'Healthy'
      },
      {
        level: snap.missingNextStep ? 'watch' : 'good',
        icon: snap.missingNextStep ? 'fa-list-check' : 'fa-check-double',
        title: snap.missingNextStep ? snap.missingNextStep + ' case(s) missing a next action' : 'Next-step notes are maintained across the portfolio',
        note: snap.missingNextStep ? 'Populate "what is to be done" or the pending list to keep execution obvious.' : 'Action sequencing is visible to the team.',
        value: snap.missingNextStep ? 'Watch' : 'Healthy'
      },
      {
        level: snap.missingDates ? 'watch' : 'good',
        icon: snap.missingDates ? 'fa-calendar-xmark' : 'fa-calendar-check',
        title: snap.missingDates ? snap.missingDates + ' case(s) missing a due date or hearing anchor' : 'Key dates are present for active matters',
        note: snap.missingDates ? 'Add due dates or hearing entries so reminders and review queues stay reliable.' : 'Calendar-based monitoring should remain dependable.',
        value: snap.missingDates ? 'Update' : 'Healthy'
      }
    ];

    return items.map(item => `
      <div class="audit-item ${item.level}">
        <div class="audit-icon"><i class="fas ${item.icon}"></i></div>
        <div>
          <div class="spotlight-title">${safeText(item.title)}</div>
          <div class="audit-note">${safeText(item.note)}</div>
        </div>
        <span class="mini-pill ${item.level === 'good' ? 'good' : item.level === 'attention' ? 'alert' : 'info'}">${safeText(item.value)}</span>
      </div>
    `).join('');
  }

  function renderHearingTracker(hearings) {
    if (!hearings.length) {
      return '<div class="tracker-item"><div class="tracker-title">No upcoming hearings on record</div><div class="tracker-sub">Once hearings are added to cases, the next listed dates will show here.</div></div>';
    }

    return hearings.map(h => `
      <div class="tracker-item">
        <div class="tracker-head">
          <div>
            <div class="tracker-title">${safeText(h.taxpayerName || 'Unnamed matter')}</div>
            <div class="tracker-sub">${safeText(h.caseNo || 'Case number pending')}</div>
          </div>
          <span class="badge badge-blue">${safeText(h.status || 'Scheduled')}</span>
        </div>
        <div class="tracker-meta">
          <span class="mini-pill info"><i class="fas fa-calendar"></i> ${safeText(fmtDateShort(h.date))}</span>
          <span class="mini-pill"><i class="fas fa-building-columns"></i> ${safeText(h.authority || 'Authority pending')}</span>
          <span class="mini-pill"><a href="#" onclick="showCaseDetail('${h.caseId}'); return false;">Open case</a></span>
        </div>
      </div>
    `).join('');
  }

  function renderDeadlineBands(bands) {
    const max = Math.max(1, ...bands.map(b => b.value));
    return bands.map(b => `
      <div class="dash-band-row">
        <div class="dash-band-label">
          <span class="mini-pill ${b.tone === 'alert' ? 'alert' : b.tone === 'watch' ? 'info' : 'good'}">${safeText(b.label)}</span>
          <b>${b.value}</b>
        </div>
        <div class="dash-band-track"><div class="dash-band-fill ${b.tone}" style="width:${Math.round((b.value / max) * 100)}%"></div></div>
      </div>
    `).join('');
  }

  function renderOwnerWorkload(load) {
    if (!load.length) {
      return '<div class="tracker-item"><div class="tracker-title">No active employee workload yet</div><div class="tracker-sub">Add employees and allot matters to see workload pressure here.</div></div>';
    }
    const max = Math.max(1, ...load.map(o => o.count));
    return load.map(o => `
      <div class="owner-row">
        <div class="owner-avatar">${safeText((o.name || '?').slice(0, 1).toUpperCase())}</div>
        <div class="owner-main">
          <div class="owner-head"><b>${safeText(o.name || 'Unnamed')}</b><span>${safeText(o.role || 'Staff')}</span></div>
          <div class="dash-band-track"><div class="dash-band-fill info" style="width:${Math.round((o.count / max) * 100)}%"></div></div>
          <div class="owner-meta">${o.count} active | ${o.urgent} urgent | ${fmtINR(o.exposure)}</div>
        </div>
      </div>
    `).join('');
  }

  function renderStageFlow(stageMix, activeCount) {
    if (!stageMix.length) {
      return '<div class="tracker-item"><div class="tracker-title">No active stage movement yet</div><div class="tracker-sub">Active case stages will appear here as matters are added.</div></div>';
    }
    return stageMix.map(([status, count]) => {
      const pct = activeCount ? Math.round((count / activeCount) * 100) : 0;
      return `
        <div class="stage-flow-row">
          <div class="stage-flow-top"><span>${safeText(statusLabel(status))}</span><b>${count}</b></div>
          <div class="dash-band-track"><div class="dash-band-fill ${statusColor(status)}" style="width:${pct}%"></div></div>
          <div class="owner-meta">${pct}% of active matters</div>
        </div>
      `;
    }).join('');
  }

  function renderDemandStageBars(stats) {
    const entries = Object.entries(stats)
      .map(([status, amount]) => ({ status, amount }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    if (!entries.length) {
      return '<div class="tracker-item"><div class="tracker-title">No exposure data yet</div><div class="tracker-sub">Demand values entered in cases will appear here by stage.</div></div>';
    }

    const max = Math.max(1, ...entries.map(item => item.amount));
    return `
      <div class="stage-exposure-list">
        ${entries.map(item => {
          const pct = Math.max(4, Math.round((item.amount / max) * 100));
          return `
            <div class="stage-exposure-row">
              <div class="stage-exposure-top">
                <span>${safeText(statusLabel(item.status))}</span>
                <b>${fmtINR(item.amount)}</b>
              </div>
              <div class="dash-band-track">
                <div class="dash-band-fill ${statusColor(item.status)}" style="width:${pct}%"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function initDashboardDemandChart() {
    const ctx = document.getElementById('demandChart');
    if (!ctx) return;
    const cases = DB.getArr('cases');
    const stats = {};
    cases.forEach(c => {
      const status = c.status || 'new-lead';
      stats[status] = (stats[status] || 0) + caseExposure(c);
    });
    if (!window.Chart) {
      const wrap = ctx.parentElement;
      if (wrap) {
        wrap.innerHTML = renderDemandStageBars(stats);
      }
      return;
    }
    const labels = Object.keys(stats).map(statusLabel);
    const data = Object.values(stats);
    if (window.dashboardDemandChart) window.dashboardDemandChart.destroy();
    window.dashboardDemandChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#2563EB', '#D97706', '#DC2626', '#059669', '#7C3AED', '#EA580C', '#64748B'],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: { usePointStyle: true, padding: 14, font: { size: 10, family: "'Manrope', sans-serif" } }
          },
          tooltip: {
            callbacks: {
              label: function(context) { return ' ' + fmtINR(context.raw || 0); }
            }
          }
        }
      }
    });
  }

  App.modules.dashboard = function() {
    const snap = buildSnapshot();
    const syncInfo = DB.getSyncInfo ? DB.getSyncInfo() : { text: 'Checking backend', detail: '' };
    const subtitleDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    const currentUser = Auth.currentUser || Auth.getStoredUser() || {};
    const accessScope = (currentUser.accessLevel || '').toLowerCase() === 'admin' ? 'Full access' : 'Assigned and created cases';
    const clientTarget = Auth.can('manage-clients') ? 'clients' : 'cases';

    document.getElementById('app-content').innerHTML = `
      <div class="dashboard-shell dashboard-ops-shell">
        <div class="dashboard-toolbar">
          <div>
            <div class="dashboard-eyebrow">GST Litigation Office</div>
            <div class="page-title">Executive Dashboard</div>
            <div class="page-subtitle">Operational view for ${subtitleDate} | ${safeText(currentUser.name || 'Signed in user')} | ${safeText(accessScope)}</div>
          </div>
          <div class="dashboard-toolbar-actions">
            <button class="btn btn-outline" onclick="App.navigate('pipeline')"><i class="fas fa-columns"></i> Pipeline</button>
            <button class="btn btn-outline" onclick="App.refreshDataNow()"><i class="fas fa-sync-alt"></i> Sync Data</button>
            <button class="btn btn-primary" onclick="openAddCase()"><i class="fas fa-plus-circle"></i> New Case</button>
          </div>
        </div>

        <div class="dashboard-focus-strip dashboard-focus-grid">
          <button class="focus-chip danger" onclick="App.navigate('notifications')"><i class="fas fa-triangle-exclamation"></i><span>Overdue</span><b>${snap.overdueCases}</b></button>
          <button class="focus-chip warning" onclick="App.navigate('notifications')"><i class="fas fa-bell"></i><span>Due in 7 days</span><b>${snap.dueIn7Days}</b></button>
          <button class="focus-chip info" onclick="App.navigate('cases')"><i class="fas fa-user-slash"></i><span>Missing owner</span><b>${snap.missingOwner}</b></button>
          <button class="focus-chip success" onclick="App.navigate('hearings')"><i class="fas fa-calendar-check"></i><span>Next hearings</span><b>${snap.upcomingHearings.length}</b></button>
        </div>

        <div class="litigation-command-grid">
          <div class="card p-0 overflow-hidden">
            <div class="litigation-command-head">
              <div>
                <div class="spotlight-title">Expert Control Queue</div>
                <div class="card-header-copy">Risk-weighted matters needing partner or manager action.</div>
              </div>
              <span class="badge badge-red">${snap.controlQueue.length} flagged</span>
            </div>
            <div class="control-queue-list">${renderControlQueue(snap.controlQueue)}</div>
          </div>
          <div class="card p-0 overflow-hidden">
            <div class="litigation-command-head">
              <div>
                <div class="spotlight-title">Provisioning Snapshot</div>
                <div class="card-header-copy">Commercial exposure view for management reporting.</div>
              </div>
              <span class="badge badge-orange">${fmtINR(snap.suggestedProvision)}</span>
            </div>
            <div class="provision-grid">
              <div><span>Probable</span><b>${snap.probableExposure}</b></div>
              <div><span>Possible</span><b>${snap.possibleExposure}</b></div>
              <div><span>Doc gaps</span><b>${snap.documentGapCases}</b></div>
              <div><span>Deposit pending</span><b>${fmtINR(snap.preDepositPending)}</b></div>
            </div>
          </div>
          <div class="card p-0 overflow-hidden">
            <div class="litigation-command-head">
              <div>
                <div class="spotlight-title">Statutory Clock Watch</div>
                <div class="card-header-copy">Appeal, filing, and internal due clocks inside 30 days.</div>
              </div>
              <span class="badge badge-blue">${snap.statutoryClockItems.length} clocks</span>
            </div>
            <div class="control-queue-list">${renderStatutoryClockWatch(snap.statutoryClockItems)}</div>
          </div>
        </div>

        <div class="dashboard-lead-grid">
          <div class="card dashboard-priority-card">
            <div class="card-header-line">
              <div>
                <div class="spotlight-title">Today&apos;s Priority Queue</div>
                <div class="card-header-copy">Matters most likely to create deadline or coordination risk.</div>
              </div>
              <button class="btn btn-ghost btn-xs" onclick="App.navigate('cases')">Open Register</button>
            </div>
            <div class="priority-list">
              ${renderPriorityQueue(snap.urgentCases)}
            </div>
          </div>
          <div class="card dashboard-sync-card">
            <div class="card-header-line">
              <div>
                <div class="spotlight-title">Sync & Data Readiness</div>
                <div class="card-header-copy">${safeText(syncInfo.detail || 'Excel-backed data status and hygiene summary.')}</div>
              </div>
              <span class="sync-state-pill">${safeText(syncInfo.text || 'Checking backend')}</span>
            </div>
            <div class="dashboard-sync-grid">
              <div class="health-ring" style="--score:${snap.readinessScore}"><span>${snap.readinessScore}%</span></div>
              <div>
                <div class="sync-metric-row"><span>Collection coverage</span><b>${snap.recoveryRate}%</b></div>
                <div class="sync-metric-row"><span>Recovered</span><b>${fmtINR(snap.totalCollected)}</b></div>
                <div class="sync-metric-row"><span>Average active age</span><b>${snap.avgAge} days</b></div>
                <div class="sync-metric-row"><span>Hygiene items</span><b>${snap.missingOwner + snap.missingNextStep + snap.missingDates}</b></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-grid dashboard-stats-grid">
        <div class="stat-card" onclick="App.navigate('cases')">
          <div class="stat-card-top"><span class="stat-label">ACTIVE CASES</span><span class="stat-icon blue"><i class="fas fa-folder-open"></i></span></div>
          <div class="stat-value">${snap.activeCases.length}</div>
          <div class="stat-change">${snap.cases.length} total matters in register</div>
        </div>
        <div class="stat-card" onclick="App.navigate('notifications')">
          <div class="stat-card-top"><span class="stat-label">DEADLINES (7D)</span><span class="stat-icon red"><i class="fas fa-bell"></i></span></div>
          <div class="stat-value">${snap.dueIn7Days}</div>
          <div class="stat-change">Immediate filing and hearing watchlist</div>
        </div>
        <div class="stat-card" onclick="App.navigate('${clientTarget}')">
          <div class="stat-card-top"><span class="stat-label">CLIENTS</span><span class="stat-icon green"><i class="fas fa-users"></i></span></div>
          <div class="stat-value">${DB.getArr('clients').length}</div>
          <div class="stat-change">${snap.missingOwner} active cases without an owner</div>
        </div>
        <div class="stat-card" onclick="App.navigate('hearings')">
          <div class="stat-card-top"><span class="stat-label">HEARINGS</span><span class="stat-icon purple"><i class="fas fa-calendar-check"></i></span></div>
          <div class="stat-value">${snap.upcomingHearings.length}</div>
          <div class="stat-change">Upcoming entries already on the calendar</div>
        </div>
      </div>

      <div class="metric-grid-3">
        <div class="metric-panel">
          <div class="metric-panel-label">Missing ownership</div>
          <div class="metric-panel-value">${snap.missingOwner}</div>
          <div class="metric-panel-note">Cases that still need clear accountability.</div>
        </div>
        <div class="metric-panel">
          <div class="metric-panel-label">Missing next step</div>
          <div class="metric-panel-value">${snap.missingNextStep}</div>
          <div class="metric-panel-note">Cases without a pending action or next instruction.</div>
        </div>
        <div class="metric-panel">
          <div class="metric-panel-label">Missing hearing or due date</div>
          <div class="metric-panel-value">${snap.missingDates}</div>
          <div class="metric-panel-note">Portfolio items that need a date anchor for follow-through.</div>
        </div>
      </div>

      <div class="dashboard-insight-grid" style="margin-top:18px;">
        <div class="card">
          <div class="card-header-line">
            <div>
              <div class="spotlight-title">Deadline Bands</div>
              <div class="card-header-copy">Filing pressure grouped by proximity.</div>
            </div>
            <button class="btn btn-ghost btn-xs" onclick="App.navigate('notifications')">Review</button>
          </div>
          <div class="dash-band-list">${renderDeadlineBands(snap.deadlineBands)}</div>
        </div>
        <div class="card">
          <div class="card-header-line">
            <div>
              <div class="spotlight-title">Owner Workload</div>
              <div class="card-header-copy">Active matters and urgent load by employee.</div>
            </div>
            <button class="btn btn-ghost btn-xs" onclick="App.navigate('employees')">Team</button>
          </div>
          <div class="owner-list">${renderOwnerWorkload(snap.ownerLoad)}</div>
        </div>
        <div class="card">
          <div class="card-header-line">
            <div>
              <div class="spotlight-title">Stage Flow</div>
              <div class="card-header-copy">Where active matters are concentrated.</div>
            </div>
            <button class="btn btn-ghost btn-xs" onclick="App.navigate('pipeline')">Pipeline</button>
          </div>
          <div class="stage-flow-list">${renderStageFlow(snap.stageMix, snap.activeCases.length)}</div>
        </div>
      </div>

      <div class="grid-2 mb-4" style="margin-top:18px;">
        <div class="card p-0 overflow-hidden">
          <div class="p-4 border-bottom flex justify-between items-center bg-light">
            <b style="font-size: 14px;"><i class="fas fa-chart-pie mr-2"></i> Exposure by Stage</b>
            <div class="text-muted text-xs">Demand distributed across active workflow stages</div>
          </div>
          <div class="p-4" style="height: 290px;">
            <canvas id="demandChart"></canvas>
          </div>
        </div>

        <div class="card p-0 overflow-hidden">
          <div class="p-4 border-bottom flex justify-between items-center bg-light">
            <b style="font-size: 14px;"><i class="fas fa-gem mr-2"></i> Exposure Spotlight</b>
            <button class="btn btn-ghost btn-xs" onclick="App.navigate('cases')">View Register</button>
          </div>
          <div class="p-2" id="dash-high-value-list">
            ${renderExposureSpotlight(snap.topExposureCases)}
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header-line">
            <div>
              <div class="spotlight-title">Data Audit</div>
              <div class="card-header-copy">Simple portfolio hygiene checks that improve operational reliability.</div>
            </div>
            <button class="btn btn-ghost btn-xs" onclick="App.navigate('cases')">Fix From Register</button>
          </div>
          <div class="audit-list">
            ${renderAuditList(snap)}
          </div>
        </div>

        <div class="card">
          <div class="card-header-line">
            <div>
              <div class="spotlight-title">Upcoming Hearings</div>
              <div class="card-header-copy">Next listed hearings across the active portfolio.</div>
            </div>
            <button class="btn btn-ghost btn-xs" onclick="App.navigate('hearings')">Open Tracker</button>
          </div>
          <div class="tracker-list">
            ${renderHearingTracker(snap.upcomingHearings)}
          </div>
        </div>
      </div>
    `;

    setTimeout(() => initDashboardDemandChart(), 100);
  };

  App.modules.reports = function() {
    const clients = DB.getArr('clients');
    const employees = DB.getArr('employees');
    const tabs = [
      { id: 'deadlines', label: 'Deadlines', icon: 'fa-clock' },
      { id: 'aging', label: 'Aging', icon: 'fa-hourglass-half' },
      { id: 'clients', label: 'Client Exposure', icon: 'fa-building' },
      { id: 'stages', label: 'Stage Wise', icon: 'fa-columns' },
      { id: 'demand', label: 'Demand', icon: 'fa-scale-balanced' },
      { id: 'provisioning', label: 'Provisioning', icon: 'fa-chart-line' },
      { id: 'deposits', label: 'Pre-Deposit', icon: 'fa-receipt' },
      { id: 'hearings', label: 'Hearings', icon: 'fa-calendar-check' },
      { id: 'workload', label: 'Workload', icon: 'fa-user-tie' },
      { id: 'documents', label: 'Documents', icon: 'fa-folder-open' },
      { id: 'outcomes', label: 'Outcomes', icon: 'fa-flag-checkered' },
      { id: 'billing', label: 'Billing/WIP', icon: 'fa-file-invoice' },
      { id: 'mis', label: 'Client MIS', icon: 'fa-file-pdf' }
    ];

    function reportCases() {
      let cases = DB.getArr('cases').map(c => normalizeCaseRecord({ ...c }));
      const clientId = document.getElementById('report-client-filter')?.value || 'all';
      const employeeId = document.getElementById('report-employee-filter')?.value || 'all';
      const stageFilter = document.getElementById('report-stage-filter')?.value || 'all';
      const q = (document.getElementById('report-search')?.value || '').trim().toLowerCase();

      if (clientId !== 'all') {
        const cl = clients.find(x => x.id === clientId);
        cases = cases.filter(c => c.clientId === clientId || (cl && c.gstin && c.gstin === cl.gstin));
      }
      if (employeeId !== 'all') {
        cases = cases.filter(c => c.allottedTo === employeeId || c.createdBy === employeeId || resolveEmployeeName(c.allottedTo) === employeeId);
      }
      if (stageFilter !== 'all') {
        if (stageFilter === 'active') cases = cases.filter(c => !['closed', 'dropped'].includes(c.status));
        else if (stageFilter === 'completed') cases = cases.filter(c => ['closed', 'dropped'].includes(c.status));
        else cases = cases.filter(c => getCaseFilterStages(stageFilter).includes(c.status || 'new-lead'));
      }
      if (q) {
        cases = cases.filter(c => [
          c.caseNo, c.taxpayerName, c.legalName, c.tradeName, c.gstin, c.section,
          c.period, c.issue, c.authority, c.jurisdiction, c.billRef
        ].some(v => String(v || '').toLowerCase().includes(q)));
      }
      return cases;
    }

    function caseClientName(c) {
      const cl = clients.find(x => x.id === c.clientId || (x.gstin && x.gstin === c.gstin));
      return cl ? (cl.tradeName || cl.legalName || cl.name || c.taxpayerName) : (c.taxpayerName || c.legalName || 'Unlinked client');
    }

    function caseAge(c) {
      const raw = c.receiptDate || c.scnDate || c.createdAt;
      const d = raw ? new Date(raw) : null;
      if (!d || isNaN(d.getTime())) return 0;
      return Math.max(0, Math.floor((new Date() - d) / 86400000));
    }

    function dateText(value) {
      return value ? fmtDate(value) : '-';
    }

    function money(value) {
      return fmtINR(Number(value) || 0);
    }

    function caseLink(c) {
      return `<button class="btn btn-ghost btn-xs" onclick="showCaseDetail('${c.id}')">${safeText(c.caseNo || 'Open')}</button>`;
    }

    function reportStageLabel(status) {
      return getCaseStageMeta(status).label || statusLabel(status);
    }

    function paymentTotal(c, matcher) {
      return (c.payments || []).reduce((sum, p) => {
        const hay = `${p.type || ''} ${p.ref || ''}`.toLowerCase();
        if (!matcher || matcher.test(hay)) return sum + (Number(p.amt) || 0);
        return sum;
      }, 0);
    }

    function hasDocument(c, keywords) {
      const docs = Array.isArray(c.documents) ? c.documents : [];
      return docs.some(d => {
        const name = String(d.name || '').toLowerCase();
        return keywords.some(k => name.includes(k)) && (d.physical || d.soft || d.na);
      });
    }

    function missingDocs(c) {
      const required = [
        { label: 'SCN', keys: ['scn', 'show cause'] },
        { label: 'OIO', keys: ['oio', 'order in original'] },
        { label: 'Authorization', keys: ['authorization', 'authority letter', 'vakalat'] },
        { label: 'Challan / DRC-03', keys: ['challan', 'drc-03', 'pre-deposit'] },
        { label: 'Annexures', keys: ['annexure', 'annexures'] }
      ];
      const missing = required.filter(item => !hasDocument(c, item.keys)).map(item => item.label);
      const pending = (c.pendingList || []).filter(p => !p.received).map(p => p.text).filter(Boolean);
      return [...missing, ...pending];
    }

    function groupBy(items, keyFn) {
      return items.reduce((acc, item) => {
        const key = keyFn(item) || 'Unspecified';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});
    }

    function makeTable(headers, rows, emptyText) {
      if (!rows.length) return `<div class="empty-state-sm">${safeText(emptyText || 'No records found for this report.')}</div>`;
      return `
        <div class="report-table-scroll">
          <table class="data-table report-table">
            <thead><tr>${headers.map(h => `<th>${safeText(h)}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>
      `;
    }

    function stripHtml(value) {
      const div = document.createElement('div');
      div.innerHTML = String(value || '').replace(/<br\s*\/?>/gi, '\n');
      return div.textContent || div.innerText || '';
    }

    function summaryCard(label, value, note, icon, tone) {
      return `
        <div class="report-kpi-card ${tone || ''}">
          <div class="report-kpi-icon"><i class="fas ${icon || 'fa-chart-simple'}"></i></div>
          <div>
            <div class="report-kpi-label">${safeText(label)}</div>
            <div class="report-kpi-value">${value}</div>
            <div class="report-kpi-note">${safeText(note || '')}</div>
          </div>
        </div>
      `;
    }

    function buildReportShell(title, subtitle, kpis, tableHtml, rows) {
      window._activeReport = { title, rows: rows || [] };
      return `
        <div class="report-panel-head">
          <div>
            <div class="report-panel-title">${safeText(title)}</div>
            <div class="report-panel-sub">${safeText(subtitle)}</div>
          </div>
          <div class="report-panel-actions">
            <button class="btn btn-outline btn-sm" onclick="exportActiveReportCsv()"><i class="fas fa-file-csv"></i> CSV</button>
            <button class="btn btn-outline btn-sm" onclick="printActiveReport()"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>
        <div class="report-kpi-grid">${kpis.join('')}</div>
        ${tableHtml}
      `;
    }

    function deadlinesReport(cases) {
      const active = cases.filter(c => !['closed', 'dropped'].includes(c.status));
      const withDue = active.filter(c => c.dueDate).map(c => ({ c, days: daysFromNow(c.dueDate) })).filter(x => x.days !== null);
      const buckets = [
        { label: 'Overdue', items: withDue.filter(x => x.days < 0), tone: 'danger' },
        { label: 'Due today', items: withDue.filter(x => x.days === 0), tone: 'danger' },
        { label: 'Next 3 days', items: withDue.filter(x => x.days > 0 && x.days <= 3), tone: 'warning' },
        { label: 'Next 7 days', items: withDue.filter(x => x.days > 3 && x.days <= 7), tone: 'warning' },
        { label: 'Next 15 days', items: withDue.filter(x => x.days > 7 && x.days <= 15), tone: 'info' }
      ];
      const rows = withDue
        .filter(x => x.days <= 15)
        .sort((a, b) => a.days - b.days)
        .map(({ c, days }) => [
          caseLink(c),
          safeText(caseClientName(c)),
          safeText(reportStageLabel(c.status)),
          dateText(c.dueDate),
          days < 0 ? `${Math.abs(days)} day(s) overdue` : days === 0 ? 'Due today' : `${days} day(s) left`,
          safeText(resolveEmployeeName(c.allottedTo))
        ]);
      const table = makeTable(['Case', 'Client', 'Stage', 'Due date', 'Status', 'Owner'], rows, 'No deadline items found.');
      return buildReportShell(
        'Daily Deadline Report',
        'Due today, next 3/7/15 days, and overdue case-register items.',
        buckets.map(b => summaryCard(b.label, b.items.length, 'case(s)', 'fa-clock', b.tone)),
        table,
        [['Case', 'Client', 'Stage', 'Due date', 'Status', 'Owner'], ...rows]
      );
    }

    function agingReport(cases) {
      const active = cases.filter(c => !['closed', 'dropped'].includes(c.status));
      const aged = active.map(c => ({ c, age: caseAge(c) }));
      const buckets = [
        { label: '0-29 days', items: aged.filter(x => x.age < 30), tone: 'info' },
        { label: '30-59 days', items: aged.filter(x => x.age >= 30 && x.age < 60), tone: 'info' },
        { label: '60-89 days', items: aged.filter(x => x.age >= 60 && x.age < 90), tone: 'warning' },
        { label: '90-179 days', items: aged.filter(x => x.age >= 90 && x.age < 180), tone: 'warning' },
        { label: '180+ days', items: aged.filter(x => x.age >= 180), tone: 'danger' }
      ];
      const rows = aged.sort((a, b) => b.age - a.age).map(({ c, age }) => [
        caseLink(c),
        safeText(caseClientName(c)),
        safeText(reportStageLabel(c.status)),
        dateText(c.receiptDate || c.scnDate || c.createdAt),
        `${age} days`,
        money(caseExposure(c)),
        safeText(resolveEmployeeName(c.allottedTo))
      ]);
      return buildReportShell(
        'Case Aging Report',
        'Pending active cases grouped into 30/60/90/180+ day bands.',
        buckets.map(b => summaryCard(b.label, b.items.length, 'active case(s)', 'fa-hourglass-half', b.tone)),
        makeTable(['Case', 'Client', 'Stage', 'Start date', 'Age', 'Exposure', 'Owner'], rows, 'No active cases found.'),
        [['Case', 'Client', 'Stage', 'Start date', 'Age', 'Exposure', 'Owner'], ...rows]
      );
    }

    function clientExposureReport(cases) {
      const groups = Object.entries(groupBy(cases, c => caseClientName(c)));
      const rows = groups.map(([client, list]) => {
        const active = list.filter(c => !['closed', 'dropped'].includes(c.status));
        const total = list.reduce((s, c) => s + caseExposure(c), 0);
        const collected = list.reduce((s, c) => s + (c.amountCollected || 0), 0);
        const hearings = list.reduce((s, c) => s + (c.hearings || []).length, 0);
        return [safeText(client), String(list.length), String(active.length), money(total), money(collected), money(total - collected), String(hearings)];
      }).sort((a, b) => Number(stripHtml(b[3]).replace(/[^0-9.-]/g, '')) - Number(stripHtml(a[3]).replace(/[^0-9.-]/g, '')));
      const totalExposure = cases.reduce((s, c) => s + caseExposure(c), 0);
      return buildReportShell(
        'Client-Wise Litigation Exposure',
        'Client portfolio size, exposure, recovery, outstanding amount, and hearing load.',
        [
          summaryCard('Clients', groups.length, 'with linked matters', 'fa-building', 'info'),
          summaryCard('Total exposure', money(totalExposure), 'all filtered cases', 'fa-scale-balanced', 'warning'),
          summaryCard('Collected/paid', money(cases.reduce((s, c) => s + (c.amountCollected || 0), 0)), 'case register field', 'fa-circle-check', 'success')
        ],
        makeTable(['Client', 'Cases', 'Active', 'Exposure', 'Paid/Collected', 'Outstanding', 'Hearings'], rows, 'No client exposure available.'),
        [['Client', 'Cases', 'Active', 'Exposure', 'Paid/Collected', 'Outstanding', 'Hearings'], ...rows]
      );
    }

    function stageWiseReport(cases) {
      const groups = Object.entries(groupBy(cases, c => reportStageLabel(c.status)));
      const rows = groups.map(([stage, list]) => [
        safeText(stage),
        String(list.length),
        money(list.reduce((s, c) => s + caseExposure(c), 0)),
        String(list.filter(c => c.dueDate && daysFromNow(c.dueDate) < 0).length),
        String(list.filter(c => !c.allottedTo).length),
        String(list.filter(c => (c.hearings || []).some(h => h.date && daysFromNow(h.date) >= 0)).length)
      ]);
      return buildReportShell(
        'Stage-Wise Case Report',
        'SCN, reply filed, OIO, appeal, GSTAT, HC, closed, and other workflow stages.',
        [
          summaryCard('Stages', rows.length, 'represented in filters', 'fa-columns', 'info'),
          summaryCard('Active cases', cases.filter(c => !['closed', 'dropped'].includes(c.status)).length, 'not closed or dropped', 'fa-spinner', 'warning'),
          summaryCard('Closed/dropped', cases.filter(c => ['closed', 'dropped'].includes(c.status)).length, 'completed matters', 'fa-flag-checkered', 'success')
        ],
        makeTable(['Stage', 'Cases', 'Exposure', 'Overdue', 'Missing owner', 'Future hearings'], rows, 'No stage data found.'),
        [['Stage', 'Cases', 'Exposure', 'Overdue', 'Missing owner', 'Future hearings'], ...rows]
      );
    }

    function demandReport(cases) {
      const totals = cases.reduce((acc, c) => {
        acc.tax += c.demandAmount || 0;
        acc.interest += c.interestAmount || 0;
        acc.penalty += c.penaltyAmount || 0;
        acc.other += c.otherAmount || 0;
        acc.total += caseExposure(c);
        return acc;
      }, { tax: 0, interest: 0, penalty: 0, other: 0, total: 0 });
      const rows = cases.map(c => [
        caseLink(c),
        safeText(caseClientName(c)),
        money(c.demandAmount),
        money(c.interestAmount),
        money(c.penaltyAmount),
        money(c.otherAmount),
        money(caseExposure(c))
      ]);
      return buildReportShell(
        'Demand Breakup Report',
        'Tax, interest, penalty, other or late-fee amount, and total demand from the case register.',
        [
          summaryCard('Tax', money(totals.tax), 'principal demand', 'fa-indian-rupee-sign', 'info'),
          summaryCard('Interest', money(totals.interest), 'interest exposure', 'fa-percent', 'warning'),
          summaryCard('Penalty', money(totals.penalty), 'penalty exposure', 'fa-triangle-exclamation', 'danger'),
          summaryCard('Other/Late fee', money(totals.other), 'other amount field', 'fa-file-invoice', 'info'),
          summaryCard('Total', money(totals.total), 'overall demand', 'fa-scale-balanced', 'warning')
        ],
        makeTable(['Case', 'Client', 'Tax', 'Interest', 'Penalty', 'Other/Late fee', 'Total'], rows, 'No demand data found.'),
        [['Case', 'Client', 'Tax', 'Interest', 'Penalty', 'Other/Late fee', 'Total'], ...rows]
      );
    }

    function preDepositReport(cases) {
      const appealStages = ['appeal-filed', 'appeal-ph', 'oia-received'];
      const gstatStages = ['gstat-appeal-filed', 'gstat-ph', 'tribunal-order'];
      let pendingCases = 0;
      let proofMissing = 0;
      const rows = cases
        .filter(c => appealStages.includes(c.status) || gstatStages.includes(c.status) || c.preDeposit || c.gstatPreDeposit)
        .map(c => {
          const exposure = caseExposure(c);
          const required = gstatStages.includes(c.status) ? exposure * 0.2 : exposure * 0.1;
          const paid = (Number(c.preDeposit) || 0) + (Number(c.gstatPreDeposit) || 0) + paymentTotal(c, /pre|deposit|drc|challan/);
          const pending = Math.max(0, required - paid);
          const proof = hasDocument(c, ['challan', 'drc-03', 'pre-deposit']) || paymentTotal(c, /drc|challan/) > 0 ? 'Yes' : 'No';
          if (pending > 0) pendingCases++;
          if (proof === 'No') proofMissing++;
          return [caseLink(c), safeText(caseClientName(c)), safeText(reportStageLabel(c.status)), money(required), money(paid), money(pending), proof];
        });
      return buildReportShell(
        'Pre-Deposit Report',
        'Required, paid, pending, and proof status for appellate matters.',
        [
          summaryCard('Appeal matters', rows.length, 'with deposit relevance', 'fa-scale-balanced', 'info'),
          summaryCard('Pending deposit', pendingCases, 'case(s)', 'fa-receipt', pendingCases ? 'warning' : 'success'),
          summaryCard('Proof missing', proofMissing, 'case(s)', 'fa-file-circle-exclamation', 'danger')
        ],
        makeTable(['Case', 'Client', 'Stage', 'Required', 'Paid', 'Pending', 'Proof uploaded'], rows, 'No pre-deposit matters found.'),
        [['Case', 'Client', 'Stage', 'Required', 'Paid', 'Pending', 'Proof uploaded'], ...rows]
      );
    }

    function provisioningReport(cases) {
      const profiles = cases
        .filter(c => !['closed', 'dropped'].includes(c.status))
        .map(c => ({ c, profile: getLitigationControlProfile(c) }));
      const probable = profiles.filter(item => item.profile.classification === 'Probable exposure');
      const possible = profiles.filter(item => item.profile.classification === 'Possible exposure');
      const suggestedProvision = profiles.reduce((sum, item) => sum + item.profile.provisionAmount, 0);
      const rows = profiles
        .sort((a, b) => b.profile.score - a.profile.score || b.profile.outstanding - a.profile.outstanding)
        .map(({ c, profile }) => [
          caseLink(c),
          safeText(caseClientName(c)),
          safeText(reportStageLabel(c.status)),
          safeText(profile.risk.label),
          String(profile.score),
          safeText(profile.classification),
          money(profile.outstanding),
          money(profile.provisionAmount),
          safeText(profile.nextAction)
        ]);
      return buildReportShell(
        'Contingent Liability / Provisioning Report',
        'Risk-weighted outstanding exposure, suggested provision, and management action for open matters.',
        [
          summaryCard('Probable', probable.length, 'case(s)', 'fa-triangle-exclamation', probable.length ? 'danger' : 'success'),
          summaryCard('Possible', possible.length, 'case(s)', 'fa-eye', possible.length ? 'warning' : 'success'),
          summaryCard('Suggested provision', money(suggestedProvision), 'risk-weighted estimate', 'fa-chart-line', 'warning')
        ],
        makeTable(['Case', 'Client', 'Stage', 'Risk', 'Score', 'Classification', 'Outstanding', 'Suggested provision', 'Next action'], rows, 'No open provisioning exposure found.'),
        [['Case', 'Client', 'Stage', 'Risk', 'Score', 'Classification', 'Outstanding', 'Suggested provision', 'Next action'], ...rows]
      );
    }

    function hearingReport(cases) {
      const rows = cases.flatMap(c => {
        const logged = (c.hearings || []).map(h => ({
          date: h.date || c.phDate || c.hearingDate,
          status: h.status || 'Scheduled',
          authority: h.authority || c.authority || c.jurisdiction || '-',
          attended: h.attended || c.allottedTo || '',
          c
        }));
        if (!logged.length && (c.phDate || c.hearingDate || c.adjPhDate)) {
          logged.push({ date: c.phDate || c.hearingDate || c.adjPhDate, status: 'Scheduled', authority: c.authority || c.jurisdiction || '-', attended: c.allottedTo || '', c });
        }
        return logged;
      }).sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0)).map(h => [
        dateText(h.date),
        caseLink(h.c),
        safeText(caseClientName(h.c)),
        safeText(resolveEmployeeName(h.attended)),
        safeText(h.authority),
        safeText(h.status)
      ]);
      const future = rows.filter(r => {
        const d = new Date(stripHtml(r[0]));
        return !isNaN(d.getTime()) && d >= new Date();
      }).length;
      return buildReportShell(
        'Hearing Calendar Report',
        'Hearing calendar by employee, client, and authority.',
        [
          summaryCard('Hearings', rows.length, 'logged entries', 'fa-calendar-check', 'info'),
          summaryCard('Authorities', new Set(rows.map(r => stripHtml(r[4]))).size, 'unique authority names', 'fa-building-columns', 'warning'),
          summaryCard('Owners', new Set(rows.map(r => stripHtml(r[3]))).size, 'appearing in diary', 'fa-user-tie', 'info')
        ],
        makeTable(['Date', 'Case', 'Client', 'Employee', 'Authority', 'Status'], rows, 'No hearings found.'),
        [['Date', 'Case', 'Client', 'Employee', 'Authority', 'Status'], ...rows]
      );
    }

    function workloadReport(cases) {
      const active = cases.filter(c => !['closed', 'dropped'].includes(c.status));
      const staff = employees.filter(e => e.status !== 'Inactive');
      const rows = [...staff.map(e => {
        const owned = active.filter(c => c.allottedTo === e.id || c.allottedTo === e.name || c.createdBy === e.id);
        const overdue = owned.filter(c => c.dueDate && daysFromNow(c.dueDate) < 0);
        const hearings = owned.reduce((sum, c) => sum + (c.hearings || []).filter(h => h.date && daysFromNow(h.date) >= 0).length, 0);
        const drafting = owned.filter(c => !c.whatIsToBeDone || ['new-lead', 'scn-received', 'oio-received'].includes(c.status)).length;
        return [safeText(e.name), safeText(e.role || '-'), String(owned.length), String(overdue.length), String(hearings), String(drafting), money(owned.reduce((s, c) => s + caseExposure(c), 0))];
      }), [
        'Unassigned',
        '-',
        String(active.filter(c => !c.allottedTo).length),
        String(active.filter(c => !c.allottedTo && c.dueDate && daysFromNow(c.dueDate) < 0).length),
        String(active.filter(c => !c.allottedTo).reduce((sum, c) => sum + (c.hearings || []).length, 0)),
        String(active.filter(c => !c.allottedTo && (!c.whatIsToBeDone || ['new-lead', 'scn-received', 'oio-received'].includes(c.status))).length),
        money(active.filter(c => !c.allottedTo).reduce((s, c) => s + caseExposure(c), 0))
      ]];
      return buildReportShell(
        'Employee Workload Report',
        'Cases allotted, overdue tasks, hearings, drafting pending, and exposure by employee.',
        [
          summaryCard('Active cases', active.length, 'in filtered view', 'fa-folder-open', 'info'),
          summaryCard('Unassigned', active.filter(c => !c.allottedTo).length, 'need owner', 'fa-user-slash', 'warning'),
          summaryCard('Overdue', active.filter(c => c.dueDate && daysFromNow(c.dueDate) < 0).length, 'task/date breaches', 'fa-triangle-exclamation', 'danger')
        ],
        makeTable(['Employee', 'Role', 'Cases', 'Overdue', 'Hearings', 'Drafting pending', 'Exposure'], rows, 'No employee workload found.'),
        [['Employee', 'Role', 'Cases', 'Overdue', 'Hearings', 'Drafting pending', 'Exposure'], ...rows]
      );
    }

    function documentReport(cases) {
      const rows = cases.map(c => {
        const missing = missingDocs(c);
        return [caseLink(c), safeText(caseClientName(c)), safeText(reportStageLabel(c.status)), String(missing.length), safeText(missing.join(', ') || 'Complete')];
      }).filter(r => r[3] !== '0');
      return buildReportShell(
        'Document Pending Report',
        'Missing SCN, OIO, authorization, challan, annexures, and pending case-register items.',
        [
          summaryCard('Cases checked', cases.length, 'filtered matters', 'fa-folder-open', 'info'),
          summaryCard('Cases pending', rows.length, 'with missing documents/items', 'fa-file-circle-exclamation', rows.length ? 'warning' : 'success'),
          summaryCard('Pending items', rows.reduce((s, r) => s + Number(r[3]), 0), 'total missing points', 'fa-list-check', 'danger')
        ],
        makeTable(['Case', 'Client', 'Stage', 'Pending count', 'Missing / pending items'], rows, 'No document gaps found.'),
        [['Case', 'Client', 'Stage', 'Pending count', 'Missing / pending items'], ...rows]
      );
    }

    function outcomeType(c) {
      const text = `${c.status || ''} ${c.closureOutcome || ''} ${c.closureReason || ''}`.toLowerCase();
      if (/refund.*allow|refund.*sanction|allowed refund/.test(text)) return 'Refund allowed';
      if (/refund.*reject|rejected refund/.test(text)) return 'Refund rejected';
      if (/drop|set aside|allowed|quash|deleted|nil demand/.test(text)) return 'Demand dropped';
      if (/partly|partial|reduced|modify/.test(text)) return 'Demand reduced';
      if (/confirm|upheld|sustained/.test(text)) return 'Confirmed';
      if (c.status === 'dropped') return 'Demand dropped';
      return c.status === 'closed' ? 'Closed - other' : 'Open';
    }

    function outcomeReport(cases) {
      const closed = cases.filter(c => ['closed', 'dropped'].includes(c.status) || c.closureOutcome);
      const groups = Object.entries(groupBy(closed, outcomeType));
      const rows = closed.map(c => [
        caseLink(c),
        safeText(caseClientName(c)),
        safeText(outcomeType(c)),
        dateText(c.closureDate),
        money(caseExposure(c)),
        money(c.amountCollected),
        safeText(c.closureOutcome || c.closureReason || '-')
      ]);
      return buildReportShell(
        'Success / Outcome Report',
        'Demand dropped, demand reduced, confirmed, refund allowed/rejected, and closure notes.',
        groups.map(([label, list]) => summaryCard(label, list.length, 'case(s)', 'fa-flag-checkered', label.includes('dropped') || label.includes('allowed') ? 'success' : label.includes('Confirmed') || label.includes('rejected') ? 'danger' : 'info')),
        makeTable(['Case', 'Client', 'Outcome', 'Closure date', 'Demand', 'Collected/Paid', 'Notes'], rows, 'No closed outcome data found.'),
        [['Case', 'Client', 'Outcome', 'Closure date', 'Demand', 'Collected/Paid', 'Notes'], ...rows]
      );
    }

    function billingReport(cases) {
      const billed = cases.filter(c => c.billRef);
      const unbilled = cases.filter(c => !c.billRef && !['closed', 'dropped'].includes(c.status));
      const rows = cases.map(c => {
        const exposure = caseExposure(c);
        const collected = c.amountCollected || paymentTotal(c);
        return [
          caseLink(c),
          safeText(caseClientName(c)),
          safeText(reportStageLabel(c.status)),
          safeText(c.billRef || 'Unbilled'),
          dateText(c.receiptDate),
          money(exposure),
          money(collected),
          money(Math.max(0, exposure - collected))
        ];
      });
      return buildReportShell(
        'Billing / WIP Report',
        'Unbilled matters, billed matters, collected amount, and outstanding exposure from the case register.',
        [
          summaryCard('Unbilled active', unbilled.length, 'matters without bill reference', 'fa-file-circle-exclamation', 'warning'),
          summaryCard('Billed', billed.length, 'matters with bill reference', 'fa-file-invoice', 'info'),
          summaryCard('Collected/Paid', money(cases.reduce((s, c) => s + (c.amountCollected || paymentTotal(c)), 0)), 'from case/payment fields', 'fa-circle-check', 'success')
        ],
        makeTable(['Case', 'Client', 'Stage', 'Bill ref', 'Receipt date', 'Exposure', 'Collected/Paid', 'Outstanding'], rows, 'No billing data found.'),
        [['Case', 'Client', 'Stage', 'Bill ref', 'Receipt date', 'Exposure', 'Collected/Paid', 'Outstanding'], ...rows]
      );
    }

    function clientMISReport(cases) {
      const month = document.getElementById('report-month')?.value || new Date().toISOString().slice(0, 7);
      const rows = clients.map(cl => {
        const linked = cases.filter(c => c.clientId === cl.id || (cl.gstin && c.gstin === cl.gstin));
        const exposure = linked.reduce((s, c) => s + caseExposure(c), 0);
        const due = linked.filter(c => c.dueDate && String(c.dueDate).slice(0, 7) === month).length;
        const hearings = linked.reduce((sum, c) => sum + (c.hearings || []).filter(h => h.date && String(h.date).slice(0, 7) === month).length, 0);
        return [
          safeText(cl.tradeName || cl.legalName || cl.name),
          String(linked.length),
          String(linked.filter(c => !['closed', 'dropped'].includes(c.status)).length),
          money(exposure),
          String(due),
          String(hearings),
          `<button class="btn btn-primary btn-xs" onclick="printClientMIS('${cl.id}')"><i class="fas fa-print"></i> MIS PDF</button>`
        ];
      }).filter(r => r[1] !== '0');
      return buildReportShell(
        'Client MIS PDF',
        'One-click monthly MIS for each client. Use Print and choose Save as PDF.',
        [
          summaryCard('MIS month', safeText(month), 'selected reporting period', 'fa-calendar', 'info'),
          summaryCard('Clients covered', rows.length, 'with linked cases', 'fa-building', 'info'),
          summaryCard('Case records', cases.length, 'available after filters', 'fa-folder-open', 'warning')
        ],
        makeTable(['Client', 'Cases', 'Active', 'Exposure', 'Due this month', 'Hearings this month', 'Action'], rows, 'No client MIS data found.'),
        [['Client', 'Cases', 'Active', 'Exposure', 'Due this month', 'Hearings this month'], ...rows.map(r => r.slice(0, 6))]
      );
    }

    const reportBuilders = {
      deadlines: deadlinesReport,
      aging: agingReport,
      clients: clientExposureReport,
      stages: stageWiseReport,
      demand: demandReport,
      provisioning: provisioningReport,
      deposits: preDepositReport,
      hearings: hearingReport,
      workload: workloadReport,
      documents: documentReport,
      outcomes: outcomeReport,
      billing: billingReport,
      mis: clientMISReport
    };

    function renderTab(tabId) {
      const activeTab = tabs.some(t => t.id === tabId) ? tabId : 'deadlines';
      window._activeReportTab = activeTab;
      document.querySelectorAll('#reports-tabs .tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.reportTab === activeTab));
      const target = document.getElementById('report-output');
      if (!target) return;
      const cases = reportCases();
      target.innerHTML = reportBuilders[activeTab](cases);
    }

    const nowMonth = new Date().toISOString().slice(0, 7);
    document.getElementById('app-content').innerHTML = `
      <div class="page-header">
        <div class="page-header-row">
          <div>
            <div class="page-title">Reports</div>
            <div class="page-subtitle">Case-register reports for GST litigation monitoring, partner review, and client MIS.</div>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-outline" onclick="App.refreshDataNow()"><i class="fas fa-sync-alt"></i> Sync Data</button>
            <button class="btn btn-primary" onclick="App.navigate('cases')"><i class="fas fa-folder-open"></i> Case Register</button>
          </div>
        </div>
      </div>

      <div class="reports-shell">
        <div class="card report-filter-card">
          <div class="report-filter-grid">
            <div class="form-group">
              <label class="form-label">Client</label>
              <select class="form-select" id="report-client-filter" onchange="refreshActiveReport()">
                <option value="all">All clients</option>
                ${clients.map(cl => `<option value="${cl.id}">${safeText(cl.tradeName || cl.legalName || cl.name || cl.gstin)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Employee</label>
              <select class="form-select" id="report-employee-filter" onchange="refreshActiveReport()">
                <option value="all">All employees</option>
                ${employees.map(e => `<option value="${e.id}">${safeText(e.name)} (${safeText(e.role || 'Staff')})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Stage</label>
              <select class="form-select" id="report-stage-filter" onchange="refreshActiveReport()">
                <option value="all">All stages</option>
                <option value="active">Active only</option>
                <option value="completed">Closed / dropped</option>
                ${CASE_STAGE_GROUPS.map(g => `<option value="${g.id}">${safeText(g.label)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">MIS month</label>
              <input class="form-input" id="report-month" type="month" value="${nowMonth}" onchange="refreshActiveReport()">
            </div>
            <div class="form-group report-search-group">
              <label class="form-label">Search</label>
              <input class="form-input" id="report-search" placeholder="Case, GSTIN, issue, authority..." oninput="refreshActiveReport()">
            </div>
          </div>
        </div>

        <div class="card p-0 overflow-hidden">
          <div class="tabs report-tabs" id="reports-tabs">
            ${tabs.map(tab => `<button class="tab-btn ${tab.id === 'deadlines' ? 'active' : ''}" data-report-tab="${tab.id}" onclick="showReportTab('${tab.id}')"><i class="fas ${tab.icon}"></i> ${tab.label}</button>`).join('')}
          </div>
          <div id="report-output" class="report-output"></div>
        </div>
      </div>
    `;

    window.showReportTab = renderTab;
    window.refreshActiveReport = function() { renderTab(window._activeReportTab || 'deadlines'); };
    window.exportActiveReportCsv = function() {
      const report = window._activeReport;
      if (!report || !report.rows || report.rows.length === 0) return toast('No report rows to export', 'warning');
      const csv = report.rows.map(row => row.map(cell => `"${stripHtml(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };
    window.printActiveReport = function() {
      const report = window._activeReport || { title: 'Report' };
      const content = document.getElementById('report-output')?.innerHTML || '';
      const w = window.open('', '_blank');
      w.document.write(`<!doctype html><html><head><title>${safeText(report.title)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111827}h1{font-size:22px;margin:0 0 8px}.report-panel-actions,.btn{display:none!important}.report-kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0}.report-kpi-card,.card{border:1px solid #ddd;padding:12px;border-radius:6px}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #ddd;padding:6px;text-align:left}th{background:#f3f4f6}.tabs{display:none}</style></head><body><h1>${safeText(report.title)}</h1>${content}</body></html>`);
      w.document.close();
      w.focus();
      w.print();
    };
    window.printClientMIS = function(clientId) {
      const cl = clients.find(c => c.id === clientId);
      if (!cl) return toast('Client not found', 'error');
      const month = document.getElementById('report-month')?.value || new Date().toISOString().slice(0, 7);
      const linked = reportCases().filter(c => c.clientId === cl.id || (cl.gstin && c.gstin === cl.gstin));
      const exposure = linked.reduce((s, c) => s + caseExposure(c), 0);
      const collected = linked.reduce((s, c) => s + (c.amountCollected || 0), 0);
      const dueRows = linked.filter(c => c.dueDate && String(c.dueDate).slice(0, 7) === month);
      const hearingRows = linked.flatMap(c => (c.hearings || []).filter(h => h.date && String(h.date).slice(0, 7) === month).map(h => ({ c, h })));
      const caseRows = linked.map(c => `<tr><td>${safeText(c.caseNo)}</td><td>${safeText(reportStageLabel(c.status))}</td><td>${money(caseExposure(c))}</td><td>${dateText(c.dueDate)}</td><td>${safeText(resolveEmployeeName(c.allottedTo))}</td></tr>`).join('');
      const w = window.open('', '_blank');
      w.document.write(`<!doctype html><html><head><title>Client MIS</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#111827}h1{margin:0;font-size:24px}h2{font-size:15px;margin-top:22px;border-bottom:1px solid #ddd;padding-bottom:6px}.muted{color:#6b7280}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}.kpi{border:1px solid #ddd;border-radius:6px;padding:12px}.kpi b{display:block;font-size:18px;margin-top:6px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ddd;padding:7px;text-align:left}th{background:#f3f4f6}@media print{button{display:none}}</style></head><body><h1>${safeText(cl.tradeName || cl.legalName || cl.name)}</h1><div class="muted">GST Litigation MIS for ${safeText(month)} | GSTIN: ${safeText(cl.gstin || '-')}</div><div class="kpis"><div class="kpi">Total cases<b>${linked.length}</b></div><div class="kpi">Active<b>${linked.filter(c => !['closed', 'dropped'].includes(c.status)).length}</b></div><div class="kpi">Exposure<b>${money(exposure)}</b></div><div class="kpi">Collected/Paid<b>${money(collected)}</b></div></div><h2>Open Case Position</h2><table><thead><tr><th>Case</th><th>Stage</th><th>Exposure</th><th>Due date</th><th>Owner</th></tr></thead><tbody>${caseRows || '<tr><td colspan="5">No cases found.</td></tr>'}</tbody></table><h2>Deadlines This Month</h2><table><thead><tr><th>Case</th><th>Due date</th><th>Stage</th></tr></thead><tbody>${dueRows.map(c => `<tr><td>${safeText(c.caseNo)}</td><td>${dateText(c.dueDate)}</td><td>${safeText(reportStageLabel(c.status))}</td></tr>`).join('') || '<tr><td colspan="3">No deadlines this month.</td></tr>'}</tbody></table><h2>Hearings This Month</h2><table><thead><tr><th>Date</th><th>Case</th><th>Authority</th><th>Status</th></tr></thead><tbody>${hearingRows.map(x => `<tr><td>${dateText(x.h.date)}</td><td>${safeText(x.c.caseNo)}</td><td>${safeText(x.h.authority || x.c.authority || x.c.jurisdiction || '-')}</td><td>${safeText(x.h.status || 'Scheduled')}</td></tr>`).join('') || '<tr><td colspan="4">No hearings this month.</td></tr>'}</tbody></table></body></html>`);
      w.document.close();
      w.focus();
      w.print();
    };

    renderTab('deadlines');
  };
})();

if (window._polishedDashboard) {
  App.modules.dashboard = window._polishedDashboard;
}
