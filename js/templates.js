/* templates.js */
const TEMPLATES=[
  {id:'ops',icon:'fas fa-crosshairs',name:'تقرير عمليات',desc:'للعمليات العسكرية الميدانية',priority:'immediate',secret:'secret'},
  {id:'int',icon:'fas fa-user-secret',name:'تقرير استخباراتي',desc:'للمعلومات والاستخبارات',priority:'immediate',secret:'classified'},
  {id:'log',icon:'fas fa-truck-fast',name:'تقرير لوجستي',desc:'للإمداد والتموين والموارد',priority:'priority',secret:'limited'},
  {id:'med',icon:'fas fa-kit-medical',name:'تقرير طبي',desc:'للخدمات الطبية الميدانية',priority:'priority',secret:'public'},
  {id:'scout',icon:'fas fa-binoculars',name:'تقرير استطلاع',desc:'لعمليات الاستطلاع والمراقبة',priority:'immediate',secret:'secret'},
  {id:'com',icon:'fas fa-radio',name:'تقرير اتصالات',desc:'لشبكات الاتصالات العسكرية',priority:'priority',secret:'limited'},
  {id:'eng',icon:'fas fa-hard-hat',name:'تقرير هندسي',desc:'للأعمال الهندسية والتحصينات',priority:'routine',secret:'limited'},
  {id:'sec',icon:'fas fa-shield-halved',name:'تقرير أمني',desc:'للشؤون الأمنية والمخاطر',priority:'immediate',secret:'secret'},
  {id:'eom',icon:'fas fa-flag-checkered',name:'تقرير نهاية مهمة',desc:'تقييم ختام المهام العسكرية',priority:'routine',secret:'limited'},
  {id:'memo',icon:'fas fa-file-pen',name:'مذكرة رسمية',desc:'للمراسلات الرسمية بين الوحدات',priority:'routine',secret:'limited'},
  {id:'daily',icon:'fas fa-calendar-day',name:'تقرير يومي',desc:'لمتابعة النشاط اليومي',priority:'routine',secret:'public'},
  {id:'inc',icon:'fas fa-triangle-exclamation',name:'تقرير حادثة',desc:'لتوثيق الحوادث والطوارئ',priority:'flash',secret:'secret'}
];

function renderTemplates(){
  const g=document.getElementById('templatesGrid');if(!g)return;
  g.innerHTML=TEMPLATES.map(t=>`
    <div class="tpl-card anim-up">
      <div class="tpl-icon"><i class="${t.icon}"></i></div>
      <div class="tpl-name">${t.name}</div>
      <div class="tpl-desc">${t.desc}</div>
      <div style="display:flex;gap:6px;margin-top:12px;align-items:center">
        <span class="badge b-${t.priority}" style="font-size:10px">${PRIO_LABEL[t.priority]||t.priority}</span>
        <span class="badge b-${t.secret}" style="font-size:10px">${SECRET_LABEL[t.secret]||t.secret}</span>
      </div>
      <button class="tpl-use" onclick="useTpl('${t.id}')"><i class="fas fa-arrow-left"></i> استخدام القالب</button>
    </div>
  `).join('');
}

function useTpl(type){
  const tpl=TEMPLATES.find(t=>t.id===type);
  nav('newReport');
  setTimeout(()=>{
    const now=new Date();
    document.getElementById('fType').value=type;
    document.getElementById('fNumber').value=genNum(type);
    document.getElementById('fDate').value=now.toISOString().split('T')[0];
    document.getElementById('fTime').value=now.toTimeString().slice(0,5);
    document.getElementById('fUnit').value=S.settings.orgName||'';
    if(tpl){
      document.getElementById('fPriority').value=tpl.priority||'routine';
      document.getElementById('fSecret').value=tpl.secret||'limited';
    }
    const titleDefaults={ops:'تقرير العمليات اليومية',int:'تقرير استخباراتي',log:'تقرير الإمداد والتموين',med:'تقرير الخدمات الطبية',scout:'تقرير الاستطلاع الميداني',com:'تقرير شبكة الاتصالات',eng:'تقرير الأعمال الهندسية',sec:'تقرير الوضع الأمني',eom:'تقرير ختام المهمة',memo:'مذكرة رسمية',daily:'التقرير اليومي',inc:'تقرير الحادثة الطارئة'};
    const titEl=document.getElementById('fTitle');
    if(titEl&&!titEl.value)titEl.value=titleDefaults[type]||'';
    livePreview();
    toast(`تم تحميل قالب: ${TYPE_LABEL[type]||type}`,'success');
  },200);
}
