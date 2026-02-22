/* app.js */
document.addEventListener('DOMContentLoaded',()=>{
  loadState();
  splash();
  clock();
  applyAllSettings();
  buildParticles();
});

/* ---- Splash ---- */
function splash(){
  const fill=document.getElementById('splashFill');
  const pct=document.getElementById('splashPct');
  const status=document.getElementById('splashStatus');
  const steps=[
    {id:'sp1',p:25,msg:'تهيئة منظومة الأمان...'},
    {id:'sp2',p:50,msg:'تحميل قاعدة البيانات...'},
    {id:'sp3',p:75,msg:'تهيئة الخرائط التفاعلية...'},
    {id:'sp4',p:100,msg:'النظام جاهز للعمل!'}
  ];
  let i=0;
  const run=()=>{
    if(i>=steps.length){
      setTimeout(()=>{
        const sc=document.getElementById('splashScreen');
        sc.style.transition='opacity .7s';sc.style.opacity='0';
        setTimeout(()=>{sc.classList.add('hidden');document.getElementById('app').classList.remove('hidden');initApp()},700);
      },500);return;
    }
    const st=steps[i];
    if(i>0){const prev=document.getElementById(steps[i-1].id);if(prev){prev.classList.remove('active');prev.classList.add('done')}}
    const cur=document.getElementById(st.id);if(cur)cur.classList.add('active');
    fill.style.width=st.p+'%';pct.textContent=st.p+'%';status.textContent=st.msg;
    i++;setTimeout(run,700);
  };
  setTimeout(run,400);
}

function buildParticles(){
  const c=document.getElementById('splashParticles');if(!c)return;
  for(let i=0;i<25;i++){
    const p=document.createElement('div');
    p.className='splash-particle';
    p.style.left=Math.random()*100+'%';
    p.style.animationDuration=(4+Math.random()*6)+'s';
    p.style.animationDelay=(Math.random()*5)+'s';
    p.style.setProperty('--dx',(Math.random()*120-60)+'px');
    c.appendChild(p);
  }
}

function initApp(){
  nav('dashboard');
  updateNavBadge();
  updateSettingsInfo();
}

/* ---- Navigation ---- */
const PAGE_LABELS={dashboard:'لوحة التحكم',newReport:'تقرير جديد',documents:'أرشيف المستندات',templates:'مكتبة القوالب',maps:'الخرائط العسكرية',stamps:'مصمم الأختام',designer:'مصمم المستندات',qrManager:'مدير QR والباركود',statistics:'الإحصاءات والتحليلات',settings:'إعدادات النظام',about:'بطاقة المطور'};

function nav(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
  const pg=document.getElementById('page-'+page);if(pg)pg.classList.add('active');
  const nl=document.querySelector(`.nav-link[data-page="${page}"]`);if(nl)nl.classList.add('active');
  const bc=document.getElementById('bcPage');if(bc)bc.textContent=PAGE_LABELS[page]||page;
  S.currentPage=page;
  if(window.innerWidth<=960)document.getElementById('sidebar').classList.remove('mobile-open');
  if(page==='dashboard')renderDashboard();
  else if(page==='newReport')initNewReport();
  else if(page==='documents')renderDocs();
  else if(page==='templates')renderTemplates();
  else if(page==='maps')initMap();
  else if(page==='stamps')initStamps();
  else if(page==='designer')initDesigner();
  else if(page==='qrManager')initQR();
  else if(page==='statistics')renderStats();
  else if(page==='settings')initSettingsPage();
}

function filterNav(q){
  document.querySelectorAll('.nav-link').forEach(l=>{
    const txt=l.querySelector('span')?.textContent||'';
    l.style.display=q&&!txt.includes(q)?'none':'flex';
  });
}

/* ---- Sidebar ---- */
document.getElementById('sbToggle').onclick=()=>document.getElementById('sidebar').classList.toggle('collapsed');
function toggleMobileSb(){document.getElementById('sidebar').classList.toggle('mobile-open')}

/* ---- Theme ---- */
function toggleTheme(){
  const isDark=document.body.classList.contains('theme-dark');
  applyTheme(isDark?'light':'dark');
  S.settings.theme=isDark?'light':'dark';
  saveState();
}
function applyTheme(t){
  document.body.className=document.body.className.replace('theme-dark','').replace('theme-light','').trim();
  document.body.classList.add('theme-'+t);
  const ico=document.getElementById('themeIco');
  if(ico)ico.className=t==='dark'?'fas fa-moon':'fas fa-sun';
  const sel=document.getElementById('sTheme');if(sel)sel.value=t;
}

function previewColor(c){document.documentElement.style.setProperty('--primary',c)}
function previewFont(f){document.body.style.fontFamily=`'${f}',sans-serif`}
function applyAllSettings(){
  applyTheme(S.settings.theme||'dark');
  previewFont(S.settings.font||'Cairo');
  if(S.settings.primary)previewColor(S.settings.primary);
  const u=document.getElementById('sbUsername');if(u)u.textContent=S.settings.orgName||'مستخدم النظام';
}

/* ---- Clock ---- */
function clock(){
  const tick=()=>{
    const now=new Date();
    const t=document.getElementById('tbTime');
    const d=document.getElementById('tbDate');
    if(t)t.textContent=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    if(d)d.textContent=`${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
  };
  tick();setInterval(tick,1000);
}

/* ---- Badge ---- */
function updateNavBadge(){
  const b=document.getElementById('navBadge');
  if(b)b.textContent=S.reports.length;
}

/* ---- Report Zoom ---- */
function changeZoom(d){
  S.previewZoom=Math.min(1.4,Math.max(0.5,S.previewZoom+d));
  const w=document.getElementById('previewWrap');
  if(w)w.style.transform=`scale(${S.previewZoom})`;
  const l=document.getElementById('zoomLbl');
  if(l)l.textContent=Math.round(S.previewZoom*100)+'%';
}

/* ---- Misc ---- */
function refreshDashboard(){renderDashboard();toast('تم التحديث','success')}
function useTemplateQuick(type){nav('templates');setTimeout(()=>useTpl(type),200)}
function saveDraft(){
  const t=document.getElementById('fTitle')?.value;
  if(!t){toast('أضف عنواناً أولاً','warn');return}
  toast('تم حفظ المسودة','success')}
