/**
 * genAssist Submission Desk — backend (Google Apps Script)
 * ==========================================================
 * Plain-language summary: this script turns a normal Google Sheet into a
 * tiny private API that the genAssist Submission Desk web page (index.html)
 * can read from and write to. It costs nothing beyond a normal Google
 * account — no new subscriptions, no outside vendor. Your data stays in
 * your own Google Sheet and Google Drive.
 *
 * You do NOT need to understand this file to deploy it. Follow SETUP.md
 * in the project folder for exact click-by-click instructions. The only
 * thing you need to run from here yourself is the setup() function, once,
 * the first time (see SETUP.md step 4).
 *
 * -------------------------------------------------------------------
 * HOW THE FRONTEND TALKS TO THIS FILE (for reference — SETUP.md covers
 * the deployment side):
 *   fetch(APPS_SCRIPT_URL, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'text/plain;charset=utf-8' },
 *     body: JSON.stringify({ action: 'submissions.list', payload: {...} })
 *   })
 * Every response is JSON: { ok:true, data:... } or { ok:false, error:'...' }.
 * -------------------------------------------------------------------
 */

// ====================================================================
// SETUP — run this once from the Apps Script editor (see SETUP.md #4).
// Safe to run more than once: it only creates what's missing.
// ====================================================================
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  ensureSheet_(ss, 'Submissions', [
    'id', 'product', 'subtype', 'status', 'agentCode', 'agentName', 'branch',
    'clientName', 'clientPhone', 'clientEmail', 'formData', 'documents',
    'owner', 'nextAction', 'nextActionDue', 'createdAt', 'updatedAt',
    'submittedAt', 'cutoffApplied', 'slaAcknowledgeDue', 'slaState', 'offSystem'
  ]);

  ensureSheet_(ss, 'Events', ['id', 'submissionId', 'type', 'actor', 'text', 'createdAt']);

  var agentsSheet = ensureSheet_(ss, 'Agents', ['code', 'pin', 'name', 'branch', 'role', 'active']);
  if (agentsSheet.getLastRow() < 2) {
    agentsSheet.appendRow(['ADMIN1', '0000', 'System Admin', 'Head Office', 'admin', true]);
  }

  var settingsSheet = ensureSheet_(ss, 'Settings', ['key', 'value']);
  if (settingsSheet.getLastRow() < 2) {
    var defaults = [
      ['cutoffTime', '11:00'],
      ['timezone', 'America/Port_of_Spain'],
      ['businessHoursStart', '08:00'],
      ['businessHoursEnd', '16:00'],
      ['ackSlaHours', '2'],
      ['gmApprovalRequired', 'false'],
      ['holidays', '[]'],
      ['productRuleOverrides', '{}'],
      ['messageTemplates', '{}']
    ];
    defaults.forEach(function (row) { settingsSheet.appendRow(row); });
  }

  SpreadsheetApp.getUi().alert('Setup complete. Tabs ready: Submissions, Events, Agents, Settings.');
}

// Creates a tab with the given header row if it doesn't already exist.
// If the tab exists but has no header row yet, writes the header row.
function ensureSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ====================================================================
// WEB APP ENTRY POINTS
// ====================================================================

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut_({ ok: false, error: 'Could not read request body: ' + err });
  }
  return dispatch_(body.action, body.payload || {});
}

// Lets a human test a deployed URL directly in a browser, e.g.:
//   https://script.google.com/.../exec?action=settings.get
//   https://script.google.com/.../exec?action=submissions.get&payload=%7B%22id%22%3A%22ARAL-2601-0001%22%7D
function doGet(e) {
  var action = e.parameter.action;
  var payload = {};
  if (e.parameter.payload) {
    try { payload = JSON.parse(e.parameter.payload); } catch (err) { /* ignore, use {} */ }
  }
  return dispatch_(action, payload);
}

function dispatch_(action, payload) {
  try {
    var handlers = {
      'auth.login': handleAuthLogin_,
      'submissions.list': handleSubmissionsList_,
      'submissions.get': handleSubmissionsGet_,
      'submissions.create': handleSubmissionsCreate_,
      'submissions.update': handleSubmissionsUpdate_,
      'submissions.logOffSystem': handleSubmissionsLogOffSystem_,
      'events.add': handleEventsAdd_,
      'events.list': handleEventsList_,
      'agents.list': handleAgentsList_,
      'settings.get': handleSettingsGet_,
      'settings.update': handleSettingsUpdate_,
      'files.upload': handleFilesUpload_
    };
    var fn = handlers[action];
    if (!fn) return jsonOut_({ ok: false, error: 'Unknown action: ' + action });
    var data = fn(payload || {});
    return jsonOut_({ ok: true, data: data });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ====================================================================
// GENERIC SHEET HELPERS — the rest of this file stays short because
// every action reads/writes through these three functions.
// ====================================================================

function getSheet_(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('Sheet tab "' + name + '" not found — run setup() first.');
  return sheet;
}

// Turns a sheet's rows into an array of plain objects keyed by the header row.
function sheetToObjects_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var obj = {};
    for (var c = 0; c < headers.length; c++) obj[headers[c]] = values[r][c];
    rows.push(obj);
  }
  return rows;
}

// Appends one object as a new row, in header-column order. Missing keys
// are written as empty strings.
function appendObjectRow_(sheet, obj) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = headers.map(function (h) { return obj[h] === undefined ? '' : obj[h]; });
  sheet.appendRow(row);
  return obj;
}

// Finds the row where column `idColumnName` equals `idValue`, merges
// `patch` onto it (only the provided keys), writes it back, and returns
// the merged object. Returns null if no matching row was found.
function updateObjectRow_(sheet, idColumnName, idValue, patch) {
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idCol = headers.indexOf(idColumnName);
  if (idCol === -1) throw new Error('Column "' + idColumnName + '" not found.');
  for (var r = 1; r < values.length; r++) {
    if (values[r][idCol] === idValue) {
      var merged = {};
      for (var c = 0; c < headers.length; c++) merged[headers[c]] = values[r][c];
      Object.keys(patch).forEach(function (k) { merged[k] = patch[k]; });
      var newRow = headers.map(function (h) { return merged[h] === undefined ? '' : merged[h]; });
      sheet.getRange(r + 1, 1, 1, headers.length).setValues([newRow]);
      return merged;
    }
  }
  return null;
}

function findObjectRow_(sheet, idColumnName, idValue) {
  var rows = sheetToObjects_(sheet);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][idColumnName] === idValue) return rows[i];
  }
  return null;
}

// ====================================================================
// ACTION HANDLERS
// ====================================================================

// ---- auth.login { code, pin } ----
function handleAuthLogin_(payload) {
  var agents = sheetToObjects_(getSheet_('Agents'));
  var match = agents.filter(function (a) {
    return String(a.code) === String(payload.code) && String(a.pin) === String(payload.pin) && (a.active === true || a.active === 'true' || a.active === 'TRUE');
  })[0];
  if (!match) throw new Error('Invalid code or PIN');
  return { agent: { code: match.code, name: match.name, branch: match.branch, role: match.role } };
}

// ---- submissions.list { filter } ----
function handleSubmissionsList_(payload) {
  var rows = sheetToObjects_(getSheet_('Submissions'));
  var filter = payload.filter || {};
  Object.keys(filter).forEach(function (k) {
    if (filter[k]) rows = rows.filter(function (r) { return r[k] === filter[k]; });
  });
  return rows;
}

// ---- submissions.get { id } ----
function handleSubmissionsGet_(payload) {
  var row = findObjectRow_(getSheet_('Submissions'), 'id', payload.id);
  if (!row) throw new Error('Not found');
  return row;
}

// ---- submissions.create { data } ----
function handleSubmissionsCreate_(payload) {
  var sheet = getSheet_('Submissions');
  var data = payload.data || {};
  var now = new Date().toISOString();
  var record = Object.assign({
    status: 'Submitted',
    createdAt: now,
    updatedAt: now,
    submittedAt: now,
    owner: '',
    nextAction: 'Acknowledge',
    nextActionDue: '',
    slaState: 'green',
    offSystem: false
  }, data, {
    id: nextSubmissionId_(sheet)
  });
  return appendObjectRow_(sheet, record);
}

// ---- submissions.update { id, patch } ----
function handleSubmissionsUpdate_(payload) {
  var sheet = getSheet_('Submissions');
  var patch = Object.assign({}, payload.patch || {}, { updatedAt: new Date().toISOString() });
  var updated = updateObjectRow_(sheet, 'id', payload.id, patch);
  if (!updated) throw new Error('Not found');
  return updated;
}

// ---- submissions.logOffSystem { data } ----
// Used by Admin to log something that came in via WhatsApp/email outside
// the normal flow, so weekly metrics stay accurate.
function handleSubmissionsLogOffSystem_(payload) {
  var sheet = getSheet_('Submissions');
  var data = Object.assign({}, payload.data || {}, { offSystem: true });
  var now = new Date().toISOString();
  var record = Object.assign({
    createdAt: now,
    updatedAt: now,
    owner: '',
    nextAction: '',
    nextActionDue: '',
    slaState: 'green'
  }, data, {
    id: nextSubmissionId_(sheet)
  });
  return appendObjectRow_(sheet, record);
}

// Generates ARAL-YYMM-#### using America/Port_of_Spain's current month,
// with a per-month sequence counted from existing rows.
function nextSubmissionId_(sheet) {
  var now = new Date();
  var stamp = Utilities.formatDate(now, 'America/Port_of_Spain', 'yyMM');
  var prefix = 'ARAL-' + stamp + '-';
  var rows = sheetToObjects_(sheet);
  var maxSeq = 0;
  rows.forEach(function (r) {
    if (typeof r.id === 'string' && r.id.indexOf(prefix) === 0) {
      var n = parseInt(r.id.slice(prefix.length), 10);
      if (!isNaN(n) && n > maxSeq) maxSeq = n;
    }
  });
  var seq = String(maxSeq + 1);
  while (seq.length < 4) seq = '0' + seq;
  return prefix + seq;
}

// ---- events.add { submissionId, event:{type,actor,text} } ----
function handleEventsAdd_(payload) {
  var sheet = getSheet_('Events');
  var event = payload.event || {};
  var record = {
    id: 'EV-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000),
    submissionId: payload.submissionId,
    type: event.type || '',
    actor: event.actor || '',
    text: event.text || '',
    createdAt: new Date().toISOString()
  };
  return appendObjectRow_(sheet, record);
}

// ---- events.list { submissionId } ----
function handleEventsList_(payload) {
  var rows = sheetToObjects_(getSheet_('Events')).filter(function (r) { return r.submissionId === payload.submissionId; });
  rows.sort(function (a, b) { return new Date(a.createdAt) - new Date(b.createdAt); });
  return rows;
}

// ---- agents.list {} ---- (omits the pin column on purpose)
function handleAgentsList_() {
  return sheetToObjects_(getSheet_('Agents')).map(function (a) {
    return { code: a.code, name: a.name, branch: a.branch, role: a.role, active: a.active };
  });
}

// ---- settings.get {} ----
// The Settings tab is one row per key. Values that look like JSON
// (start with { or [) are parsed back into real objects/arrays.
function handleSettingsGet_() {
  var rows = sheetToObjects_(getSheet_('Settings'));
  var out = {};
  rows.forEach(function (r) {
    out[r.key] = maybeParseJson_(r.value);
  });
  return out;
}

// ---- settings.update { patch } ----
function handleSettingsUpdate_(payload) {
  var sheet = getSheet_('Settings');
  var patch = payload.patch || {};
  Object.keys(patch).forEach(function (key) {
    var value = patch[key];
    var stored = (typeof value === 'object') ? JSON.stringify(value) : String(value);
    var found = updateObjectRow_(sheet, 'key', key, { value: stored });
    if (!found) appendObjectRow_(sheet, { key: key, value: stored });
  });
  return handleSettingsGet_();
}

function maybeParseJson_(value) {
  if (typeof value !== 'string') return value;
  var trimmed = value.trim();
  if (trimmed.indexOf('{') === 0 || trimmed.indexOf('[') === 0) {
    try { return JSON.parse(trimmed); } catch (e) { return value; }
  }
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  return value;
}

// ---- files.upload { submissionId, name, mime, dataBase64 } ----
function handleFilesUpload_(payload) {
  var rootFolder = getOrCreateFolder_(DriveApp.getRootFolder(), 'genAssist Submission Desk Files');
  var subFolder = getOrCreateFolder_(rootFolder, 'genAssist Submission Desk — ' + payload.submissionId);
  var bytes = Utilities.base64Decode(payload.dataBase64);
  var blob = Utilities.newBlob(bytes, payload.mime || 'application/octet-stream', payload.name || 'upload');
  var file = subFolder.createFile(blob);
  return { name: file.getName(), url: file.getUrl() };
}

function getOrCreateFolder_(parent, name) {
  var existing = parent.getFoldersByName(name);
  if (existing.hasNext()) return existing.next();
  return parent.createFolder(name);
}
