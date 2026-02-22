/* documents.js */
function renderDocs(){
  const q=(document.getElementById('docsQ')?.value||'').toLowerCase();
  const tf=document.getElementById('docsTypeF')?.value||'';
  const pf=document.getElementById('docsPrioF')?.value||'';
  let rpts=[...S.reports].reverse();
  if(q)rpts=rpts.filter(r=>(r.title||'').toLowerCase().includes(q)||(r.number||'').toLowerCase().includes(q)||(r.unit||'').toLowerCase().includes(q));
  if(tf)rpts=rpts.filter(r=>r.type===tf);
  if(pf)rpts=rpts.filter(r=>r.priority===pf);
  const cnt=document.getElementById('docsCount');if(cnt)cnt.textContent=`${rpts.length} مستند`;
  const c=document.getElementById('docsContainer');if(!c)return;
  if(!rpts.length){
    c.innerHTML=`<div class="docs-empty"><i class="fas fa-folder-open"></i><p>${S.reports.length?'لا توجد نتائج مطابقة':'لا توجد مستندات محفوظة بعد'}</p>${!S.reports.length?'<button class="btn btn-primary" onclick="nav(\'newReport\')"><i class="fas fa-plus"></i> إنشاء أول تقرير</button>':''}</div>`;
    return;
  }
  if(S.docView==='list'){
    c.className='docs-list';
    c.innerHTML=rpts.map(r=>`
      <div class="doc-card anim-up" style="display:flex;align-items:center;gap:14px;padding:14px 18px" oncontextmenu="showCtx(event,${r.id})">
        <div class="doc-ico"><i class="${TYPE_ICON[r.type]||'fas fa-file-alt'}"></i></div>
        <div style="flex:1;min-width:0">
          <div class="doc-num">${esc(r.number)}</div>
          <div class="doc-title" style="margin-bottom:4px">${esc(trunc(r.title||'بدون عنوان',60))}</div>
          <div class="doc-meta">
            <span class="badge b-${r.priority}">${PRIO_LABEL[r.priority]||r.priority}</span>
            <span class="badge b-${r.secret}" style="font-size:10px">${SECRET_LABEL[r.secret]||r.secret}</span>
            <span><i class="fas fa-calendar" style="color:var(--primary)"></i> ${fmtDate(r.date)}</span>
            <span><i class="fas fa-building" style="color:var(--text-m)"></i> ${esc(trunc(r.unit||'',25))}</span>
          </div>
        </div>
        <div class="doc-btns">
          <button class="doc-btn" onclick="viewDocReport(${r.id})" title="عرض"><i class="fas fa-eye"></i></button>
          <button class="doc-btn" onclick="printDocReport(${r.id})" title="طباعة"><i class="fas fa-print"></i></button>
          <button class="doc-btn" onclick="duplicateReport(${r.id})" title="نسخ"><i class="fas fa-copy"></i></button>
          <button class="doc-btn del" onclick="deleteReport(${r.id})" title="حذف"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  }else{
    c.className='docs-grid';
    c.innerHTML=rpts.map(r=>`
      <div class="doc-card anim-up" oncontextmenu="showCtx(event,${r.id})">
        <div class="doc-card-top">
          <div class="doc-ico"><i class="${TYPE_ICON[r.type]||'fas fa-file-alt'}"></i></div>
          <div class="doc-btns">
            <button class="doc-btn" onclick="viewDocReport(${r.id})" title="عرض"><i class="fas fa-eye"></i></button>
            <button class="doc-btn" onclick="printDocReport(${r.id})" title="طباعة"><i class="fas fa-print"></i></button>
            <button class="doc-btn" onclick="duplicateReport(${r.id})" title="نسخ"><i class="fas fa-copy"></i></button>
            <button class="doc-btn del" onclick="deleteReport(${r.id})" title="حذف"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <div class="doc-num">${esc(r.number)}</div>
        <div class="doc-title">${esc(trunc(r.title||'بدون عنوان',50))}</div>
        <div class="doc-meta">
          <span class="badge b-${r.priority}">${PRIO_LABEL[r.priority]||r.priority}</span>
          <span><i class="fas fa-calendar" style="color:var(--primary)"></i> ${fmtDate(r.date)}</span>
          <span class="badge b-${r.secret}" style="font-size:10px">${SECRET_LABEL[r.secret]||r.secret}</span>
        </div>
      </div>
    `).join('');
  }
}

function setView(v){
  S.docView=v;
  document.getElementById('vtGrid').classList.toggle('active',v==='grid');
  document.getElementById('vtList').classList.toggle('active',v==='list');
  renderDocs();
}

function printDocReport(id){viewDocReport(id);setTimeout(()=>printReport(),600)}
