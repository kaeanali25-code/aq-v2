/* dashboard.js */
function renderDashboard(){
  const rpts=S.reports;
  const today=new Date().toDateString();
  const todayR=rpts.filter(r=>new Date(r.date+'T00:00:00').toDateString()===today);
  const urgent=rpts.filter(r=>r.priority==='flash'||r.priority==='immediate');
  const routine=rpts.filter(r=>r.priority==='routine');
  animNum('stTotal',rpts.length);
  animNum('stToday',todayR.length);
  animNum('stUrgent',urgent.length);
  animNum('stDone',routine.length);
  renderRecentTable(rpts);
  drawDashChart(rpts);
  drawPriorityChart(rpts);
}

function renderRecentTable(rpts){
  const tb=document.getElementById('recentTbody');if(!tb)return;
  const recent=[...rpts].reverse().slice(0,10);
  if(!recent.length){tb.innerHTML='<tr><td colspan="7" class="tbl-empty"><i class="fas fa-inbox"></i><br>لا توجد تقارير بعد</td></tr>';return}
  tb.innerHTML=recent.map(r=>`
    <tr oncontextmenu="showCtx(event,${r.id})">
      <td><code style="color:var(--primary);font-size:11px">${esc(r.number)}</code></td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(trunc(r.title||'بدون عنوان',40))}</td>
      <td><span class="badge b-routine" style="background:rgba(201,162,39,.12);color:var(--primary)">${TYPE_LABEL[r.type]||r.type}</span></td>
      <td><span class="badge b-${r.priority}">${PRIO_LABEL[r.priority]||r.priority}</span></td>
      <td><span class="badge b-${r.secret}">${SECRET_LABEL[r.secret]||r.secret}</span></td>
      <td style="font-size:11px;color:var(--text-m)">${fmtDate(r.date)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="doc-btn" onclick="viewDocReport(${r.id})" title="عرض"><i class="fas fa-eye"></i></button>
          <button class="doc-btn" onclick="deleteReport(${r.id})" title="حذف"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function searchRecentTable(q){
  const rows=document.querySelectorAll('#recentTbody tr');
  rows.forEach(row=>{
    row.style.display=(!q||row.textContent.toLowerCase().includes(q.toLowerCase()))?'':'none';
  });
}

function drawDashChart(rpts){
  const cv=document.getElementById('dashChart');if(!cv)return;
  const ctx=cv.getContext('2d');
  const W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);
  const counts={};rpts.forEach(r=>{counts[r.type]=(counts[r.type]||0)+1});
  const entries=Object.entries(counts).filter(([,v])=>v>0);
  if(!entries.length){ctx.fillStyle='var(--text-m)';ctx.font='13px Cairo';ctx.textAlign='center';ctx.fillText('لا توجد بيانات',W/2,H/2);
  document.getElementById('dashLegend').innerHTML='';return}
  const total=entries.reduce((s,[,v])=>s+v,0);
  const cx=W/2,cy=H/2-15,r=90,ir=52;
  let ang=-Math.PI/2;
  entries.forEach(([type,cnt],i)=>{
    const a=(cnt/total)*Math.PI*2;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,ang,ang+a);ctx.closePath();
    ctx.fillStyle=CHART_COLORS[i%CHART_COLORS.length];ctx.fill();
    ctx.strokeStyle=document.body.classList.contains('theme-dark')?'#111827':'#fff';ctx.lineWidth=2;ctx.stroke();
    ang+=a;
  });
  ctx.beginPath();ctx.arc(cx,cy,ir,0,Math.PI*2);
  ctx.fillStyle=document.body.classList.contains('theme-dark')?'#111827':'#fff';ctx.fill();
  ctx.fillStyle=document.body.classList.contains('theme-dark')?'#e8edf5':'#1a2235';
  ctx.font='bold 22px Cairo';ctx.textAlign='center';ctx.fillText(total,cx,cy+6);
  ctx.font='11px Cairo';ctx.fillStyle='#8a9bb5';ctx.fillText('تقرير',cx,cy+22);
  document.getElementById('dashLegend').innerHTML=entries.map(([type,cnt],i)=>`
    <div class="cl-item"><div class="cl-dot" style="background:${CHART_COLORS[i%CHART_COLORS.length]}"></div>${TYPE_LABEL[type]||type} (${cnt})</div>
  `).join('');
}

function drawPriorityChart(rpts){
  const cv=document.getElementById('priorityChart');if(!cv)return;
  const ctx=cv.getContext('2d');
  const W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);
  const prios=[{k:'routine',l:'روتيني',c:'#27ae60'},{k:'priority',l:'أولوية',c:'#f39c12'},{k:'immediate',l:'فوري',c:'#e74c3c'},{k:'flash',l:'فلاش',c:'#c0392b'}];
  const counts=prios.map(p=>({...p,cnt:rpts.filter(r=>r.priority===p.k).length}));
  const max=Math.max(...counts.map(c=>c.cnt),1);
  const barW=42,gap=14,startX=(W-counts.length*(barW+gap))/2,chartH=H-50,top=10;
  counts.forEach(({l,c,cnt},i)=>{
    const x=startX+i*(barW+gap),bh=(cnt/max)*chartH,y=top+chartH-bh;
    const grad=ctx.createLinearGradient(0,y,0,top+chartH);
    grad.addColorStop(0,c);grad.addColorStop(1,c+'55');
    ctx.fillStyle=grad;
    if(ctx.roundRect){ctx.beginPath();ctx.roundRect(x,y,barW,bh,[4,4,0,0]);ctx.fill()}
    else{ctx.fillRect(x,y,barW,bh)}
    ctx.fillStyle=document.body.classList.contains('theme-dark')?'#e8edf5':'#1a2235';
    ctx.font='bold 13px Cairo';ctx.textAlign='center';ctx.fillText(cnt,x+barW/2,y-5);
    ctx.fillStyle='#8a9bb5';ctx.font='10px Cairo';ctx.fillText(l,x+barW/2,top+chartH+16);
  });
}
