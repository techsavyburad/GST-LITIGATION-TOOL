// ============================================================
// GST LITIGATION PRO — server.js
// Express server with Excel (XLSX) backend
// ============================================================

const express = require('express');
const cors = require('cors');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const os = require('os');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number.parseInt(process.env.PORT || '8058', 10);
if (Number.isNaN(PORT)) {
  throw new Error('PORT must be a number, for example 8058');
}
const DEFAULT_JWT_SECRET = 'gst-litigation-local-access-secret';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
const TOKEN_TTL = '12h';
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 5 * 60 * 1000;
const ALLOW_PUBLIC_ACCESS = String(process.env.ALLOW_PUBLIC_ACCESS || '').toLowerCase() === 'true';
const ALLOWED_ORIGINS = String(process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT || '25mb';
const parsedMaxExcelBackups = Number.parseInt(process.env.MAX_EXCEL_BACKUPS || '20', 10);
const MAX_EXCEL_BACKUPS = Number.isFinite(parsedMaxExcelBackups) && parsedMaxExcelBackups >= 1
  ? parsedMaxExcelBackups
  : 20;

if (ALLOW_PUBLIC_ACCESS && JWT_SECRET === DEFAULT_JWT_SECRET) {
  throw new Error('Set a strong JWT_SECRET before enabling ALLOW_PUBLIC_ACCESS=true.');
}

if (ALLOW_PUBLIC_ACCESS && ALLOWED_ORIGINS.length === 0) {
  throw new Error('Set ALLOWED_ORIGINS before enabling ALLOW_PUBLIC_ACCESS=true.');
}

// Excel file path — stored right next to the app
const EXCEL_FILE = path.join(__dirname, 'case_master_data.xlsx');
const BACKUP_DIR = path.join(__dirname, 'backups');

// ─── MIDDLEWARE ───────────────────────────────────────────────
app.disable('x-powered-by');

function normalizeRemoteAddress(address) {
  return String(address || '')
    .replace(/^::ffff:/, '')
    .replace(/^::1$/, '127.0.0.1')
    .trim();
}

function isOfficeNetworkAddress(address) {
  const ip = normalizeRemoteAddress(address);
  if (!ip) return false;
  if (ip === '127.0.0.1' || ip === 'localhost') return true;

  const v4 = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const octets = v4.slice(1).map(Number);
    if (octets.some(n => n < 0 || n > 255)) return false;
    const [a, b] = octets;
    return a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      (a === 100 && b >= 64 && b <= 127);
  }

  const lower = ip.toLowerCase();
  return lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80:');
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    const parsed = new URL(origin);
    const host = parsed.hostname;
    return host === 'localhost' ||
      isOfficeNetworkAddress(host) ||
      /^[a-z0-9-]+$/i.test(host);
  } catch (err) {
    return false;
  }
}

const corsOptions = {
  origin(origin, callback) {
    callback(null, isAllowedOrigin(origin));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600
};

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "img-src 'self' data: blob:",
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:",
      "style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com 'unsafe-inline'",
      "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'",
      "connect-src 'self'"
    ].join('; ')
  );
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
}

app.use(securityHeaders);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: JSON_BODY_LIMIT }));

function officeNetworkOnly(req, res, next) {
  if (ALLOW_PUBLIC_ACCESS) return next();
  const remoteAddress = req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress;
  if (isOfficeNetworkAddress(remoteAddress)) return next();

  if (req.path.startsWith('/api/')) {
    return res.status(403).json({ error: 'This GST Litigation server is restricted to the office network.' });
  }
  return res.status(403).send('This GST Litigation server is restricted to the office network.');
}

app.use(officeNetworkOnly);


function setFreshAssetHeaders(res, filePath) {
  if (/\.(?:html|css|js|json)$/i.test(filePath)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}

// Serve static files (HTML, CSS, JS, etc.) from current directory
app.use(express.static(__dirname, {
  index: 'index.html',
  extensions: ['html'],
  etag: false,
  lastModified: false,
  setHeaders: setFreshAssetHeaders
}));

app.get(['/CompanyLogin.aspx', '/CompanyLogin', '/login'], (req, res) => {
  setFreshAssetHeaders(res, 'index.html');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ─── EXCEL HELPERS ───────────────────────────────────────────

// Column definitions for each sheet
const CASE_COLUMNS = [
  'id', 'caseNo', 'taxpayerName', 'legalName', 'tradeName', 'gstin',
  'clientId', 'clientAddress', 'allottedTo', 'createdBy', 'createdByName', 'itn', 'contactName', 'mobile',
  'email', 'reference', 'arn', 'din', 'assignmentType', 'assignmentTypeLabel',
  'documentType', 'section', 'caseOrigin', 'period', 'status', 'priority',
  'demandAmount', 'penaltyAmount', 'interestAmount', 'otherAmount', 'totalAmount', 'amountCollected',
  'issue', 'scnDate', 'scnCommDate', 'oioDate', 'oioCommDate', 'oiaDate',
  'oiaCommDate', 'dueDate', 'onlineFilingDate', 'physicalSubmitDate',
  'phDate', 'phNoticeRef', 'apl01Ref', 'preDeposit', 'oiaOrderCommDate', 'oiaRef',
  'appealPhDate', 'appealPhRef',
  'gstatPreDeposit', 'gstatOrderDate', 'gstatOrderCommDate', 'gstatOrderRef',
  'gstatPhDate', 'gstatPhRef',
  'gstatAppealDate', 'gstatArn', 'hcPetitionDate', 'hcRef', 'hcOrderDate', 
  'scPetitionDate', 'scRef', 'scOrderDate',
  'closureDate', 'closureAuthority', 'closureOutcome', 'closureReason',
  'billRef', 'receiptDate', 'commitDate', 'jurisdiction', 'authority',
  'notes', 'whatIsDone', 'whatIsToBeDone', 'minuteDetails', 'createdAt', 'updatedAt',
  'checklist', 'grounds', 'documents', 'facts', 'updateNotes',
  'pendingList', 'payments', 'hearings', 'yearWiseData',
  'sequenceList', 'factsSequenceList', 'sequence',
  'adjPhDate', 'adjPhRef', 'hearingDate', 'apl01Date'
];

const CLIENT_COLUMNS = [
  'id', 'name', 'legalName', 'tradeName', 'groupName', 'reference', 'gstin', 'pan', 'state',
  'gstLoginId', 'portalPassword', 'constitution', 'contactName', 'mobile', 'email', 'address',
  'createdAt', 'updatedAt'
];

const EMPLOYEE_COLUMNS = [
  'id', 'name', 'role', 'email', 'mobile', 'status',
  'username', 'passwordHash', 'accessLevel', 'canLogin',
  'createdAt', 'updatedAt'
];

const SETTINGS_COLUMNS = ['key', 'value'];
const AUDIT_COLUMNS = [
  'id', 'timestamp', 'actorId', 'actorName', 'actorRole',
  'action', 'entityType', 'entityId', 'entityLabel',
  'ipAddress', 'userAgent', 'details'
];

// JSON fields that should be serialized/deserialized
const CASE_JSON_FIELDS = [
  'checklist', 'grounds', 'documents', 'facts', 'updateNotes',
  'pendingList', 'payments', 'hearings', 'yearWiseData',
  'sequenceList', 'factsSequenceList'
];

// Number fields that should be parsed as numbers
const CASE_NUMBER_FIELDS = [
  'demandAmount', 'penaltyAmount', 'interestAmount', 'otherAmount', 'totalAmount', 'amountCollected',
  'preDeposit', 'gstatPreDeposit'
];

// Date fields that should be parsed as dates
const CASE_DATE_FIELDS = [
  'scnDate', 'scnCommDate', 'oioDate', 'oioCommDate', 'oiaDate',
  'oiaCommDate', 'dueDate', 'onlineFilingDate', 'physicalSubmitDate',
  'phDate', 'oiaOrderCommDate', 'appealPhDate',
  'gstatOrderDate', 'gstatOrderCommDate', 'gstatPhDate',
  'gstatAppealDate', 'hcPetitionDate', 'hcOrderDate', 
  'scPetitionDate', 'scOrderDate', 'closureDate', 'receiptDate', 'commitDate',
  'createdAt', 'updatedAt', 'adjPhDate', 'hearingDate', 'apl01Date'
];

// --- Header Mapping for Human-Readable Excel ---
const HEADER_MAP = {};

function initHeaderMaps() {
  const allColumns = new Set([...CASE_COLUMNS, ...CLIENT_COLUMNS, ...EMPLOYEE_COLUMNS, ...AUDIT_COLUMNS]);
  allColumns.forEach(col => {
    let human = col
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, function(str){ return str.toUpperCase(); })
      .replace('Gstin', 'GSTIN')
      .replace('Id', 'ID')
      .replace('Scn', 'SCN')
      .replace('Oio', 'OIO')
      .replace('Oia', 'OIA')
      .replace('Ph ', 'PH ')
      .replace('Arn', 'ARN')
      .replace('Din', 'DIN')
      .replace('Gstat', 'GSTAT')
      .replace('Hc ', 'HC ')
      .replace('Sc ', 'SC ')
      .replace('Itn', 'ITN')
      .replace('Pan', 'PAN');
    HEADER_MAP[col] = human;
  });
}
initHeaderMaps();

const HUMAN_TO_LOGICAL_HEADER = {};
Object.keys(HEADER_MAP).forEach(key => {
  HUMAN_TO_LOGICAL_HEADER[HEADER_MAP[key]] = key;
});

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

function toHumanHeader(key) {
  if (HEADER_MAP[key]) return HEADER_MAP[key];
  if (/\s/.test(key)) return key;
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace('Gstin', 'GSTIN')
    .replace('Id', 'ID')
    .replace('Scn', 'SCN')
    .replace('Oio', 'OIO')
    .replace('Oia', 'OIA')
    .replace('Arn', 'ARN')
    .replace('Din', 'DIN')
    .replace('Gstat', 'GSTAT')
    .replace('Itn', 'ITN')
    .replace('Pan', 'PAN');
}

function toLogicalColumn(header) {
  return HUMAN_TO_LOGICAL_HEADER[header] || header;
}

function orderedUnique(values) {
  const seen = new Set();
  return values.filter(value => {
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function getExistingHeaders(wb, sheetName) {
  const sheet = wb && wb.Sheets && wb.Sheets[sheetName];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  return Array.isArray(rows[0]) ? rows[0].filter(Boolean).map(String) : [];
}

function serializeCellValue(field, value) {
  if (CASE_JSON_FIELDS.includes(field)) {
    return value !== undefined && value !== null ? JSON.stringify(value) : '[]';
  }
  if (CASE_DATE_FIELDS.includes(field) && value) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d;
  }
  if (CASE_NUMBER_FIELDS.includes(field)) {
    return Number(value) || 0;
  }
  if (field === 'status' && value) {
    return String(value).replace(/-/g, ' ').toUpperCase();
  }
  if (field === 'priority' && value) {
    return String(value).toUpperCase();
  }
  if (Array.isArray(value) || isPlainObject(value)) {
    return JSON.stringify(value);
  }
  return value !== undefined && value !== null ? value : '';
}

function serializeEntity(entity, columns) {
  const row = {};
  columns.forEach(col => {
    row[toHumanHeader(col)] = serializeCellValue(col, entity && entity[col]);
  });

  Object.keys(entity || {}).forEach(key => {
    if (columns.includes(key)) return;
    row[toHumanHeader(key)] = serializeCellValue(key, entity[key]);
  });

  return row;
}

/**
 * Read the Excel workbook. Returns null if file doesn't exist.
 */
function readWorkbook() {
  if (!fs.existsSync(EXCEL_FILE)) return null;
  try {
    return XLSX.readFile(EXCEL_FILE, { type: 'file', cellDates: true });
  } catch (err) {
    console.error('[Excel] Read error:', err.message);
    throw new Error('Could not read Excel backend. Close the workbook if it is open and try again.');
  }
}

/**
 * Simple async queue to prevent concurrent Excel writes.
 */
let isWriting = false;
const writeQueue = [];

async function acquireWriteLock() {
  if (!isWriting) {
    isWriting = true;
    return;
  }
  return new Promise(resolve => {
    writeQueue.push(resolve);
  });
}

function releaseWriteLock() {
  if (writeQueue.length > 0) {
    const next = writeQueue.shift();
    next();
  } else {
    isWriting = false;
  }
}

/**
 * Async delay helper.
 */
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Helper to write workbook to file asynchronously.
 */
async function writeWorkbook(wb, retries = 5, lockAlreadyHeld = false) {
  if (!lockAlreadyHeld) await acquireWriteLock();
  try {
    for (let i = 0; i < retries; i++) {
      const tmpFile = `${EXCEL_FILE}.${process.pid}.${Date.now()}.tmp.xlsx`;
      try {
        XLSX.writeFile(wb, tmpFile, { cellDates: true });
        fs.renameSync(tmpFile, EXCEL_FILE);
        return true;
      } catch (err) {
        try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch (cleanupErr) { /* ignore temp cleanup errors */ }
        if (err.code === 'EBUSY' || err.message.includes('EBUSY')) {
          console.warn(`[Excel] File is busy. Retrying write... (${i + 1}/${retries})`);
          await delay(1000);
        } else {
          throw err;
        }
      }
    }
    throw new Error('Failed to write Excel file after multiple retries. Please ensure the file is closed.');
  } finally {
    if (!lockAlreadyHeld) releaseWriteLock();
  }
}

/**
 * Read a sheet as array of objects.
 */
function readSheet(sheetName) {
  const wb = readWorkbook();
  if (!wb || !wb.Sheets[sheetName]) return [];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return rows;
}

/**
 * Write array of objects to a specific sheet asynchronously, preserving other sheets.
 */
async function writeSheet(sheetName, data, columns) {
  await acquireWriteLock();
  try {
  let wb = readWorkbook();
  if (!wb) {
    wb = XLSX.utils.book_new();
  }

  // Map to human-readable columns and keep every extra collected/user-added field.
  const humanColumns = orderedUnique([
    ...columns.map(toHumanHeader),
    ...getExistingHeaders(wb, sheetName),
    ...data.flatMap(row => Object.keys(row || {}))
  ]);

  // Create worksheet from data with specified column order
  const ws = XLSX.utils.json_to_sheet(data, { header: humanColumns, cellDates: true });

  // Improve column widths based on logical names
  if (!ws['!cols']) ws['!cols'] = [];
  humanColumns.forEach((col, i) => {
    let width = Math.max(col.length + 2, 15);
    const lowerCol = col.toLowerCase();
    if (lowerCol.includes('name')) width = 30;
    if (lowerCol.includes('notes') || lowerCol.includes('issue') || lowerCol.includes('address') || lowerCol.includes('detail')) width = 50;
    if (lowerCol.includes('amount') || lowerCol.includes('deposit')) width = 18;
    if (col === 'ID' || col === 'Client ID' || col === 'PAN' || col === 'GSTIN') width = 16;
    if (lowerCol.includes('date')) width = 14;
    ws['!cols'][i] = { wch: width };
  });

  // Apply visual formatting for Numbers (INR) and Dates
  if (ws['!ref']) {
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r + 1; R <= range.e.r; ++R) { // skip header
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({r: R, c: C});
        const cell = ws[cellAddress];
        if (!cell) continue;
        const colName = toLogicalColumn(humanColumns[C]);
        if (CASE_NUMBER_FIELDS.includes(colName)) {
          cell.z = '"₹"#,##0.00';
        } else if (CASE_DATE_FIELDS.includes(colName) && cell.t === 'd') {
          cell.z = 'dd/mm/yyyy';
        }
      }
    }
  }

  // Freeze the top row (headers)
  ws['!views'] = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

  // If sheet already exists, remove it first
  const idx = wb.SheetNames.indexOf(sheetName);
  if (idx !== -1) {
    wb.SheetNames.splice(idx, 1);
    delete wb.Sheets[sheetName];
  }

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return await writeWorkbook(wb, 5, true);
  } finally {
    releaseWriteLock();
  }
}

/**
 * Serialize a case object for Excel storage.
 * JSON fields are stringified, everything else stays as-is.
 */
function serializeCase(c) {
  return serializeEntity(c, CASE_COLUMNS);
}

function normalizeCaseRecord(caseRecord) {
  const c = caseRecord && typeof caseRecord === 'object' ? { ...caseRecord } : {};
  c.id = c.id || 'CASE' + Date.now().toString(36).toUpperCase();
  c.status = c.status || 'new-lead';
  c.priority = c.priority || 'medium';
  c.createdAt = c.createdAt || new Date().toISOString();
  c.updatedAt = new Date().toISOString();
  return c;
}

function normalizeClientRecord(clientRecord) {
  const cl = clientRecord && typeof clientRecord === 'object' ? { ...clientRecord } : {};
  cl.id = cl.id || 'CL' + Date.now().toString(36).toUpperCase();
  cl.name = cl.name || cl.legalName || cl.tradeName || '';
  cl.legalName = cl.legalName || cl.name || '';
  cl.tradeName = cl.tradeName || '';
  cl.gstin = String(cl.gstin || '').trim().toUpperCase();
  cl.pan = String(cl.pan || '').trim().toUpperCase();
  cl.createdAt = cl.createdAt || new Date().toISOString();
  cl.updatedAt = new Date().toISOString();
  return cl;
}

function normalizeEmployeeRole(role) {
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

function roleHasFullAccess(role) {
  const normalized = normalizeEmployeeRole(role);
  return normalized === 'Admin' || normalized === 'Partner';
}

function normalizeEmployeeRecord(empRecord, existingRecord) {
  const existing = existingRecord || {};
  const emp = empRecord && typeof empRecord === 'object' ? { ...existing, ...empRecord } : { ...existing };
  emp.id = emp.id || 'EMP' + Date.now().toString(36).toUpperCase();
  emp.name = String(emp.name || '').trim();
  emp.role = normalizeEmployeeRole(emp.role);
  emp.status = emp.status || 'Active';
  emp.username = String(emp.username || '').trim();
  emp.email = String(emp.email || '').trim();
  emp.mobile = String(emp.mobile || '').trim();
  emp.accessLevel = normalizeAccessLevel(emp);
  emp.canLogin = emp.canLogin === true || String(emp.canLogin).toLowerCase() === 'true' ? 'true' : '';
  emp.createdAt = emp.createdAt || existing.createdAt || new Date().toISOString();
  emp.updatedAt = new Date().toISOString();
  return emp;
}

/**
 * Deserialize a row from Excel back to a case object.
 * JSON fields are parsed, number fields are converted.
 */
function deserializeCase(row) {
  const c = {};
  CASE_COLUMNS.forEach(col => {
    const humanCol = HEADER_MAP[col] || col;
    // Check both human header and camelCase header (for backwards compatibility)
    let val = row[humanCol] !== undefined ? row[humanCol] : row[col];
    if (val === undefined || val === null) val = '';

    if (CASE_JSON_FIELDS.includes(col)) {
      // Parse JSON strings back to arrays/objects
      if (typeof val === 'string' && val.trim()) {
        try { c[col] = JSON.parse(val); } catch (e) { c[col] = []; }
      } else {
        c[col] = [];
      }
    } else if (CASE_NUMBER_FIELDS.includes(col)) {
      c[col] = Number(val) || 0;
    } else if (CASE_DATE_FIELDS.includes(col) && val instanceof Date) {
      // Convert true Excel dates back to ISO strings (frontend expects strings)
      // Check if it has time component, else just keep YYYY-MM-DD
      c[col] = val.toISOString();
      if (c[col] && c[col].includes('T00:00:00.000Z') && col !== 'createdAt' && col !== 'updatedAt') {
        c[col] = c[col].split('T')[0];
      }
    } else if (col === 'status' && val) {
      // Reverse status formatting back to "scn-received"
      c[col] = String(val).toLowerCase().replace(/ /g, '-');
    } else if (col === 'priority' && val) {
      c[col] = String(val).toLowerCase();
    } else {
      c[col] = val !== '' ? val : '';
    }
  });

  // Also copy any extra columns that the user may have added in Excel
  Object.keys(row).forEach(key => {
    const isStandard = CASE_COLUMNS.includes(key) || Object.values(HEADER_MAP).includes(key);
    if (!isStandard && row[key] !== '' && row[key] !== undefined) {
      c[key] = row[key];
    }
  });

  return c;
}

/**
 * Deserialize a client row from Excel.
 */
function deserializeClient(row) {
  const cl = {};
  CLIENT_COLUMNS.forEach(col => {
    const humanCol = HEADER_MAP[col] || col;
    let val = row[humanCol] !== undefined ? row[humanCol] : row[col];
    cl[col] = val !== undefined && val !== null ? val : '';
  });
  // Copy extra columns
  Object.keys(row).forEach(key => {
    const isStandard = CLIENT_COLUMNS.includes(key) || Object.values(HEADER_MAP).includes(key);
    if (!isStandard && row[key] !== '' && row[key] !== undefined) {
      cl[key] = row[key];
    }
  });
  return cl;
}

/**
 * Deserialize an employee row from Excel.
 */
function deserializeEmployee(row) {
  const emp = {};
  EMPLOYEE_COLUMNS.forEach(col => {
    const humanCol = HEADER_MAP[col] || col;
    let val = row[humanCol] !== undefined ? row[humanCol] : row[col];
    emp[col] = val !== undefined && val !== null ? val : '';
  });
  emp.role = normalizeEmployeeRole(emp.role);
  emp.accessLevel = normalizeAccessLevel(emp);
  emp.canLogin = String(emp.canLogin || '').toLowerCase() === 'true' || emp.canLogin === true ? 'true' : '';
  Object.keys(row).forEach(key => {
    const isStandard = EMPLOYEE_COLUMNS.includes(key) || Object.values(HEADER_MAP).includes(key);
    if (!isStandard && row[key] !== '' && row[key] !== undefined) {
      emp[key] = row[key];
    }
  });
  return emp;
}

/**
 * Initialize Excel file with empty sheets and headers.

 */
function initExcelFile() {
  if (fs.existsSync(EXCEL_FILE)) {
    console.log('[Excel] File already exists:', EXCEL_FILE);
    return;
  }

  console.log('[Excel] Creating new Excel file:', EXCEL_FILE);
  const wb = XLSX.utils.book_new();

  // Cases sheet with headers only
  const casesWs = XLSX.utils.json_to_sheet([], { header: CASE_COLUMNS });
  casesWs['!cols'] = CASE_COLUMNS.map(col => ({ wch: Math.max(col.length + 2, 15) }));
  XLSX.utils.book_append_sheet(wb, casesWs, 'Cases');

  // Clients sheet with headers only
  const clientsWs = XLSX.utils.json_to_sheet([], { header: CLIENT_COLUMNS });
  clientsWs['!cols'] = CLIENT_COLUMNS.map(col => ({ wch: Math.max(col.length + 2, 15) }));
  XLSX.utils.book_append_sheet(wb, clientsWs, 'Clients');
  // Employees sheet with headers only
  const empWs = XLSX.utils.json_to_sheet([], { header: EMPLOYEE_COLUMNS });
  empWs['!cols'] = EMPLOYEE_COLUMNS.map(col => ({ wch: Math.max(col.length + 2, 15) }));
  XLSX.utils.book_append_sheet(wb, empWs, 'Employees');

  // Settings sheet
  const settingsWs = XLSX.utils.json_to_sheet([
    { key: 'userName', value: 'GST Practitioner' },
    { key: 'firmName', value: 'My Tax Firm' },
    { key: 'initials', value: 'GP' },
    { key: 'initialized', value: 'true' }
  ], { header: SETTINGS_COLUMNS });
  settingsWs['!cols'] = SETTINGS_COLUMNS.map(col => ({ wch: 25 }));
  XLSX.utils.book_append_sheet(wb, settingsWs, 'Settings');

  const auditWs = XLSX.utils.json_to_sheet([], { header: AUDIT_COLUMNS });
  auditWs['!cols'] = AUDIT_COLUMNS.map(col => ({ wch: Math.max(col.length + 2, 18) }));
  XLSX.utils.book_append_sheet(wb, auditWs, 'Audit Logs');

  XLSX.writeFile(wb, EXCEL_FILE, { cellDates: true });
  console.log('[Excel] File created successfully!');
}

// ─── API ROUTES ──────────────────────────────────────────────

// --- CACHE & BACKUP ---
let memoryCache = {
  cases: null,
  clients: null,
  employees: null,
  auditLogs: null,
  settings: null,
  isLoaded: false,
  lastLoadedMtimeMs: 0
};

function getExcelMtimeMs() {
  try {
    return fs.existsSync(EXCEL_FILE) ? fs.statSync(EXCEL_FILE).mtimeMs : 0;
  } catch (err) {
    return 0;
  }
}

function loadCacheFromExcel() {
  console.log('[Cache] Loading Excel data into memory...');
  memoryCache.cases = readSheet('Cases').map(deserializeCase);
  memoryCache.clients = readSheet('Clients').map(deserializeClient);
  memoryCache.employees = readSheet('Employees').map(deserializeEmployee);
  memoryCache.auditLogs = readSheet('Audit Logs').map(row => {
    const log = {};
    AUDIT_COLUMNS.forEach(col => {
      const humanCol = HEADER_MAP[col] || col;
      const val = row[humanCol] !== undefined ? row[humanCol] : row[col];
      log[col] = val !== undefined && val !== null ? val : '';
    });
    return log;
  });
  
  const rows = readSheet('Settings');
  const settings = {};
  rows.forEach(r => { if (r.key) settings[r.key] = r.value; });
  memoryCache.settings = settings;
  
  memoryCache.isLoaded = true;
  memoryCache.lastLoadedMtimeMs = getExcelMtimeMs();
  console.log('[Cache] Loaded into memory.');
}

function ensureCacheLoaded() {
  if (memoryCache.isLoaded) return;
  loadCacheFromExcel();
}

function refreshCacheFromExcelIfChanged() {
  ensureCacheLoaded();
  const currentMtime = getExcelMtimeMs();
  if (!currentMtime || !memoryCache.lastLoadedMtimeMs) return;
  if (currentMtime > memoryCache.lastLoadedMtimeMs + 5) {
    console.log('[Cache] Excel file changed on disk. Reloading cache...');
    try {
      loadCacheFromExcel();
    } catch (err) {
      console.warn('[Cache] Could not reload Excel cache; keeping last good data:', err.message);
    }
  }
}

function markCacheSyncedWithDisk() {
  memoryCache.lastLoadedMtimeMs = getExcelMtimeMs();
}

function sanitizeEmployee(emp) {
  if (!emp) return null;
  const { passwordHash, ...safe } = emp;
  safe.role = normalizeEmployeeRole(safe.role);
  safe.accessLevel = normalizeAccessLevel(safe);
  return safe;
}

function normalizeAccessLevel(emp) {
  if (!emp) return 'own';
  return roleHasFullAccess(emp.role) ? 'admin' : 'own';
}

function hasFullAccess(user) {
  return normalizeAccessLevel(user) === 'admin';
}

function canManageEmployees(user) {
  return normalizeAccessLevel(user) === 'admin';
}

function canAssignCases(user) {
  if (hasFullAccess(user)) return true;
  const role = normalizeEmployeeRole(user && user.role);
  return role === 'Manager' || role === 'Assistant Manager';
}

function isActiveEmployee(emp) {
  return emp && String(emp.status || 'Active').toLowerCase() !== 'inactive';
}

function canEmployeeLogin(emp) {
  return isActiveEmployee(emp) && String(emp.canLogin).toLowerCase() === 'true' && !!emp.passwordHash;
}

function isCaseVisibleToUser(caseRecord, user) {
  if (!caseRecord || !user) return false;
  if (hasFullAccess(user)) return true;
  return caseRecord.allottedTo === user.id ||
    caseRecord.allottedTo === user.name ||
    caseRecord.createdBy === user.id ||
    caseRecord.createdBy === user.name;
}

function hasConfiguredLogin() {
  refreshCacheFromExcelIfChanged();
  return memoryCache.employees.some(canEmployeeLogin);
}

function createToken(user) {
  return jwt.sign({
    id: user.id,
    name: user.name,
    role: user.role,
    accessLevel: normalizeAccessLevel(user)
  }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function requireAuth(req, res, next) {
  try {
    refreshCacheFromExcelIfChanged();
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Login required' });

    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.id === 'SYSTEM_ADMIN') {
      req.user = { id: 'SYSTEM_ADMIN', name: 'System Admin', role: 'Admin', accessLevel: 'admin' };
      return next();
    }

    const employee = memoryCache.employees.find(emp => emp.id === payload.id);
    if (!employee || !canEmployeeLogin(employee)) {
      return res.status(403).json({ error: 'Employee login is inactive' });
    }
    req.user = employee;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired login' });
  }
}

function requireAdmin(req, res, next) {
  if (!canManageEmployees(req.user)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

const loginAttempts = new Map();

function normalizeLoginName(value) {
  return String(value || '').trim().toLowerCase();
}

function getLoginNames(emp) {
  return [emp && emp.username, emp && emp.email]
    .map(normalizeLoginName)
    .filter(Boolean);
}

function loginAttemptKey(req, username) {
  const ip = req.ip || req.connection?.remoteAddress || 'local';
  return `${ip}:${normalizeLoginName(username)}`;
}

function getLoginLockSeconds(key) {
  const record = loginAttempts.get(key);
  if (!record) return 0;
  if (record.lockedUntil && record.lockedUntil > Date.now()) {
    return Math.ceil((record.lockedUntil - Date.now()) / 1000);
  }
  if (record.lockedUntil && record.lockedUntil <= Date.now()) {
    loginAttempts.delete(key);
  }
  return 0;
}

function recordFailedLogin(key) {
  const now = Date.now();
  const current = loginAttempts.get(key) || { count: 0, firstAt: now, lockedUntil: 0 };
  const record = now - current.firstAt > LOGIN_LOCK_MS
    ? { count: 1, firstAt: now, lockedUntil: 0 }
    : { ...current, count: current.count + 1 };

  if (record.count >= LOGIN_MAX_ATTEMPTS) {
    record.lockedUntil = now + LOGIN_LOCK_MS;
  }
  loginAttempts.set(key, record);
}

function clearLoginAttempts(key) {
  loginAttempts.delete(key);
}

function findEmployeeByLogin(username) {
  const login = normalizeLoginName(username);
  return memoryCache.employees.find(emp => {
    return canEmployeeLogin(emp) && getLoginNames(emp).includes(login);
  });
}

function backupExcel() {
  try {
    if (fs.existsSync(EXCEL_FILE)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      const stamp = `${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}_${Date.now()}`;
      const timestampedBackup = path.join(BACKUP_DIR, `case_master_data_${stamp}.xlsx`);
      const backupFile = EXCEL_FILE.replace('.xlsx', '.backup.xlsx');
      fs.copyFileSync(EXCEL_FILE, timestampedBackup);
      fs.copyFileSync(EXCEL_FILE, backupFile);
      const backups = fs.readdirSync(BACKUP_DIR)
        .filter(name => /^case_master_data_\d{14}_\d+\.xlsx$/.test(name))
        .map(name => ({ name, fullPath: path.join(BACKUP_DIR, name), mtime: fs.statSync(path.join(BACKUP_DIR, name)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);
      backups.slice(Math.max(0, MAX_EXCEL_BACKUPS)).forEach(file => {
        try { fs.unlinkSync(file.fullPath); } catch (err) { console.warn('[Excel] Old backup cleanup failed:', file.name, err.message); }
      });
    }
  } catch (e) {
    console.warn('[Excel] Backup failed', e);
  }
}

async function persistCasesToExcel() {
  backupExcel();
  const rows = memoryCache.cases.map(serializeCase);
  await writeSheet('Cases', rows, CASE_COLUMNS);
  markCacheSyncedWithDisk();
}

async function persistClientsToExcel() {
  backupExcel();
  const rows = memoryCache.clients.map(cl => serializeEntity(cl, CLIENT_COLUMNS));
  await writeSheet('Clients', rows, CLIENT_COLUMNS);
  markCacheSyncedWithDisk();
}

async function persistEmployeesToExcel() {
  backupExcel();
  const rows = memoryCache.employees.map(emp => serializeEntity(emp, EMPLOYEE_COLUMNS));
  await writeSheet('Employees', rows, EMPLOYEE_COLUMNS);
  markCacheSyncedWithDisk();
}

async function persistSettingsToExcel() {
  backupExcel();
  const rows = Object.keys(memoryCache.settings || {}).map(key => ({
    key,
    value: typeof memoryCache.settings[key] === 'object' ? JSON.stringify(memoryCache.settings[key]) : String(memoryCache.settings[key])
  }));
  await writeSheet('Settings', rows, SETTINGS_COLUMNS);
  markCacheSyncedWithDisk();
}

async function persistAuditLogsToExcel() {
  backupExcel();
  const rows = (memoryCache.auditLogs || []).map(log => serializeEntity(log, AUDIT_COLUMNS));
  await writeSheet('Audit Logs', rows, AUDIT_COLUMNS);
  markCacheSyncedWithDisk();
}

function getRequestIp(req) {
  return normalizeRemoteAddress(req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || '');
}

async function appendAuditLog(req, action, entityType, entityId, entityLabel, details) {
  try {
    ensureCacheLoaded();
    const actor = req && req.user ? req.user : {};
    const log = {
      id: `AUD${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id || '',
      actorName: actor.name || '',
      actorRole: actor.role || '',
      action,
      entityType,
      entityId: entityId || '',
      entityLabel: entityLabel || '',
      ipAddress: req ? getRequestIp(req) : '',
      userAgent: req && req.headers ? String(req.headers['user-agent'] || '').slice(0, 200) : '',
      details: details && typeof details === 'object' ? JSON.stringify(details) : String(details || '')
    };
    memoryCache.auditLogs = [log, ...(memoryCache.auditLogs || [])].slice(0, 5000);
    await persistAuditLogsToExcel();
  } catch (err) {
    console.warn('[Audit] Could not append audit log:', err.message);
  }
}

function getExcelMeta() {
  const stats = fs.existsSync(EXCEL_FILE) ? fs.statSync(EXCEL_FILE) : null;
  return {
    fileExists: !!stats,
    fileSize: stats ? stats.size : 0,
    lastModified: stats ? stats.mtime.toISOString() : null,
    serverTime: new Date().toISOString()
  };
}

function canAccessExcelFile() {
  try {
    fs.accessSync(EXCEL_FILE, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}

function getVisibleSnapshot(user) {
  refreshCacheFromExcelIfChanged();
  const visibleCases = memoryCache.cases.filter(c => isCaseVisibleToUser(c, user));
  if (hasFullAccess(user)) {
    return {
      cases: visibleCases,
      clients: memoryCache.clients,
      employees: memoryCache.employees.map(sanitizeEmployee),
      settings: memoryCache.settings,
      meta: getExcelMeta()
    };
  }

  const visibleClientIds = new Set(visibleCases.map(c => c.clientId).filter(Boolean));
  const visibleGstins = new Set(visibleCases.map(c => c.gstin).filter(Boolean));
  return {
    cases: visibleCases,
    clients: memoryCache.clients.filter(cl => visibleClientIds.has(cl.id) || visibleGstins.has(cl.gstin)),
    employees: memoryCache.employees.map(sanitizeEmployee),
    settings: memoryCache.settings,
    meta: getExcelMeta()
  };
}

function restoreCacheOnFailure(previous, err, res) {
  if (previous.cases) memoryCache.cases = previous.cases;
  if (previous.clients) memoryCache.clients = previous.clients;
  if (previous.employees) memoryCache.employees = previous.employees;
  if (previous.auditLogs) memoryCache.auditLogs = previous.auditLogs;
  if (previous.settings) memoryCache.settings = previous.settings;
  console.error('[Excel Sync] Save failed:', err);
  return res.status(500).json({ error: err.message || 'Could not save data to Excel' });
}

// --- CASES ---
app.post('/api/auth/login', async (req, res) => {
  try {
    refreshCacheFromExcelIfChanged();
    const username = normalizeLoginName(req.body.username);
    const password = String(req.body.password || '');
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    const attemptKey = loginAttemptKey(req, username);
    const lockSeconds = getLoginLockSeconds(attemptKey);
    if (lockSeconds > 0) {
      return res.status(429).json({ error: `Too many failed attempts. Try again in ${lockSeconds} seconds.` });
    }

    if (!hasConfiguredLogin()) {
      if (username === 'admin' && password === 'admin123') {
        const user = { id: 'SYSTEM_ADMIN', name: 'System Admin', role: 'Admin', accessLevel: 'admin' };
        req.user = user;
        clearLoginAttempts(attemptKey);
        appendAuditLog(req, 'login.bootstrap', 'auth', user.id, user.name, { username }).catch(() => {});
        return res.json({ token: createToken(user), user: sanitizeEmployee(user), bootstrap: true });
      }
      recordFailedLogin(attemptKey);
      return res.status(401).json({ error: 'Use admin / admin123 for first login, then create employee logins.' });
    }

    const employee = findEmployeeByLogin(username);
    if (!employee || !employee.passwordHash) {
      recordFailedLogin(attemptKey);
      return res.status(401).json({ error: 'Invalid login' });
    }
    const ok = await bcrypt.compare(password, employee.passwordHash);
    if (!ok) {
      recordFailedLogin(attemptKey);
      return res.status(401).json({ error: 'Invalid login' });
    }
    clearLoginAttempts(attemptKey);
    req.user = employee;
    appendAuditLog(req, 'login.success', 'auth', employee.id, employee.name, { username }).catch(() => {});
    res.json({ token: createToken(employee), user: sanitizeEmployee(employee), bootstrap: false });
  } catch (err) {
    console.error('[API] POST /api/auth/login error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: sanitizeEmployee(req.user) });
});

app.get('/api/sync', requireAuth, (req, res) => {
  try {
    res.json(getVisibleSnapshot(req.user));
  } catch (err) {
    console.error('[API] GET /api/sync error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cases', requireAuth, (req, res) => {
  try {
    refreshCacheFromExcelIfChanged();
    res.json(memoryCache.cases.filter(c => isCaseVisibleToUser(c, req.user)));
  } catch (err) {
    console.error('[API] GET /api/cases error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cases', requireAuth, async (req, res) => {
  try {
    const cases = req.body;
    if (!Array.isArray(cases)) {
      return res.status(400).json({ error: 'Expected array of cases' });
    }
    ensureCacheLoaded();
    const previous = { cases: memoryCache.cases };
    const existingById = new Map(memoryCache.cases.map(c => [c.id, c]));
    const normalizedCases = cases.map(caseRecord => {
      const existing = existingById.get(caseRecord && caseRecord.id);
      const next = normalizeCaseRecord({ ...(existing || {}), ...(caseRecord || {}) });
      if (!existing && req.user && req.user.id) {
        next.createdBy = next.createdBy || req.user.id;
        next.createdByName = next.createdByName || req.user.name || '';
      }
      return next;
    });
    if (hasFullAccess(req.user)) {
      memoryCache.cases = normalizedCases;
    } else {
      const allowed = normalizedCases.filter(c => {
        const existing = existingById.get(c.id);
        if (existing && !isCaseVisibleToUser(existing, req.user)) return false;
        return isCaseVisibleToUser(c, req.user);
      }).map(c => {
        const existing = existingById.get(c.id);
        const canAssign = canAssignCases(req.user);
        return {
          ...c,
          allottedTo: canAssign ? (c.allottedTo || '') : (existing ? existing.allottedTo : req.user.id),
          createdBy: existing ? (existing.createdBy || '') : (c.createdBy || req.user.id),
          createdByName: existing ? (existing.createdByName || '') : (c.createdByName || req.user.name || '')
        };
      });
      const allowedIds = new Set(allowed.map(c => c.id));
      memoryCache.cases = [
        ...memoryCache.cases.filter(c => !allowedIds.has(c.id)),
        ...allowed
      ];
    }
    try {
      await persistCasesToExcel();
    } catch (err) {
      return restoreCacheOnFailure(previous, err, res);
    }
    await appendAuditLog(req, 'cases.sync', 'case', '', 'Case Register', {
      submitted: cases.length,
      total: memoryCache.cases.length,
      fullAccess: hasFullAccess(req.user)
    });
    res.json({ success: true, count: memoryCache.cases.length, savedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[API] POST /api/cases error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- CLIENTS ---
app.get('/api/clients', requireAuth, (req, res) => {
  try {
    refreshCacheFromExcelIfChanged();
    if (hasFullAccess(req.user)) return res.json(memoryCache.clients);
    const visibleClientIds = new Set(memoryCache.cases.filter(c => isCaseVisibleToUser(c, req.user)).map(c => c.clientId).filter(Boolean));
    const visibleGstins = new Set(memoryCache.cases.filter(c => isCaseVisibleToUser(c, req.user)).map(c => c.gstin).filter(Boolean));
    res.json(memoryCache.clients.filter(cl => visibleClientIds.has(cl.id) || visibleGstins.has(cl.gstin)));
  } catch (err) {
    console.error('[API] GET /api/clients error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', requireAuth, async (req, res) => {
  try {
    if (!hasFullAccess(req.user)) return res.status(403).json({ error: 'Full access required to manage clients' });
    const clients = req.body;
    if (!Array.isArray(clients)) {
      return res.status(400).json({ error: 'Expected array of clients' });
    }
    ensureCacheLoaded();
    const previous = { clients: memoryCache.clients };
    memoryCache.clients = clients.map(normalizeClientRecord);
    try {
      await persistClientsToExcel();
    } catch (err) {
      return restoreCacheOnFailure(previous, err, res);
    }
    await appendAuditLog(req, 'clients.sync', 'client', '', 'Client Master', {
      submitted: clients.length,
      total: memoryCache.clients.length
    });
    res.json({ success: true, count: memoryCache.clients.length, savedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[API] POST /api/clients error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- EMPLOYEES ---
app.get('/api/employees', requireAuth, (req, res) => {
  try {
    refreshCacheFromExcelIfChanged();
    res.json(memoryCache.employees.map(sanitizeEmployee));
  } catch (err) {
    console.error('[API] GET /api/employees error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employees', requireAuth, requireAdmin, async (req, res) => {
  try {
    const employees = req.body;
    if (!Array.isArray(employees)) {
      return res.status(400).json({ error: 'Expected array of employees' });
    }
    ensureCacheLoaded();
    const previous = { employees: memoryCache.employees };
    const existingById = new Map(memoryCache.employees.map(emp => [emp.id, emp]));
    const normalized = [];
    const seenLogins = new Map();
    for (const emp of employees) {
      const existing = existingById.get(emp.id) || {};
      const next = normalizeEmployeeRecord(emp, existing);
      if (!next.name) return res.status(400).json({ error: 'Employee name is required' });
      if (emp.password) {
        next.passwordHash = await bcrypt.hash(String(emp.password), 10);
      } else if (!next.passwordHash) {
        next.passwordHash = existing.passwordHash || '';
      }
      if (next.canLogin === 'true') {
        const loginNames = getLoginNames(next);
        if (loginNames.length === 0) {
          return res.status(400).json({ error: `Login username or email is required for ${next.name}` });
        }
        if (!next.passwordHash) {
          return res.status(400).json({ error: `Password is required before enabling login for ${next.name}` });
        }
        for (const loginName of loginNames) {
          const owner = seenLogins.get(loginName);
          if (owner && owner !== next.id) {
            return res.status(400).json({ error: `Duplicate employee login: ${loginName}` });
          }
          seenLogins.set(loginName, next.id);
        }
      }
      delete next.password;
      normalized.push(next);
    }
    memoryCache.employees = normalized;
    try {
      await persistEmployeesToExcel();
    } catch (err) {
      return restoreCacheOnFailure(previous, err, res);
    }
    await appendAuditLog(req, 'employees.sync', 'employee', '', 'Employee Master', {
      submitted: employees.length,
      total: normalized.length
    });
    res.json({ success: true, count: normalized.length, savedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[API] POST /api/employees error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- SETTINGS ---
app.get('/api/settings', requireAuth, (req, res) => {
  try {
    refreshCacheFromExcelIfChanged();
    res.json(memoryCache.settings);
  } catch (err) {
    console.error('[API] GET /api/settings error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const settings = req.body;
    ensureCacheLoaded();
    const previous = { settings: memoryCache.settings };
    memoryCache.settings = settings;
    try {
      await persistSettingsToExcel();
    } catch (err) {
      return restoreCacheOnFailure(previous, err, res);
    }
    await appendAuditLog(req, 'settings.update', 'settings', '', 'Settings', {
      keys: Object.keys(settings || {})
    });
    res.json({ success: true, savedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[API] POST /api/settings error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/audit-logs', requireAuth, requireAdmin, (req, res) => {
  try {
    refreshCacheFromExcelIfChanged();
    const limit = Math.min(Number.parseInt(req.query.limit || '200', 10) || 200, 1000);
    res.json((memoryCache.auditLogs || []).slice(0, limit));
  } catch (err) {
    console.error('[API] GET /api/audit-logs error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/init', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { cases, clients, settings } = req.body;

    // Only write if sheets are empty
    const existingCases = readSheet('Cases');
    const existingClients = readSheet('Clients');

    let casesWritten = false, clientsWritten = false;

    if (existingCases.length === 0 && cases && cases.length > 0) {
      const rows = cases.map(serializeCase);
      await writeSheet('Cases', rows, CASE_COLUMNS);
      casesWritten = true;
    }

    if (existingClients.length === 0 && clients && clients.length > 0) {
      const rows = clients.map(cl => serializeEntity(cl, CLIENT_COLUMNS));
      await writeSheet('Clients', rows, CLIENT_COLUMNS);
      clientsWritten = true;
    }

    if (settings) {
      const existingSettings = readSheet('Settings');
      if (existingSettings.length <= 1) {
        const rows = Object.keys(settings).map(key => ({
          key,
          value: typeof settings[key] === 'object' ? JSON.stringify(settings[key]) : String(settings[key])
        }));
        await writeSheet('Settings', rows, SETTINGS_COLUMNS);
      }
    }

    // Invalidate cache after init
    memoryCache.isLoaded = false;

    res.json({
      success: true,
      casesWritten,
      clientsWritten,
      message: casesWritten || clientsWritten ? 'Sample data imported to Excel' : 'Excel already has data'
    });
    await appendAuditLog(req, 'system.init', 'system', '', 'Initial Data Import', { casesWritten, clientsWritten });
  } catch (err) {
    console.error('[API] POST /api/init error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  try {
    const fileExists = fs.existsSync(EXCEL_FILE);
    const stats = fileExists ? fs.statSync(EXCEL_FILE) : null;
    const counts = {
      cases: readSheet('Cases').length,
      clients: readSheet('Clients').length,
      employees: readSheet('Employees').length,
      auditLogs: readSheet('Audit Logs').length
    };
    res.json({
      status: 'ok',
      excelFile: EXCEL_FILE,
      fileExists,
      writable: fileExists ? canAccessExcelFile() : false,
      fileSize: stats ? stats.size : 0,
      lastModified: stats ? stats.mtime.toISOString() : null,
      counts,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      excelFile: EXCEL_FILE,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ─── BOOT ────────────────────────────────────────────────────
initExcelFile();

function getLanUrls() {
  const urls = [`http://localhost:${PORT}/CompanyLogin.aspx`];
  const machineName = os.hostname();
  if (machineName) urls.push(`http://${machineName}:${PORT}/CompanyLogin.aspx`);

  Object.values(os.networkInterfaces()).flat().forEach(info => {
    if (!info || info.internal || info.family !== 'IPv4') return;
    if (isOfficeNetworkAddress(info.address)) {
      urls.push(`http://${info.address}:${PORT}/CompanyLogin.aspx`);
    }
  });

  return [...new Set(urls)];
}

app.listen(PORT, HOST, () => {
  const urls = getLanUrls();
  console.log('');
  console.log('  ╔═══════════════════════════════════════════════════╗');
  console.log('  ║   GST LITIGATION PRO — Case Master Server        ║');
  console.log('  ║                                                   ║');
  console.log(`      Office URL: ${urls[0]}`);
  urls.slice(1).forEach(url => console.log(`      LAN URL:    ${url}`));
  console.log(`      Excel:      ${path.basename(EXCEL_FILE)}`);
  console.log(`      Access:     ${ALLOW_PUBLIC_ACCESS ? 'public override enabled' : 'office LAN only'}`);
  console.log('  ║                                                   ║');
  console.log('  ║   Data is saved to Excel file automatically.      ║');
  console.log('  ║   You can open the Excel file to view/edit data.  ║');
  console.log('  ╚═══════════════════════════════════════════════════╝');
  console.log('');
});
