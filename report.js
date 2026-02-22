/* report.js */
function initNewReport(){
  const now=new Date();
  const di=document.getElementById('fDate');if(di&&!di.value)di.value=now.toISOString().split('T')[0];
  const ti=document.getElementById('fTime');if(ti&&!ti.value)ti.value=now.toTimeString().slice(0,5);
  const ni=document.getElementById('fNumber');if(ni&&!ni.value)ni.value=genNum(document.getElementById('fType')?.value||'ops');
  const ui=document.getElementById('fUnit');if(ui&&!ui.value)ui.value=S.settings.orgName||'';
  livePreview();
}

function onTypeChange(){
  const t=document.getElementById('fType')?.value||'ops';
  document.getElementById('fNumber').value=genNum(t);
  livePreview();
}
function regenNumber(){
  document.getElementById('fNumber').value=genNum(document.getElementById('fType')?.value||'ops');
}

function g(id){return document.getElementById(id)?.value||''}
function gc(id){return document.getElementById(id)?.checked||false}

function livePreview(){
  const type=g('fType')||'ops';
  const secret=g('fSecret')||'public';
  const priority=g('fPriority')||'routine';
  const unit=g('fUnit');const milNum=g('fMilNum');
  const rank=g('fRank');const commander=g('fCommander');
  const date=g('fDate');const time=g('fTime');const tz=g('fTZ');
  const loc=g('fLocation');const number=g('fNumber');
  const title=g('fTitle')||'عنوان التقرير';
  const summary=g('fSummary');const details=g('fDetails');
  const achieved=g('fAchieved');const reco=g('fReco');const notes=g('fNotes');
  const stampType=g('fStamp');const stampText=g('fStampText');
  const showQR=gc('chkQR');const showBC=gc('chkBarcode');
  const showWM=gc('chkWatermark');const showSB=gc('chkSecBar');
  const showHeader=gc('chkHeader');
  const author=g('fAuthor');const reviewer=g('fReviewer');const approver=g('fApprover');
  const org=S.settings.orgName||'القوات المسلحة اليمنية';
  const cmd=S.settings.command||'';
  const secColor=SECRET_COLOR[secret]||'#555';
  const prioColor=PRIO_COLOR[priority]||'#555';

  let html='';
  if(showHeader){
    if(secret!=='public')html+=`<div class="dp-secret-bar" style="background:${secColor}">${SECRET_LABEL[secret]||secret}</div>`;
    html+=`<div class="dp-header"><div class="dp-org">${esc(org)} &bull; ${esc(cmd)}</div><div class="dp-type">${TYPE_LABEL[type]||type}</div><div class="dp-badges"><span class="dp-badge" style="background:${prioColor}">${PRIO_LABEL[priority]||priority}</span><span class="dp-badge" style="background:${secColor}">${SECRET_LABEL[secret]||secret}</span></div></div>`;
  }
  html+=`<div class="dp-meta-grid">
    <div class="dp-meta-item"><strong>رقم التقرير:</strong> <span>${esc(number)}</span></div>
    <div class="dp-meta-item"><strong>التاريخ:</strong> <span>${fmtDate(date)}</span></div>
    <div class="dp-meta-item"><strong>الوقت:</strong> <span>${fmtTime(time)} ${esc(tz)}</span></div>
    <div class="dp-meta-item"><strong>الوحدة:</strong> <span>${esc(unit)}</span></div>
    <div class="dp-meta-item"><strong>الرقم العسكري:</strong> <span>${esc(milNum)}</span></div>
    <div class="dp-meta-item"><strong>القائد:</strong> <span>${esc(rank)} ${esc(commander)}</span></div>
    <div class="dp-meta-item"><strong>الموقع:</strong> <span>${esc(loc)}</span></div>
    <div class="dp-meta-item"><strong>النوع:</strong> <span>${TYPE_LABEL[type]||type}</span></div>
  </div>`;
  html+=`<hr class="dp-divider"><h2 class="dp-title">${esc(title)}</h2>`;
  if(showSB)html+=`<div class="dp-sec-banner"></div>`;
  if(summary)html+=`<div class="dp-section"><div class="dp-sec-head">الملخص التنفيذي</div><div class="dp-sec-body">${nl2br(esc(summary))}</div></div>`;
  if(details)html+=`<div class="dp-section"><div class="dp-sec-head">تفاصيل التقرير</div><div class="dp-sec-body">${nl2br(esc(details))}</div></div>`;
  if(achieved)html+=`<div class="dp-section"><div class="dp-sec-head">الأهداف المنجزة</div><div class="dp-sec-body">${nl2br(esc(achieved))}</div></div>`;
  if(reco)html+=`<div class="dp-section"><div class="dp-sec-head">التوصيات</div><div class="dp-sec-body">${nl2br(esc(reco))}</div></div>`;
  if(notes)html+=`<div class="dp-section"><div class="dp-sec-head">ملاحظات</div><div class="dp-sec-body">${nl2br(esc(notes))}</div></div>`;
  // Signature
  html+=`<div class="dp-footer">
    <div class="dp-sig-box"><div class="dp-sig-line">${esc(rank)} ${esc(commander)}<br><small style="color:#888">${esc(unit)}</small></div><div style="font-size:10px;color:#aaa;margin-top:4px">محرر التقرير: ${esc(author)}</div></div>
    <div class="dp-sig-box"><div class="dp-sig-line">المراجع<br><small style="color:#888">${esc(reviewer)||'_______________'}</small></div></div>
    <div class="dp-sig-box"><div class="dp-sig-line">المعتمد<br><small style="color:#888">${esc(approver)||'_______________'}</small></div></div>
    ${showQR?`<div class="dp-qr-wrap"><div style="width:70px;height:70px;background:#1a1a2e;display:flex;align-items:center;justify-content:center;border-radius:4px;margin:0 auto 4px"><span style="color:#c9a227;font-size:28px">▣</span></div><div style="font-size:9px;color:#aaa">${esc(number)}</div></div>`:''}
  </div>`;
  html+=`<div style="text-align:center;font-size:9px;color:#bbb;margin-top:8px;letter-spacing:2px">الجندي المجهول AQ &bull; نظام التقارير العسكرية v2.0 &bull; &copy; 2026 علي قتيبة</div>`;
  if(showWM)html+=`<div class="dp-watermark">${SECRET_LABEL[secret]||'سري'}</div>`;
  if(stampType&&stampType!=='none')html+=buildStampOverlay(stampType,stampText);
  document.getElementById('docPreview').innerHTML=html;
}

function buildStampOverlay(type,txt){
  const cfg={official:{c:'#1a3a5c',t:txt||'رسمي'},secret:{c:'#c0392b',t:txt||'سري'},approved:{c:'#1a6b3c',t:txt||'معتمد'},urgent:{c:'#e67e22',t:txt||'عاجل'},classified:{c:'#7b0000',t:txt||'مصنف'}};
  const s=cfg[type]||cfg.official;
  return`<div class="dp-stamp-wrap"><svg width="100" height="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="none" stroke="${s.c}" stroke-width="3.5"/>
    <circle cx="50" cy="50" r="39" fill="none" stroke="${s.c}" stroke-width="1.5"/>
    <text x="50" y="55" text-anchor="middle" font-family="Cairo,sans-serif" font-size="16" font-weight="900" fill="${s.c}">${esc(s.t)}</text>
    <text x="50" y="76" text-anchor="middle" font-family="Cairo,sans-serif" font-size="7" fill="${s.c}">القوات المسلحة اليمنية</text>
  </svg></div>`;
}

function clearForm(){
  ['fTitle','fSummary','fDetails','fAchieved','fReco','fNotes','fUnit','fMilNum','fCommander','fStampText','fLocation','fAuthor','fReviewer','fApprover'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
  const defaults={fType:'ops',fSecret:'secret',fPriority:'routine',fRank:'',fStamp:'none',fTZ:'+03:00 صنعاء'};
  Object.entries(defaults).forEach(([id,val])=>{const el=document.getElementById(id);if(el)el.value=val});
  ['chkQR','chkBarcode'].forEach(id=>{const el=document.getElementById(id);if(el)el.checked=false});
  ['chkWatermark','chkSecBar','chkHeader'].forEach(id=>{const el=document.getElementById(id);if(el)el.checked=true});
  document.getElementById('fNumber').value=genNum('ops');
  const now=new Date();
  document.getElementById('fDate').value=now.toISOString().split('T')[0];
  document.getElementById('fTime').value=now.toTimeString().slice(0,5);
  document.getElementById('fUnit').value=S.settings.orgName||'';
  livePreview();
  toast('تم مسح النموذج','info');
}

function saveReport(){
  const title=g('fTitle');
  if(!title.trim()){toast('يرجى إدخال عنوان التقرير','error');return}
  const r={
    id:Date.now(),number:g('fNumber'),type:g('fType'),secret:g('fSecret'),priority:g('fPriority'),
    unit:g('fUnit'),milNum:g('fMilNum'),rank:g('fRank'),commander:g('fCommander'),
    date:g('fDate'),time:g('fTime'),tz:g('fTZ'),location:g('fLocation'),
    title,summary:g('fSummary'),details:g('fDetails'),achieved:g('fAchieved'),reco:g('fReco'),notes:g('fNotes'),
    stampType:g('fStamp'),stampText:g('fStampText'),
    hasQR:gc('chkQR'),hasBC:gc('chkBarcode'),hasWM:gc('chkWatermark'),hasSB:gc('chkSecBar'),hasHeader:gc('chkHeader'),
    author:g('fAuthor'),reviewer:g('fReviewer'),approver:g('fApprover'),
    savedAt:new Date().toISOString()
  };
  S.reports.push(r);
  saveState();updateNavBadge();
  toast(`تم حفظ التقرير: ${r.number}`,'success');
  document.getElementById('fNumber').value=genNum(g('fType')||'ops');
}

function viewDocReport(id){
  const r=S.reports.find(x=>x.id===id);if(!r)return;
  nav('newReport');
  setTimeout(()=>{
    const map={fNumber:'number',fType:'type',fSecret:'secret',fPriority:'priority',fUnit:'unit',fMilNum:'milNum',fRank:'rank',fCommander:'commander',fDate:'date',fTime:'time',fLocation:'location',fTitle:'title',fSummary:'summary',fDetails:'details',fAchieved:'achieved',fReco:'reco',fNotes:'notes',fStamp:'stampType',fStampText:'stampText',fAuthor:'author',fReviewer:'reviewer',fApprover:'approver'};
    Object.entries(map).forEach(([eid,rk])=>{const el=document.getElementById(eid);if(el&&r[rk]!==undefined)el.value=r[rk]||''});
    const checks={chkQR:'hasQR',chkBarcode:'hasBC',chkWatermark:'hasWM',chkSecBar:'hasSB',chkHeader:'hasHeader'};
    Object.entries(checks).forEach(([eid,rk])=>{const el=document.getElementById(eid);if(el)el.checked=!!r[rk]});
    livePreview();
  },150);
}

function duplicateReport(id){
  const r=S.reports.find(x=>x.id===id);if(!r)return;
  const copy={...r,id:Date.now(),number:genNum(r.type),savedAt:new Date().toISOString()};
  S.reports.push(copy);saveState();updateNavBadge();
  toast(`تم نسخ التقرير: ${copy.number}`,'success');
  renderDocs();
}

function deleteReport(id){
  const r=S.reports.find(x=>x.id===id);if(!r)return;
  modal('حذف التقرير',`<p style="color:var(--text-s)">هل تريد حذف التقرير: <strong>${esc(r.number)}</strong>؟</p>`,()=>{
    S.reports=S.reports.filter(x=>x.id!==id);
    saveState();updateNavBadge();
    if(S.currentPage==='documents')renderDocs();
    else if(S.currentPage==='dashboard')renderDashboard();
    toast('تم حذف التقرير','success');
  },'حذف');
}
