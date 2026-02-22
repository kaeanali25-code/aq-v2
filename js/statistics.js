/* statistics.js */
function renderStats() {
  const rpts = S.reports;
  animNum('soTotal', rpts.length);
  animNum('soRoutine', rpts.filter(r => r.priority === 'routine').length);
  animNum('soPriority', rpts.filter(r => r.priority === 'priority').length);
  animNum('soImm', rpts.filter(r => r.priority === 'immediate').length);
  animNum('soFlash', rpts.filter(r => r.priority === 'flash').length);
  drawBarChart(rpts);
  drawPieChart(rpts);
  drawPrioBar(rpts);
  drawSecretChart(rpts);
}

function drawBarChart(rpts) {
  const cv = document.getElementById('barChart'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.clientWidth || cv.parentElement.clientWidth - 44;
  const H = 280;
  cv.width = W; cv.height = H;
  ctx.clearRect(0, 0, W, H);

  const types = Object.keys(TYPE_LABEL);
  const counts = types.map(t => rpts.filter(r => r.type === t).length);
  const max = Math.max(...counts, 1);
  const barW = Math.floor((W - 40) / types.length) - 6;
  const chartH = H - 50; const top = 10;

  types.forEach((t, i) => {
    const cnt = counts[i];
    const x = 20 + i * ((W - 40) / types.length);
    const bh = (cnt / max) * chartH;
    const y = top + chartH - bh;

    const grad = ctx.createLinearGradient(0, y, 0, top + chartH);
    grad.addColorStop(0, CHART_COLORS[i % CHART_COLORS.length]);
    grad.addColorStop(1, CHART_COLORS[i % CHART_COLORS.length] + '44');
    ctx.fillStyle = grad;
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, barW, Math.max(bh, 2), [4, 4, 0, 0]); ctx.fill(); }
    else ctx.fillRect(x, y, barW, Math.max(bh, 2));

    const isDark = document.body.classList.contains('theme-dark');
    ctx.fillStyle = isDark ? '#e8edf5' : '#1a2235';
    ctx.font = 'bold 11px Cairo'; ctx.textAlign = 'center';
    if (cnt > 0) ctx.fillText(cnt, x + barW / 2, y - 4);
    ctx.fillStyle = '#8a9bb5'; ctx.font = '9px Cairo';
    ctx.fillText(TYPE_LABEL[t] || t, x + barW / 2, top + chartH + 14);
  });
}

function drawPieChart(rpts) {
  const cv = document.getElementById('pieChart'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = 300, H = 280;
  cv.width = W; cv.height = H;
  ctx.clearRect(0, 0, W, H);

  const types = Object.keys(TYPE_LABEL);
  const entries = types.map(t => ({ t, cnt: rpts.filter(r => r.type === t).length })).filter(e => e.cnt > 0);
  const total = entries.reduce((s, e) => s + e.cnt, 0);
  if (!total) {
    ctx.fillStyle = '#8a9bb5'; ctx.font = '13px Cairo'; ctx.textAlign = 'center';
    ctx.fillText('لا توجد بيانات', W / 2, H / 2);
    document.getElementById('pieLegend').innerHTML = ''; return;
  }

  const cx = W / 2, cy = H / 2 - 10, r = 95, ir = 55;
  let ang = -Math.PI / 2;
  entries.forEach(({ t, cnt }, i) => {
    const a = (cnt / total) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, ang, ang + a); ctx.closePath();
    ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length]; ctx.fill();
    const isDark = document.body.classList.contains('theme-dark');
    ctx.strokeStyle = isDark ? '#111827' : '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ang += a;
  });

  // Hole
  ctx.beginPath(); ctx.arc(cx, cy, ir, 0, Math.PI * 2);
  ctx.fillStyle = document.body.classList.contains('theme-dark') ? '#111827' : '#fff'; ctx.fill();
  ctx.fillStyle = document.body.classList.contains('theme-dark') ? '#e8edf5' : '#1a2235';
  ctx.font = 'bold 20px Cairo'; ctx.textAlign = 'center'; ctx.fillText(total, cx, cy + 6);
  ctx.font = '11px Cairo'; ctx.fillStyle = '#8a9bb5'; ctx.fillText('تقرير', cx, cy + 22);

  document.getElementById('pieLegend').innerHTML = entries.map(({ t, cnt }, i) => `
    <div class="cl-item"><div class="cl-dot" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></div>${TYPE_LABEL[t] || t} (${cnt})</div>
  `).join('');
}

function drawPrioBar(rpts) {
  const cv = document.getElementById('prioBar'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.clientWidth || cv.parentElement.clientWidth - 44;
  const H = 280;
  cv.width = W; cv.height = H;
  ctx.clearRect(0, 0, W, H);

  const prios = [
    { k: 'routine', l: 'روتيني', c: '#27ae60' },
    { k: 'priority', l: 'أولوية', c: '#f39c12' },
    { k: 'immediate', l: 'فوري', c: '#e74c3c' },
    { k: 'flash', l: 'فلاش', c: '#c0392b' }
  ];
  const max = Math.max(...prios.map(p => rpts.filter(r => r.priority === p.k).length), 1);
  const bw = Math.floor((W - 60) / prios.length) - 10;
  const chartH = H - 60; const top = 14;

  prios.forEach((p, i) => {
    const cnt = rpts.filter(r => r.priority === p.k).length;
    const x = 30 + i * ((W - 60) / prios.length);
    const bh = (cnt / max) * chartH;
    const y = top + chartH - bh;

    const grad = ctx.createLinearGradient(0, y, 0, top + chartH);
    grad.addColorStop(0, p.c); grad.addColorStop(1, p.c + '44');
    ctx.fillStyle = grad;
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, bw, Math.max(bh, 2), [5, 5, 0, 0]); ctx.fill(); }
    else ctx.fillRect(x, y, bw, Math.max(bh, 2));

    const isDark = document.body.classList.contains('theme-dark');
    ctx.fillStyle = isDark ? '#e8edf5' : '#1a2235';
    ctx.font = 'bold 15px Cairo'; ctx.textAlign = 'center';
    if (cnt > 0) ctx.fillText(cnt, x + bw / 2, y - 6);
    ctx.fillStyle = p.c; ctx.font = 'bold 11px Cairo';
    ctx.fillText(p.l, x + bw / 2, top + chartH + 18);
    ctx.fillStyle = '#8a9bb5'; ctx.font = '9px Cairo';
    ctx.fillText(`${total > 0 ? Math.round(cnt / total * 100) : 0}%`, x + bw / 2, top + chartH + 32);
  });

  function total() { return rpts.length; }
}

function drawSecretChart(rpts) {
  const cv = document.getElementById('secretChart'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = 300, H = 280;
  cv.width = W; cv.height = H;
  ctx.clearRect(0, 0, W, H);

  const secrets = ['public', 'limited', 'secret', 'top_secret', 'classified'];
  const entries = secrets.map(s => ({ s, cnt: rpts.filter(r => r.secret === s).length })).filter(e => e.cnt > 0);
  const total = entries.reduce((sum, e) => sum + e.cnt, 0);

  if (!total) {
    ctx.fillStyle = '#8a9bb5'; ctx.font = '13px Cairo'; ctx.textAlign = 'center';
    ctx.fillText('لا توجد بيانات', W / 2, H / 2);
    document.getElementById('secretLegend').innerHTML = ''; return;
  }

  const secColors = { public: '#27ae60', limited: '#f39c12', secret: '#e74c3c', top_secret: '#c0392b', classified: '#7b0000' };
  const cx = W / 2, cy = H / 2 - 10, r = 95, ir = 55;
  let ang = -Math.PI / 2;
  entries.forEach(({ s, cnt }) => {
    const a = (cnt / total) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, ang, ang + a); ctx.closePath();
    ctx.fillStyle = secColors[s] || '#888'; ctx.fill();
    const isDark = document.body.classList.contains('theme-dark');
    ctx.strokeStyle = isDark ? '#111827' : '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ang += a;
  });

  ctx.beginPath(); ctx.arc(cx, cy, ir, 0, Math.PI * 2);
  ctx.fillStyle = document.body.classList.contains('theme-dark') ? '#111827' : '#fff'; ctx.fill();
  ctx.fillStyle = document.body.classList.contains('theme-dark') ? '#e8edf5' : '#1a2235';
  ctx.font = 'bold 20px Cairo'; ctx.textAlign = 'center'; ctx.fillText(total, cx, cy + 6);
  ctx.font = '10px Cairo'; ctx.fillStyle = '#8a9bb5'; ctx.fillText('تقرير', cx, cy + 22);

  document.getElementById('secretLegend').innerHTML = entries.map(({ s, cnt }) => `
    <div class="cl-item"><div class="cl-dot" style="background:${secColors[s]}"></div>${SECRET_LABEL[s] || s} (${cnt})</div>
  `).join('');
}
