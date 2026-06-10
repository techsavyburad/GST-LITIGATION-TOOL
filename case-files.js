// ============================================================
// CASE FILE STORAGE — case-files.js
// Per-case document upload using IndexedDB (FileDB)
// Files persist permanently, not subject to localStorage limits
// ============================================================

// ─── FILE TYPE ICON HELPER ───────────────────────────────────
function _cfFileIcon(type) {
  if (!type) return 'fa-file';
  if (type.includes('pdf')) return 'fa-file-pdf';
  if (type.includes('word') || type.includes('docx') || type.includes('msword')) return 'fa-file-word';
  if (type.includes('sheet') || type.includes('excel') || type.includes('xlsx')) return 'fa-file-excel';
  if (type.includes('image') || type.includes('png') || type.includes('jpg')) return 'fa-file-image';
  if (type.includes('zip') || type.includes('rar')) return 'fa-file-archive';
  if (type.includes('text') || type.includes('txt')) return 'fa-file-alt';
  return 'fa-file';
}
function _cfFileIconColor(type) {
  if (!type) return '#6b7280';
  if (type.includes('pdf')) return '#ef4444';
  if (type.includes('word') || type.includes('docx') || type.includes('msword')) return '#2563eb';
  if (type.includes('sheet') || type.includes('excel') || type.includes('xlsx')) return '#16a34a';
  if (type.includes('image')) return '#f59e0b';
  return '#6b7280';
}
function _cfFormatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  } catch(e) { return iso; }
}
function _cfJurisdictionLabel(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (lower === 'center' || lower === 'central' || lower.includes('cgst') || lower.includes('central gst')) return 'Central GST';
  if (lower === 'state' || lower.includes('sgst') || lower.includes('state gst')) return 'State GST';
  return raw;
}

// ─── RENDER FILE LIST ──────────────────────────────────────────
window.renderCaseFiles = async function (caseId) {
  const listEl  = document.getElementById('case-files-list-' + caseId);
  const badgeEl = document.getElementById('cf-file-badge-' + caseId);
  if (!listEl) return;
  try {
    const files = await FileDB.list(caseId);
    if (!files || files.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:13px;padding:16px"><i class="fas fa-inbox" style="font-size:24px;display:block;margin-bottom:8px;opacity:0.4"></i>No files uploaded yet.</div>';
      if (badgeEl) badgeEl.style.display = 'none';
      return;
    }
    if (badgeEl) { badgeEl.textContent = files.length + ' file' + (files.length > 1 ? 's' : ''); badgeEl.style.display = 'inline'; }
    listEl.innerHTML = `<div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px"><i class="fas fa-paperclip"></i> ${files.length} Stored File${files.length>1?'s':''}</div>
      <div class="uploaded-files-grid">${files.map(f=>`<div class="uploaded-file-card" id="cf-file-card-${f.id.replace(/[^a-z0-9]/gi,'_')}"><div class="uploaded-file-icon"><i class="fas ${_cfFileIcon(f.type)}" style="color:${_cfFileIconColor(f.type)}"></i></div><div class="uploaded-file-info"><div class="uploaded-file-name" title="${f.filename}">${f.filename}</div><div class="uploaded-file-meta">${FileDB.formatSize(f.size)} &nbsp;•&nbsp; ${_cfFormatDate(f.uploadedAt)}</div></div><div class="uploaded-file-actions"><button class="btn btn-ghost btn-xs" style="color:var(--blue)" onclick="window.cfDownload('${f.id}')" title="Download"><i class="fas fa-download"></i></button><button class="btn btn-ghost btn-xs" style="color:#ef4444" onclick="window.cfDelete('${f.id}','${caseId}')" title="Delete"><i class="fas fa-trash"></i></button></div></div>`).join('')}</div>`;
  } catch (err) {
    listEl.innerHTML = '<div style="color:#ef4444;font-size:13px;padding:12px"><i class="fas fa-exclamation-circle"></i> Error loading files: ' + err.message + '</div>';
  }
};

// ─── UPLOAD HANDLER ────────────────────────────────────────────
window.caseFileUpload = async function (caseId, files) {
  if (!files || files.length === 0) return;
  const listEl = document.getElementById('case-files-list-' + caseId);
  if (listEl) listEl.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:13px;padding:12px"><i class="fas fa-spinner fa-spin"></i> Uploading ' + files.length + ' file(s)…</div>';
  let ok = 0;
  for (const file of Array.from(files)) {
    if (file.size > 50*1024*1024) { toast(file.name + ' exceeds 50 MB — skipped.', 'warning'); continue; }
    try { await FileDB.save(caseId, file); ok++; } catch(err) { toast('Failed: ' + err.message, 'error'); }
  }
  if (ok > 0) toast(ok + ' file(s) saved.', 'success');
  await window.renderCaseFiles(caseId);
};

// ─── DOWNLOAD HANDLER ───────────────────────────────────────────
window.cfDownload = async function (fileId) {
  try {
    const db = await FileDB.open();
    const record = await new Promise((res,rej)=>{ const tx=db.transaction(FileDB.STORE,'readonly'); const req=tx.objectStore(FileDB.STORE).get(fileId); req.onsuccess=e=>res(e.target.result); req.onerror=e=>rej(e.target.error); });
    if (!record) { toast('File not found.','error'); return; }
    FileDB.download(record);
  } catch(err) { toast('Download failed: '+err.message,'error'); }
};

// ─── DELETE HANDLER ─────────────────────────────────────────────
window.cfDelete = async function (fileId, caseId) {
  if (!confirm('Delete this file? This cannot be undone.')) return;
  try { await FileDB.delete(fileId); toast('File deleted.','success'); await window.renderCaseFiles(caseId); }
  catch(err) { toast('Delete failed: '+err.message,'error'); }
};


// ─── HOOK handleDocUpload ───────────────────────────────────────
window.handleDocUpload = function (caseId, files) { window.caseFileUpload(caseId, files); };

// ─── INJECT UPLOAD ZONE (FALLBACK) ─────────────────────────────
window.initCaseFileZone = function (caseId) {
  if (document.getElementById('case-files-card-' + caseId)) { window.renderCaseFiles(caseId); return; }
  const tab9 = document.getElementById('cf-tab-9');
  if (!tab9) return;
  const existingCard = tab9.querySelector('.card');
  if (existingCard && !existingCard.id) {
    const zone = document.createElement('div');
    zone.className = 'card mb-4';
    zone.id = 'case-files-card-' + caseId;
    zone.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><b style="font-size:14px"><i class="fas fa-folder-open" style="color:var(--blue)"></i> Case Files</b><span id="cf-file-badge-${caseId}" style="font-size:11px;background:var(--blue);color:#fff;padding:2px 10px;border-radius:12px;display:none"></span></div><div class="doc-upload-zone" onclick="document.getElementById('case-file-input-${caseId}').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault();this.classList.remove('drag-over');window.caseFileUpload('${caseId}',event.dataTransfer.files)"><input type="file" id="case-file-input-${caseId}" multiple style="display:none" onchange="window.caseFileUpload('${caseId}',this.files);this.value=''"><i class="fas fa-cloud-upload-alt" style="font-size:32px;color:var(--blue);margin-bottom:10px"></i><div style="font-size:14px;font-weight:600">Drag &amp; Drop or Click to Browse</div><div style="font-size:12px;color:var(--text-muted);margin-top:4px">PDF, Images, Word, Excel — up to 50MB</div></div><div id="case-files-list-${caseId}" style="margin-top:16px"><div style="text-align:center;color:var(--text-muted);font-size:13px;padding:12px"><i class="fas fa-spinner fa-spin"></i> Loading…</div></div>`;
    tab9.insertBefore(zone, existingCard);
    window.renderCaseFiles(caseId);
  }
};

// ============================================================
// EXPORT CASE FILE AS PROFESSIONAL B&W PDF 
// Clean grid-based modern report format without colors
// Perfect for premium physical prints.
// ============================================================
window.exportCasePDF = function (caseId) {
  const c = (typeof DB !== 'undefined' ? DB.getArr('cases') : []).find(x => x.id === caseId);
  if (!c) { if (typeof toast === 'function') toast('Case not found.', 'error'); return; }

  // ── mini helpers ────────────────────────────────────────────
  function fmtD(iso) {
    if (!iso) return '\u2014';
    try { return new Date(iso).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); } catch(e){ return iso; }
  }
  function fmtAmt(n) {
    if (!n && n !== 0) return '\u20b90';
    return '\u20b9' + Number(n).toLocaleString('en-IN',{maximumFractionDigits:2});
  }
  function esc(s) { return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function tick(v, t) { return v ? '<b>\u2713 '+(t||'Yes')+'</b>' : '<span style="color:#888">\u2014</span>'; }

  const SL = {'scn-received':'SCN Received','reply-filed':'Reply Filed','appeal-filed':'Appeal Filed','writ-filed':'Writ Filed','closed':'Closed','dropped':'Dropped'};
  const OL = {'return-scrutiny':'Return Scrutiny (Sec 61)','dept-audit':'Departmental Audit (Sec 65)','special-audit':'Special Audit (Sec 66)','investigation':'Investigation by Intelligence Wing','inspection':'Inspection / Search / Seizure (Sec 67)','eway-detention':'E-Way Bill / Detention of Goods','data-mismatch':'Data Analytics / System Mismatch','refund':'Refund Proceedings (Sec 54)','registration':'Registration Proceedings'};

  const total    = c.totalAmount || ((c.demandAmount||0)+(c.penaltyAmount||0)+(c.interestAmount||0)+(c.otherAmount||0));
  const cl       = c.checklist  || [];
  const clDone   = cl.filter(s=>s.status==='done').length;
  const allG     = c.grounds    || [];
  const allF     = c.facts      || [];
  const docs     = c.documents  || [];
  const pending  = c.pendingList|| [];
  const notes    = c.updateNotes|| [];
  const printed  = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});

  // argument sequence
  const takenG = allG.filter(g=>g.taken).map(g=>g.name);
  let seqList  = c.sequenceList ? c.sequenceList.filter(n=>takenG.includes(n)) : [...takenG];
  takenG.forEach(n=>{ if(!seqList.includes(n)) seqList.push(n); });

  // facts sequence
  const takenF   = allF.filter(f=>f.taken).map(f=>f.name);
  let factsSeq   = c.factsSequenceList ? c.factsSequenceList.filter(n=>takenF.includes(n)) : [...takenF];
  takenF.forEach(n=>{ if(!factsSeq.includes(n)) factsSeq.push(n); });

  // ── CSS (Pure B&W Modern Grid) ───────────────────────────────
  const CSS = [
    '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");',
    '*{box-sizing:border-box;margin:0;padding:0}',
    'body{font-family:"Inter",Arial,sans-serif;font-size:11.5px;color:#000;background:#fff}',
    
    // COVER / HEADER
    '.cover{padding:40px;text-align:center;border-bottom:3px solid #000;margin-bottom:20px}',
    '.cover-logo{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#555;margin-bottom:10px;font-weight:700}',
    '.cover h1{font-size:26px;font-weight:800;letter-spacing:.3px;line-height:1.25;margin-bottom:8px;color:#000}',
    '.cover h2{font-size:14px;font-weight:600;color:#333;margin-bottom:5px}',
    '.cover .cno{font-size:11.5px;color:#555;font-family:monospace;letter-spacing:1px;margin-bottom:18px}',
    '.meta-row{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:16px}',
    '.bdg{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:700;padding:4px 12px;border:1px solid #000;text-transform:uppercase}',
    '.bdg-inv{background:#000;color:#fff}',

    // BODY WRAP
    '.bw{padding:10px 40px 40px}',

    // SUMMARY CARDS
    '.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}',
    '.sc{padding:14px;border:1px solid #000}',
    '.sc .sl{font-size:9pt;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px}',
    '.sc .sv{font-size:18px;font-weight:800;color:#000;line-height:1}',
    '.sc .ss{font-size:9.5px;color:#555;margin-top:4px}',
    '.sc.acc{border-width:2px}',

    // TOC
    '.toc{border:1px solid #000;padding:16px;margin-bottom:24px}',
    '.toc-t{font-size:10pt;font-weight:800;color:#000;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;border-bottom:1px solid #eee;padding-bottom:8px}',
    '.toc-g{display:grid;grid-template-columns:1fr 1fr;gap:4px 20px}',
    '.toc-i{display:flex;align-items:center;gap:6px;font-size:11px;color:#000;font-weight:500;padding:2px 0}',
    '.toc-d{width:6px;height:6px;background:#000;flex-shrink:0}',

    // SECTION
    '.sw{margin-bottom:24px;border:1px solid #000;break-inside:avoid}',
    '.sh{display:flex;align-items:center;gap:8px;padding:10px 14px;font-size:12px;font-weight:800;color:#fff;background:#000;text-transform:uppercase;letter-spacing:1px}',
    '.sb{padding:16px;background:#fff}',

    // DETAIL GRID
    '.dg{display:grid;grid-template-columns:1fr 1fr;gap:0;border-top:1px solid #eee;border-left:1px solid #eee}',
    '.di{padding:10px;border-bottom:1px solid #eee;border-right:1px solid #eee}',
    '.dl{font-size:9px;font-weight:800;color:#555;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}',
    '.dv{font-size:12px;color:#000;font-weight:600;line-height:1.4}',
    '.dv.mono{font-family:"Courier New",monospace;font-size:11px}',
    '.df{grid-column:span 2}',

    // DATES GRID
    '.dtg{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #eee;border-left:1px solid #eee}',
    '.dti{padding:10px;border-bottom:1px solid #eee;border-right:1px solid #eee}',
    '.dtl{font-size:9px;color:#555;font-weight:800;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px}',
    '.dtv{font-size:11.5px;color:#000;font-weight:700}',

    // AMOUNT CARDS
    '.ag{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}',
    '.ac{border:1px solid #ccc;padding:12px;text-align:center}',
    '.at{font-size:9.5px;font-weight:800;color:#555;text-transform:uppercase;margin-bottom:6px}',
    '.av{font-size:14px;font-weight:800;color:#000}',
    '.ac.tot{border:2px solid #000}',

    // TABLES
    'table.pt{width:100%;border-collapse:collapse;font-size:11.5px}',
    'table.pt th{background:#f9f9f9;font-size:9.5px;text-transform:uppercase;font-weight:800;color:#000;padding:8px 10px;text-align:left;border:1px solid #000;letter-spacing:.5px}',
    'table.pt td{padding:8px 10px;border:1px solid #ddd;vertical-align:top;color:#000;font-weight:500}',
    'table.pt .sh-row td{background:#eee;font-weight:800;color:#000;font-size:10px;padding:6px 10px;letter-spacing:1px;text-transform:uppercase;border:1px solid #000}',
    
    // PROGRESS
    '.pb{height:8px;background:#eee;border:1px solid #ccc;margin-bottom:10px}',
    '.pf{height:100%;background:#000}',

    // FACTS & SEQUENCES
    '.si{display:flex;align-items:flex-start;gap:12px;padding:10px;border:1px solid #ddd;margin-bottom:6px}',
    '.sn{background:#000;color:#fff;font-family:monospace;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0}',
    '.st{font-size:12px;color:#000;font-weight:600;line-height:1.5;padding-top:2px}',
    '.cat{font-size:9.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:4px 0;margin:12px 0 6px;border-bottom:2px solid #000;display:inline-block}',

    // NOTES & PENDING
    '.ni{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid #eee}',
    '.nd{font-size:10px;color:#555;font-weight:700;white-space:nowrap;padding-top:2px;min-width:70px}',
    '.nt{font-size:11.5px;color:#000;font-weight:500;line-height:1.6}',
    '.box{border:1px solid #ddd;padding:14px;font-size:11.5px;line-height:1.7;color:#000;font-weight:500;margin-top:8px}',

    // FOOTER
    '.foot{margin-top:30px;padding:12px 0;border-top:2px solid #000;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#555;font-weight:600}',
    '.empty-msg{color:#555;font-size:11px;padding:12px 0;text-align:center;font-style:italic}',

    // PRINT
    '@page{margin:15mm 12mm}',
    '@media print{',
    '.sw{break-inside:avoid}',
    '.cover, .sh, .sn, .bdg-inv, .pf, .toc-d {-webkit-print-color-adjust:exact;print-color-adjust:exact}',
    '}'
  ].join('\n');

  // ── section builder ────────────────────────────────────────
  function S(icon, title, inner) {
    if (!inner || !inner.trim()) return '';
    return '<div class="sw"><div class="sh"><span>'+title+'</span></div><div class="sb">'+inner+'</div></div>';
  }
  function di(lbl, val, cls) {
    return '<div class="di'+(cls?' '+cls:'')+'"><div class="dl">'+lbl+'</div><div class="dv'+(cls&&cls.includes('mono')?' mono':'')+'">'+( (val===null||val===undefined||val==='')?'\u2014':val)+'</div></div>';
  }
  function emptyMsg(m) { return '<div class="empty-msg">'+m+'</div>'; }

  // ── COVER ───────────────────────────────────────────────────
  const COVER = '<div class="cover">'
    +'<div class="cover-logo">GST Litigation Pro &nbsp;&bull;&nbsp; Case File Report</div>'
    +'<h1>'+esc(c.taxpayerName)+'</h1>'
    +'<h2>'+esc(c.assignmentTypeLabel||'Reply to SCN')+' &nbsp;&bull;&nbsp; '+esc(c.period||'\u2014')+'</h2>'
    +'<div class="cno">FILE NO: '+esc(c.caseNo)+' &nbsp;&bull;&nbsp; GSTIN: '+esc(c.gstin)+' &nbsp;&bull;&nbsp; SEC '+esc(c.section)+'</div>'
    +'<div class="meta-row">'
    +'<span class="bdg bdg-inv">'+(SL[c.status]||c.status)+'</span>'
    +'<span class="bdg">TOTAL: '+fmtAmt(total)+'</span>'
    +(c.priority==='critical'?'<span class="bdg">CRITICAL PRIORITY</span>':'')
    +(c.dueDate?'<span class="bdg">DUE: '+fmtD(c.dueDate)+'</span>':'')
    +(c.allottedTo?'<span class="bdg">ALLOTTED: '+esc(resolveEmployeeName(c.allottedTo))+'</span>':'')
    +'</div></div>';

  // ── TOC ─────────────────────────────────────────────────────
  const tocs = [
    'Assignment Details','Amount Involved','Key Dates & Authority',
    'Workflow Checklist','Case Origin','Grounds of Defence',
    'Argument Sequence','Statement of Facts','Facts Sequence',
    'Document Tracker','Pending List','Notes & Updates'
  ];
  const TOC = '<div class="toc"><div class="toc-t">Table of Contents</div><div class="toc-g">'
    +tocs.map(t=>'<div class="toc-i"><div class="toc-d"></div>'+t+'</div>').join('')
    +'</div></div>';

  // ── SUMMARY CARDS ───────────────────────────────────────────
  const clPct    = cl.length>0 ? Math.round(clDone/cl.length*100) : 0;
  const SUMMARY  = '<div class="sg">'
    +'<div class="sc acc"><div class="sl">Total Demand</div><div class="sv" style="font-size:16px">'+fmtAmt(total)+'</div><div class="ss">Tax+Penalty+Interest</div></div>'
    +'<div class="sc"><div class="sl">Checklist Progress</div><div class="sv">'+clPct+'%</div><div class="ss">'+clDone+' of '+cl.length+' done</div></div>'
    +'<div class="sc"><div class="sl">Grounds</div><div class="sv">'+allG.filter(g=>g.applicable).length+'</div><div class="ss">'+seqList.length+' in sequence</div></div>'
    +'<div class="sc"><div class="sl">Facts</div><div class="sv">'+allF.filter(f=>f.applicable).length+'</div><div class="ss">'+factsSeq.length+' in sequence</div></div>'
    +'</div>';

  // ── ASSIGNMENT ──────────────────────────────────────────────
  const ASSIGN = S('','Assignment Details',
    '<div class="dg">'
    +di('Client / Taxpayer Name',esc(c.taxpayerName))
    +di('GSTIN / PAN',esc(c.gstin),'mono')
    +di('Case / File No.',esc(c.caseNo))
    +di('Current Status',SL[c.status]||c.status)
    +di('Assignment Type',esc(c.assignmentTypeLabel||'Reply to SCN'))
    +di('Priority',(c.priority||'medium').toUpperCase())
    +di('Section Invoked','Sec '+esc(c.section))
    +di('Period',esc(c.period))
    +di('Allotted To',esc(resolveEmployeeName(c.allottedTo)))
    +di('ITN',esc(c.itn))
    +di('Contact Name',esc(c.contactName))
    +di('Mobile',esc(c.mobile))
    +di('E-mail',esc(c.email))
    +di('Reference',esc(c.reference))
    +di('Date of Receipt',fmtD(c.receiptDate))
    +di('Commitment Date',fmtD(c.commitDate))
    +di('Due Date',fmtD(c.dueDate))
    +di('Bill No. & Date',esc(c.billRef))
    +(c.clientAddress?'<div class="di df">'+di('Client Address',esc(c.clientAddress))+'</div>':'')
    +'</div>'
    +(c.issue?'<div style="margin-top:16px"><div class="dl" style="margin-bottom:6px">Issue Summary</div><div class="box">'+esc(c.issue)+'</div></div>':'')
  );

  // ── CASE ORIGIN ─────────────────────────────────────────────
  const ORIGIN = c.caseOrigin ? S('','Case Origin Category',
    '<div class="bdg bdg-inv" style="margin-bottom:12px">'+(OL[c.caseOrigin]||c.caseOrigin)+'</div>'
    +'<div class="dv">Matter originating from '+esc(OL[c.caseOrigin]||c.caseOrigin)+'.</div>'
  ) : '';
  
  // Year-wise breakdown for PDF
  let yearWiseHTML = '';
  if (c.yearWiseData && c.yearWiseData.length > 0) {
    yearWiseHTML = `
      <div style="margin-top:20px">
        <div style="font-size:9px;font-weight:800;color:#555;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Detailed Year-wise Breakdown</div>
        <table class="pt">
          <thead>
            <tr>
              <th style="font-size:9px">Financial Year</th>
              <th style="font-size:9px;text-align:right">Tax</th>
              <th style="font-size:9px;text-align:right">Interest</th>
              <th style="font-size:9px;text-align:right">Penalty</th>
              <th style="font-size:9px;text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${c.yearWiseData.map(y => `
              <tr>
                <td>${esc(y.period)}</td>
                <td style="text-align:right">${fmtAmt(y.tax || 0)}</td>
                <td style="text-align:right">${fmtAmt(y.interest || 0)}</td>
                <td style="text-align:right">${fmtAmt(y.penalty || 0)}</td>
                <td style="text-align:right;font-weight:700">${fmtAmt((y.tax || 0) + (y.interest || 0) + (y.penalty || 0))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ── AMOUNTS ─────────────────────────────────────────────────
  const AMTS = S('','Amount Involved',
    '<div class="ag">'
    +'<div class="ac"><div class="at">Tax</div><div class="av">'+fmtAmt(c.demandAmount)+'</div></div>'
    +'<div class="ac"><div class="at">Penalty</div><div class="av">'+fmtAmt(c.penaltyAmount)+'</div></div>'
    +'<div class="ac"><div class="at">Interest</div><div class="av">'+fmtAmt(c.interestAmount)+'</div></div>'
    +'<div class="ac"><div class="at">Other</div><div class="av">'+fmtAmt(c.otherAmount)+'</div></div>'
    +'<div class="ac tot"><div class="at">Total</div><div class="av">'+fmtAmt(total)+'</div></div>'
    +'</div>'
    + yearWiseHTML
  );

  // ── DATES ───────────────────────────────────────────────────
  const DATES = S('','Key Dates & Authority',
    // Authority block
    '<div class="dtg">'
    +'<div class="dti df" style="grid-column:span 2"><div class="dtl">Jurisdictional Authority</div><div class="dtv">'+(esc(_cfJurisdictionLabel(c.jurisdiction))||'\u2014')+'</div></div>'
    +'<div class="dti df" style="grid-column:span 2"><div class="dtl">Adjudicating / Appellate Authority</div><div class="dtv">'+(esc(c.authority)||'\u2014')+'</div></div>'
    +'</div>'

    // Adjudication
    +'<div class="sh" style="background:#b45309;margin-top:12px;font-size:10px">ADJUDICATION STAGE</div>'
    +'<div class="dtg">'
    +'<div class="dti"><div class="dtl">SCN Date (DRC-01)</div><div class="dtv">'+fmtD(c.scnDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">SCN Communication</div><div class="dtv">'+fmtD(c.scnCommDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">Online Filing (DRC-06)</div><div class="dtv">'+fmtD(c.onlineFilingDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">Physical Submission</div><div class="dtv">'+fmtD(c.physicalSubmitDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">PH Date (Sec 75(4))</div><div class="dtv">'+fmtD(c.phDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">PH Notice Ref</div><div class="dtv" style="font-family:monospace">'+(esc(c.phNoticeRef)||'\u2014')+'</div></div>'
    +'<div class="dti"><div class="dtl">OIO Date (DRC-07)</div><div class="dtv">'+fmtD(c.oioDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">OIO Communication</div><div class="dtv">'+fmtD(c.oioCommDate)+'</div></div>'
    +'</div>'

    // First Appeal
    +'<div class="sh" style="background:#6d28d9;margin-top:12px;font-size:10px">FIRST APPEAL STAGE</div>'
    +'<div class="dtg">'
    +'<div class="dti"><div class="dtl">APL-01 Filing Date</div><div class="dtv">'+fmtD(c.oiaDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">APL-01 ARN / Ref</div><div class="dtv" style="font-family:monospace">'+(esc(c.apl01Ref)||'\u2014')+'</div></div>'
    +'<div class="dti"><div class="dtl">Pre-Deposit (10%)</div><div class="dtv">'+(c.preDeposit?fmtAmt(c.preDeposit):'\u2014')+'</div></div>'
    +'<div class="dti"><div class="dtl">Appeal PH Date (Sec 107)</div><div class="dtv">'+fmtD(c.appealPhDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">Appeal PH Ref</div><div class="dtv" style="font-family:monospace">'+(esc(c.appealPhRef)||'\u2014')+'</div></div>'
    +'<div class="dti"><div class="dtl">OIA Date</div><div class="dtv">'+fmtD(c.oiaCommDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">OIA Communication</div><div class="dtv">'+fmtD(c.oiaOrderCommDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">OIA Ref No.</div><div class="dtv" style="font-family:monospace">'+(esc(c.oiaRef)||'\u2014')+'</div></div>'
    +'</div>'

    // Second Appeal / GSTAT
    +'<div class="sh" style="background:#4338ca;margin-top:12px;font-size:10px">SECOND APPEAL STAGE (GSTAT)</div>'
    +'<div class="dtg">'
    +'<div class="dti"><div class="dtl">APL-05 Filing Date</div><div class="dtv">'+fmtD(c.gstatAppealDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">GSTAT ARN / Ref</div><div class="dtv" style="font-family:monospace">'+(esc(c.gstatArn)||'\u2014')+'</div></div>'
    +'<div class="dti"><div class="dtl">Pre-Deposit (20%)</div><div class="dtv">'+(c.gstatPreDeposit?fmtAmt(c.gstatPreDeposit):'\u2014')+'</div></div>'
    +'<div class="dti"><div class="dtl">GSTAT PH Date (Sec 112)</div><div class="dtv">'+fmtD(c.gstatPhDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">GSTAT PH Ref</div><div class="dtv" style="font-family:monospace">'+(esc(c.gstatPhRef)||'\u2014')+'</div></div>'
    +'<div class="dti"><div class="dtl">Tribunal Order Date</div><div class="dtv">'+fmtD(c.gstatOrderDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">Tribunal Communication</div><div class="dtv">'+fmtD(c.gstatOrderCommDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">Tribunal Order Ref</div><div class="dtv" style="font-family:monospace">'+(esc(c.gstatOrderRef)||'\u2014')+'</div></div>'
    +'</div>'

    // Judicial Review
    +'<div class="sh" style="background:#991b1b;margin-top:12px;font-size:10px">JUDICIAL REVIEW</div>'
    +'<div class="dtg">'
    +'<div class="dti"><div class="dtl">HC Petition Date (Sec 117)</div><div class="dtv">'+fmtD(c.hcPetitionDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">Writ / HC Ref</div><div class="dtv" style="font-family:monospace">'+(esc(c.hcRef)||'\u2014')+'</div></div>'
    +'<div class="dti"><div class="dtl">HC Order Date</div><div class="dtv">'+fmtD(c.hcOrderDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">&nbsp;</div><div class="dtv"></div></div>'
    +'<div class="dti"><div class="dtl">SC / SLP Date (Sec 118)</div><div class="dtv">'+fmtD(c.scPetitionDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">SLP / SC Ref</div><div class="dtv" style="font-family:monospace">'+(esc(c.scRef)||'\u2014')+'</div></div>'
    +'<div class="dti"><div class="dtl">SC Order Date</div><div class="dtv">'+fmtD(c.scOrderDate)+'</div></div>'
    +'<div class="dti"><div class="dtl">&nbsp;</div><div class="dtv"></div></div>'
    +'</div>'
  );

  // ── CHECKLIST ───────────────────────────────────────────────
  const CHK = S('','Workflow Checklist',
    (cl.length===0 ? emptyMsg('No checklist configured.') :
    '<div class="pb"><div class="pf" style="width:'+clPct+'%"></div></div>'
    +'<table class="pt" style="margin-top:10px"><thead><tr>'
    +'<th style="width:50px">Code</th><th>Stage</th><th style="width:80px">Level</th><th style="width:100px;text-align:center">Status</th>'
    +'</tr></thead><tbody>'
    +cl.map(s=>'<tr><td style="font-family:monospace;font-weight:700">'+esc(s.code)+'</td>'
      +'<td><b>'+esc(s.name)+'</b></td><td>'+esc(s.level||'')+'</td>'
      +'<td style="text-align:center;font-weight:700">'+(s.status==='done'?'\u2713 DONE':s.status==='in-progress'?'IN PROGRESS':'PENDING')+'</td></tr>').join('')
    +'</tbody></table>')
  );

  // ── GROUNDS ─────────────────────────────────────────────────
  const genG = allG.filter(g=>g.category==='general');
  const spcG = allG.filter(g=>g.category!=='general');
  const GROUNDS = S('','Grounds of Defence',
    (allG.length===0 ? emptyMsg('No grounds configured.') :
    '<table class="pt"><thead><tr>'
    +'<th style="width:40px;text-align:center">#</th><th>Grounds Parameter</th><th style="width:100px;text-align:center">Applicable</th><th style="width:100px;text-align:center">Taken in Seq.</th>'
    +'</tr></thead><tbody>'
    +'<tr class="sh-row"><td colspan="4">General Grounds ('+genG.length+')</td></tr>'
    +genG.map((g,i)=>'<tr><td style="text-align:center;font-weight:700">'+(i+1)+'</td><td>'+esc(g.name)+'</td><td style="text-align:center">'+tick(g.applicable)+'</td><td style="text-align:center">'+tick(g.taken)+'</td></tr>').join('')
    +'<tr class="sh-row"><td colspan="4">Specific Grounds ('+spcG.length+')</td></tr>'
    +spcG.map((g,i)=>'<tr><td style="text-align:center;font-weight:700">'+(i+1)+'</td><td>'+esc(g.name)+'</td><td style="text-align:center">'+tick(g.applicable)+'</td><td style="text-align:center">'+tick(g.taken)+'</td></tr>').join('')
    +'</tbody></table>')
  );

  // ── ARGUMENT SEQUENCE ───────────────────────────────────────
  const SEQ = S('','Argument Sequence \u2014 Finalized Order',
    (seqList.length===0 ? emptyMsg('No arguments marked as taken.') :
    seqList.map((name,i)=>'<div class="si"><div class="sn">'+(i+1)+'</div><div class="st">'+esc(name)+'</div></div>').join(''))
  );

  // ── FACTS ───────────────────────────────────────────────────
  const genF = allF.filter(f=>f.category==='general');
  const spcF = allF.filter(f=>f.category!=='general');
  let factsHTML = '';
  if (allF.length === 0) {
    factsHTML = emptyMsg('No facts configured.');
  } else {
    if (genF.length > 0) {
      factsHTML += '<div class="cat">General Facts</div>';
      factsHTML += genF.map((f,i)=>'<div class="si"><div class="sn">'+(i+1)+'</div>'
        +'<div style="flex:1"><div class="st" style="margin-bottom:4px">'+esc(f.name)+'</div>'
        +'<div style="display:flex;gap:10px;font-size:10px;font-weight:700">'
        +(f.applicable?'<span>[APPLICABLE]</span>':'')
        +(f.taken?'<span>[TAKEN]</span>':'')
        +'</div>'
        +(f.details?'<div class="box" style="margin-top:8px">'+esc(f.details)+'</div>':'')
        +'</div></div>').join('');
    }
    if (spcF.length > 0) {
      factsHTML += '<div class="cat">Specific Facts</div>';
      factsHTML += spcF.map((f,i)=>'<div class="si"><div class="sn">'+(i+1)+'</div>'
        +'<div style="flex:1"><div class="st" style="margin-bottom:4px">'+esc(f.name)+'</div>'
        +'<div style="display:flex;gap:10px;font-size:10px;font-weight:700">'
        +(f.applicable?'<span>[APPLICABLE]</span>':'')
        +(f.taken?'<span>[TAKEN]</span>':'')
        +'</div>'
        +(f.details?'<div class="box" style="margin-top:8px">'+esc(f.details)+'</div>':'')
        +'</div></div>').join('');
    }
  }
  const FACTS = S('','Statement of Facts',factsHTML);

  // ── FACTS SEQUENCE ──────────────────────────────────────────
  const FSEQ = S('','Facts Sequence \u2014 Finalized Order',
    (factsSeq.length === 0 ? emptyMsg('No facts marked as taken yet.') :
    factsSeq.map((name,i)=>'<div class="si"><div class="sn">'+(i+1)+'</div><div class="st">'+esc(name)+'</div></div>').join(''))
  );

  // ── DOCUMENT TRACKER ────────────────────────────────────────
  const cmnD = docs.filter(d=>d.category==='common'||!d.category);
  const orgD = docs.filter(d=>d.category==='origin');
  const DOCS = S('','Document Tracker',
    (docs.length===0 ? emptyMsg('No documents configured.') :
    '<table class="pt"><thead><tr>'
    +'<th style="width:40px;text-align:center">#</th><th>Document Required</th><th style="width:80px;text-align:center">Physical</th><th style="width:80px;text-align:center">Soft Copy</th><th style="width:60px;text-align:center">N/A</th>'
    +'</tr></thead><tbody>'
    +'<tr class="sh-row"><td colspan="5">Common Documents</td></tr>'
    +cmnD.map((d,i)=>'<tr><td style="text-align:center;font-weight:700">'+(i+1)+'</td><td>'+esc(d.name)+'</td><td style="text-align:center">'+tick(d.physical)+'</td><td style="text-align:center">'+tick(d.soft)+'</td><td style="text-align:center">'+tick(d.na)+'</td></tr>').join('')
    +'<tr class="sh-row"><td colspan="5">Origin-Specific Documents</td></tr>'
    +orgD.map((d,i)=>'<tr><td style="text-align:center;font-weight:700">'+(i+1)+'</td><td>'+esc(d.name)+'</td><td style="text-align:center">'+tick(d.physical)+'</td><td style="text-align:center">'+tick(d.soft)+'</td><td style="text-align:center">'+tick(d.na)+'</td></tr>').join('')
    +'</tbody></table>')
  );

  // ── PENDING LIST ────────────────────────────────────────────
  const PLIST = S('','Pending List \u2014 Documents & Issues',
    (pending.length===0 ? emptyMsg('No pending items.') :
    '<table class="pt"><thead><tr>'
    +'<th style="width:100px">Date Added</th><th>Pending Requirement</th><th style="width:100px;text-align:center">Received?</th>'
    +'</tr></thead><tbody>'
    +pending.map(p=>'<tr><td>'+fmtD(p.date)+'</td><td><b>'+esc(p.text)+'</b></td><td style="text-align:center">'+tick(p.received)+'</td></tr>').join('')
    +'</tbody></table>')
  );

  // ── NOTES & UPDATES ─────────────────────────────────────────
  const NU = S('','Notes & Updates',
    '<div class="box" style="margin-bottom:16px;margin-top:0"><b>Initial Case Notes:</b><br/>'+(c.notes?esc(c.notes):'None provided.')+'</div>'
    +(notes.length===0 ? emptyMsg('No update logs.') :
      notes.map(n=>'<div class="ni"><div class="nd">'+fmtD(n.date)+'</div><div class="nt">'+esc(n.text)+'</div></div>').join('')
    )
  );

  // ── ASSEMBLE ────────────────────────────────────────────────
  const FOOT = '<div class="foot"><div>GST LITIGATION PRO &nbsp;&bull;&nbsp; INTERNAL CASE REPORT</div><div>PRINTED: '+esc(printed)+'</div></div>';

  const HTML = '<!DOCTYPE html><html lang="en"><head>'
    +'<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    +'<title>Case File \u2013 '+esc(c.caseNo)+'</title>'
    +'<style>'+CSS+'</style></head><body>'
    +COVER
    +'<div class="bw">'
    +TOC+SUMMARY+ASSIGN+DATES+AMTS+ORIGIN+CHK+GROUNDS+SEQ+FACTS+FSEQ+DOCS+PLIST+NU
    +FOOT
    +'</div>'
    +'<script>window.onload=function(){window.print();};<\/script>'
    +'</body></html>';

  const win = window.open('','_blank','width=960,height=760');
  if (!win) { if (typeof toast === 'function') toast('Pop-up blocked \u2014 allow pop-ups and try again.','warning'); return; }
  win.document.open();
  win.document.write(HTML);
  win.document.close();
};
