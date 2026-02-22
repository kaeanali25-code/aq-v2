/* =====================================================
   state.js — الجندي المجهول AQ v2.0
   ===================================================== */
const S = {
  reports: [],
  drafts: [],
  settings: {
    orgName:'القوات المسلحة اليمنية',
    command:'القيادة العامة للقوات المسلحة',
    country:'الجمهورية اليمنية',
    slogan:'',
    startNum:1001,
    primary:'#c9a227',
    font:'Cairo',
    theme:'dark',
    paper:'a4',
    orient:'portrait',
    access:'secret',
    autoQR:true,
    pageNum:true,
    printHeader:true,
    encrypt:true,
    animations:true,
    nSave:true,
    nDelete:true,
    nExport:false,
    password:'',
    lastSave:null
  },
  counter:1001,
  currentPage:'dashboard',
  mapElements:[],
  stampCfg:{shape:'circle',main:'رسمي',top:'القوات المسلحة اليمنية',bot:'وزارة الدفاع',unit:'2026',color:'#c41e3a',size:200,style:'classic',stars:3},
  dsnZoom:1,
  dsnHistory:[],
  dsnFuture:[],
  docView:'grid',
  ctxTarget:null,
  previewZoom:1
};

/* ---- Lookups ---- */
const TYPE_LABEL={ops:'عمليات',int:'استخبارات',log:'لوجستي',med:'طبي',scout:'استطلاع',com:'اتصالات',eng:'هندسي',sec:'أمني',eom:'نهاية مهمة',memo:'مذكرة',daily:'يومي',inc:'حادثة'};
const TYPE_ICON={ops:'fas fa-crosshairs',int:'fas fa-user-secret',log:'fas fa-truck-fast',med:'fas fa-kit-medical',scout:'fas fa-binoculars',com:'fas fa-radio',eng:'fas fa-hard-hat',sec:'fas fa-shield-halved',eom:'fas fa-flag-checkered',memo:'fas fa-file-pen',daily:'fas fa-calendar-day',inc:'fas fa-triangle-exclamation'};
const TYPE_PREFIX={ops:'OPS',int:'INT',log:'LOG',med:'MED',scout:'SCT',com:'COM',eng:'ENG',sec:'SEC',eom:'EOM',memo:'MEM',daily:'DLY',inc:'INC'};
const PRIO_LABEL={routine:'روتيني',priority:'ذو أولوية',immediate:'فوري',flash:'فلاش'};
const PRIO_COLOR={routine:'#27ae60',priority:'#f39c12',immediate:'#e74c3c',flash:'#c0392b'};
const SECRET_LABEL={public:'غير سري',limited:'محدود التداول',secret:'سري',top_secret:'سري للغاية',classified:'سري جداً'};
const SECRET_COLOR={public:'#27ae60',limited:'#f39c12',secret:'#e74c3c',top_secret:'#c0392b',classified:'#7b0000'};
const CHART_COLORS=['#c9a227','#2980b9','#27ae60','#e74c3c','#9b59b6','#f39c12','#1abc9c','#e67e22','#3498db','#e91e63','#00bcd4','#ff5722'];

/* ---- Persistence ---- */
function loadState(){
  try{
    const d=localStorage.getItem('aq_v2');
    if(d){const p=JSON.parse(d);
      if(p.reports)S.reports=p.reports;
      if(p.drafts)S.drafts=p.drafts;
      if(p.settings)S.settings={...S.settings,...p.settings};
      if(p.counter)S.counter=p.counter;
    }
  }catch(e){console.warn('loadState:',e)}
}
function saveState(){
  try{
    S.settings.lastSave=new Date().toISOString();
    localStorage.setItem('aq_v2',JSON.stringify({reports:S.reports,drafts:S.drafts,settings:S.settings,counter:S.counter}));
    updateSettingsInfo();
  }catch(e){console.warn('saveState:',e)}
}

/* ---- Report Number ---- */
function genNum(type){
  const pre=TYPE_PREFIX[type]||'RPT';
  const now=new Date();
  const ds=now.getFullYear()+String(now.getMonth()+1).padStart(2,'0');
  return`${pre}-${ds}-${S.counter++}`;
}
