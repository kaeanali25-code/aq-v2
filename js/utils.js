/* utils.js */
function fmtDate(d){if(!d)return'--/--/----';try{const dt=new Date(d+'T00:00:00');return`${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`}catch{return d}}
function fmtTime(t){return t||'--:--'}
function trunc(s,n=50){return s&&s.length>n?s.slice(0,n)+'...':s||''}
function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function nl2br(s){return(s||'').replace(/\n/g,'<br>')}
function dataSize(){try{const s=localStorage.getItem('aq_v2')||'';return(s.length/1024).toFixed(1)+' KB'}catch{return'0 KB'}}

/* RoundRect polyfill */
if(!CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
    if(typeof r==='number')r=[r,r,r,r];
    else if(Array.isArray(r)&&r.length===1)r=[r[0],r[0],r[0],r[0]];
    else if(!Array.isArray(r))r=[0,0,0,0];
    this.beginPath();
    this.moveTo(x+r[0],y);
    this.lineTo(x+w-r[1],y);this.quadraticCurveTo(x+w,y,x+w,y+r[1]);
    this.lineTo(x+w,y+h-r[2]);this.quadraticCurveTo(x+w,y+h,x+w-r[2],y+h);
    this.lineTo(x+r[3],y+h);this.quadraticCurveTo(x,y+h,x,y+h-r[3]);
    this.lineTo(x,y+r[0]);this.quadraticCurveTo(x,y,x+r[0],y);
    this.closePath();return this;
  };
}

/* Toast */
function toast(msg,type='info',dur=3200){
  const c=document.getElementById('toastContainer');
  const icons={success:'fa-check-circle',error:'fa-times-circle',info:'fa-info-circle',warn:'fa-exclamation-triangle'};
  const t=document.createElement('div');
  t.className=`toast ${type}`;
  t.innerHTML=`<i class="fas ${icons[type]||icons.info} ${type}"></i><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(()=>{t.style.animation='toastIn .3s ease reverse';setTimeout(()=>t.remove(),280)},dur);
}

/* Modal */
let _modalOK=null;
function modal(title,body,okFn,okTxt='تأكيد',okClass='btn-danger'){
  document.getElementById('modalTitle').textContent=title;
  document.getElementById('modalBody').innerHTML=body;
  const btn=document.getElementById('modalOkBtn');
  btn.textContent=okTxt;btn.className=`btn ${okClass}`;
  _modalOK=okFn;
  document.getElementById('modalOverlay').classList.add('active');
}
function closeModal(){document.getElementById('modalOverlay').classList.remove('active');_modalOK=null}
document.getElementById('modalOkBtn').onclick=()=>{if(_modalOK)_modalOK();closeModal()};

/* Context menu */
let _ctxId=null;
function showCtx(e,id){
  e.preventDefault();_ctxId=id;
  const m=document.getElementById('ctxMenu');
  m.style.display='block';m.style.top=e.clientY+'px';m.style.right=(window.innerWidth-e.clientX)+'px';
}
document.addEventListener('click',()=>{document.getElementById('ctxMenu').style.display='none'});
function ctxView(){if(_ctxId)viewDocReport(_ctxId)}
function ctxPrint(){if(_ctxId){viewDocReport(_ctxId);setTimeout(()=>printReport(),600)}}
function ctxDuplicate(){if(_ctxId)duplicateReport(_ctxId)}
function ctxDelete(){if(_ctxId)deleteReport(_ctxId)}

/* Animate number */
function animNum(id,target,dur=600){
  const el=document.getElementById(id);if(!el)return;
  let start=null,from=0;
  const step=ts=>{if(!start)start=ts;const p=Math.min((ts-start)/dur,1);el.textContent=Math.round(from+(target-from)*p);if(p<1)requestAnimationFrame(step)};
  requestAnimationFrame(step);
}

/* Keyboard shortcuts */
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
  if((e.ctrlKey||e.metaKey)&&e.key==='n'){e.preventDefault();nav('newReport')}
  if((e.ctrlKey||e.metaKey)&&e.key==='d'){e.preventDefault();nav('dashboard')}
  if((e.ctrlKey||e.metaKey)&&e.key==='f'){e.preventDefault();nav('documents')}
});

/* Resize */
window.addEventListener('resize',()=>{
  if(S.currentPage==='maps'&&mapState.canvas){
    const c=mapState.canvas,p=c.parentElement;
    c.width=p.clientWidth;c.height=p.clientHeight;
    redrawMap();
  }
});

/* Print helpers */
function buildPrintWindow(html){
  const w=window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
  <style>body{font-family:'Cairo',sans-serif;margin:0;padding:20px;background:#fff;color:#1a1a2e;direction:rtl}@media print{body{padding:0}}</style></head><body>${html}<script>window.onload=()=>{window.print();window.close()}<\/script></body></html>`);
  w.document.close();
}
function printReport(){buildPrintWindow(document.getElementById('docPreview').innerHTML)}
function printDsn(){buildPrintWindow(document.getElementById('dsnPage').innerHTML)}

/* PDF Export */
async function exportPDF(){
  if(typeof html2canvas==='undefined'){toast('مكتبة PDF غير متاحة','error');return}
  toast('جاري تصدير PDF...','info');
  try{
    const el=document.getElementById('docPreview');
    const cv=await html2canvas(el,{scale:2,backgroundColor:'#fff',useCORS:true});
    const img=cv.toDataURL('image/jpeg',.95);
    const{jsPDF}=window.jspdf||{};
    if(!jsPDF){toast('jsPDF غير محمل','error');return}
    const pdf=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
    const pw=pdf.internal.pageSize.getWidth();
    const ph=(cv.height*pw)/cv.width;
    pdf.addImage(img,'JPEG',0,0,pw,ph);
    const num=document.getElementById('fNumber')?.value||'report';
    pdf.save(`${num}.pdf`);
    toast('تم تصدير PDF بنجاح','success');
  }catch(err){toast('خطأ في تصدير PDF','error');console.error(err)}
}

async function exportDsnPDF(){
  if(typeof html2canvas==='undefined'){toast('مكتبة PDF غير متاحة','error');return}
  toast('جاري تصدير PDF...','info');
  try{
    const el=document.getElementById('dsnPage');
    const cv=await html2canvas(el,{scale:2,backgroundColor:'#fff',useCORS:true});
    const img=cv.toDataURL('image/jpeg',.95);
    const{jsPDF}=window.jspdf||{};
    if(!jsPDF){toast('jsPDF غير محمل','error');return}
    const pdf=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
    const pw=pdf.internal.pageSize.getWidth();
    const ph=(cv.height*pw)/cv.width;
    pdf.addImage(img,'JPEG',0,0,pw,ph);
    pdf.save(`document-${Date.now()}.pdf`);
    toast('تم تصدير PDF','success');
  }catch(err){toast('خطأ في تصدير PDF','error')}
}

function exportData(){
  const data={reports:S.reports,drafts:S.drafts,settings:S.settings,counter:S.counter,exported:new Date().toISOString(),version:'2.0'};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`aq-data-${Date.now()}.json`;a.click();
  URL.revokeObjectURL(url);
  toast('تم تصدير البيانات','success');
}
function triggerImport(){document.getElementById('importInput').click()}
function doImport(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{
    try{
      const d=JSON.parse(ev.target.result);
      if(d.reports)S.reports=d.reports;
      if(d.drafts)S.drafts=d.drafts;
      if(d.settings)S.settings={...S.settings,...d.settings};
      if(d.counter)S.counter=d.counter;
      saveState();updateNavBadge();
      toast(`تم استيراد ${d.reports?.length||0} تقرير`,'success');
      nav(S.currentPage);
    }catch(err){toast('خطأ في قراءة الملف','error')}
  };
  r.readAsText(f);e.target.value='';
}
function exportAllPDF(){toast('سيتم تصدير جميع التقارير قريباً','info')}
function confirmClearAll(){
  modal('مسح جميع البيانات','<p style="color:var(--text-s)">هل أنت متأكد؟ سيتم حذف جميع التقارير والبيانات ولا يمكن التراجع عن هذا الإجراء.</p>',()=>{
    S.reports=[];S.drafts=[];S.counter=S.settings.startNum||1001;
    saveState();updateNavBadge();renderDashboard();
    toast('تم مسح جميع البيانات','success');
  },'مسح الكل');
}

function updateSettingsInfo(){
  const el1=document.getElementById('settDocsCount');
  const el2=document.getElementById('settDataSize');
  const el3=document.getElementById('settLastSave');
  if(el1)el1.textContent=S.reports.length;
  if(el2)el2.textContent=dataSize();
  if(el3)el3.textContent=S.settings.lastSave?fmtDate(S.settings.lastSave.split('T')[0]):'-';
}

console.log('%c 🛡 الجندي المجهول AQ v2.0 ','background:#c9a227;color:#000;font-size:16px;font-weight:900;padding:6px 14px;border-radius:4px');
console.log('%c تطوير: علي قتيبة © 2026 ','color:#c9a227;font-size:12px');
