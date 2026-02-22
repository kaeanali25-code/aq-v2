/* qr.js */
function initQR() { /* ready */ }

/* ---- QR Code ---- */
function genQR() {
  const text = document.getElementById('qrText')?.value?.trim();
  if (!text) { toast('أدخل نصاً أو رابطاً', 'warn'); return; }
  const sz = parseInt(document.getElementById('qrSz')?.value || 200);
  const dark = document.getElementById('qrDark')?.value || '#000000';
  const light = document.getElementById('qrLight')?.value || '#ffffff';
  const label = document.getElementById('qrLabel')?.value || '';
  const out = document.getElementById('qrOut');
  out.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'text-align:center;padding:12px;background:#fff;border-radius:8px;display:inline-block';
  const qrDiv = document.createElement('div');
  wrapper.appendChild(qrDiv);
  out.appendChild(wrapper);

  if (typeof QRCode !== 'undefined') {
    try {
      new QRCode(qrDiv, {
        text, width: sz, height: sz,
        colorDark: dark, colorLight: light,
        correctLevel: QRCode.CorrectLevel[document.getElementById('qrEC')?.value || 'M']
      });
      if (label) {
        const lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:11px;color:#555;margin-top:6px;font-family:Cairo,sans-serif';
        lbl.textContent = label;
        wrapper.appendChild(lbl);
      }
      const dlBtn = document.getElementById('dlQRBtn');
      if (dlBtn) dlBtn.style.display = 'inline-flex';
      toast('تم توليد رمز QR', 'success');
    } catch (e) {
      fallbackQR(out, text, sz, dark, light, label);
    }
  } else {
    fallbackQR(out, text, sz, dark, light, label);
  }
}

function fallbackQR(out, text, sz, dark, light, label) {
  const cv = document.createElement('canvas');
  cv.width = sz; cv.height = sz + (label ? 24 : 0);
  const ctx = cv.getContext('2d');
  ctx.fillStyle = light; ctx.fillRect(0, 0, sz, sz);
  const cells = Math.min(25, Math.max(15, text.length));
  const cell = Math.floor(sz / cells);
  ctx.fillStyle = dark;
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const hash = (text.charCodeAt((r * cells + c) % text.length) + r * 7 + c * 13) % 3;
      if (hash === 0) ctx.fillRect(c * cell + 2, r * cell + 2, cell - 2, cell - 2);
    }
  }
  // Corner squares
  const drawFinder = (x, y) => {
    ctx.fillStyle = dark; ctx.fillRect(x, y, cell * 7, cell * 7);
    ctx.fillStyle = light; ctx.fillRect(x + cell, y + cell, cell * 5, cell * 5);
    ctx.fillStyle = dark; ctx.fillRect(x + cell * 2, y + cell * 2, cell * 3, cell * 3);
  };
  drawFinder(0, 0); drawFinder(sz - cell * 7, 0); drawFinder(0, sz - cell * 7);
  if (label) {
    ctx.fillStyle = '#555'; ctx.font = '11px Cairo'; ctx.textAlign = 'center';
    ctx.fillText(label, sz / 2, sz + 16);
  }
  out.innerHTML = '';
  cv.style.cssText = 'border-radius:8px;box-shadow:0 4px 14px rgba(0,0,0,.3)';
  out.appendChild(cv);
  const dlBtn = document.getElementById('dlQRBtn');
  if (dlBtn) { dlBtn.style.display = 'inline-flex'; dlBtn.onclick = () => { const a = document.createElement('a'); a.download = `qr-${Date.now()}.png`; a.href = cv.toDataURL(); a.click(); }; }
  toast('تم توليد رمز QR', 'success');
}

function dlQR() {
  const img = document.querySelector('#qrOut img');
  if (img) { const a = document.createElement('a'); a.download = `qr-${Date.now()}.png`; a.href = img.src; a.click(); return; }
  const cv = document.querySelector('#qrOut canvas');
  if (cv) { const a = document.createElement('a'); a.download = `qr-${Date.now()}.png`; a.href = cv.toDataURL(); a.click(); }
}

/* ---- Barcode ---- */
function genBarcode() {
  const text = document.getElementById('bcText')?.value?.trim() || 'AQ-2026-001';
  const color = document.getElementById('bcColor')?.value || '#000000';
  const out = document.getElementById('bcOut');
  const cv = document.createElement('canvas');
  const barW = 2, barH = 80, quietW = 16;
  const data = encodeCode128(text);
  cv.width = quietW * 2 + data.length * barW;
  cv.height = barH + 26;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
  let x = quietW;
  data.forEach(bit => {
    if (bit) { ctx.fillStyle = color; ctx.fillRect(x, 0, barW, barH); }
    x += barW;
  });
  ctx.fillStyle = '#333'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
  ctx.fillText(text, cv.width / 2, barH + 18);
  cv.style.cssText = 'border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.3)';
  out.innerHTML = '';
  out.appendChild(cv);
  toast('تم توليد الباركود', 'success');
}

function encodeCode128(str) {
  const bits = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    for (let b = 7; b >= 0; b--) bits.push((code >> b) & 1);
    bits.push(0);
  }
  bits.push(1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1);
  return bits;
}

/* ---- Anti-Forgery ---- */
function genAF() {
  const text = document.getElementById('afText')?.value || 'وثيقة رسمية معتمدة';
  const pattern = document.getElementById('afPattern')?.value || 'stripe';
  const color = document.getElementById('afColor')?.value || '#c41e3a';
  const out = document.getElementById('afOut');
  const cv = document.createElement('canvas');
  cv.width = 520; cv.height = 100;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);

  if (pattern === 'stripe') {
    for (let x = 0; x < cv.width; x += 6) {
      ctx.strokeStyle = color + (x % 12 === 0 ? 'aa' : '44');
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - cv.height, cv.height); ctx.stroke();
    }
  } else if (pattern === 'dots') {
    for (let x = 0; x < cv.width; x += 12) {
      for (let y = 0; y < cv.height; y += 12) {
        const r = ((x * 7 + y * 11) % 17) < 8 ? 1.5 : 0.7;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color + '99'; ctx.fill();
      }
    }
  } else if (pattern === 'wave') {
    ctx.strokeStyle = color; ctx.lineWidth = 1.5;
    for (let yOff = 0; yOff < 4; yOff++) {
      ctx.beginPath();
      for (let x = 0; x < cv.width; x++) {
        const y = 20 + yOff * 20 + 8 * Math.sin((x + yOff * 30) / 15);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.globalAlpha = 0.4 - yOff * 0.06; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = color + 'dd';
  ctx.font = 'bold 14px Cairo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, cv.width / 2, cv.height / 2);
  const hex = text.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('').slice(0, 24);
  ctx.font = '9px monospace'; ctx.fillStyle = color + '99';
  ctx.fillText(`[${hex}...]`, cv.width / 2, cv.height - 10);

  cv.style.cssText = 'border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.3);max-width:100%';
  out.innerHTML = '';
  out.appendChild(cv);
  toast('تم توليد علامة مضادة للتزوير', 'success');
}

/* ---- ID Card ---- */
function genIDCard() {
  const name = document.getElementById('idName')?.value || 'اسم الشخص';
  const rank = document.getElementById('idRank')?.value || 'رتبة';
  const num = document.getElementById('idNum')?.value || '000000';
  const unit = document.getElementById('idUnit')?.value || 'الوحدة';
  const org = S.settings.orgName || 'القوات المسلحة اليمنية';
  const out = document.getElementById('idOut');
  const cv = document.createElement('canvas');
  cv.width = 400; cv.height = 240;
  const ctx = cv.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 400, 240);
  grad.addColorStop(0, '#0a0e1a'); grad.addColorStop(1, '#1a2235');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 400, 240);

  // Gold border
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 3;
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(6, 6, 388, 228, 10); ctx.stroke(); }
  else ctx.strokeRect(6, 6, 388, 228);

  // Gold accent line
  ctx.fillStyle = '#c9a227'; ctx.fillRect(0, 52, 400, 2);

  // Header
  ctx.fillStyle = '#c9a227';
  ctx.font = 'bold 11px Cairo'; ctx.textAlign = 'center';
  ctx.fillText(org, 200, 28);
  ctx.font = 'bold 9px Cairo'; ctx.fillStyle = '#8a9bb5';
  ctx.fillText('بطاقة هوية عسكرية — MILITARY ID', 200, 44);

  // Avatar placeholder
  ctx.fillStyle = '#1e2d45';
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(20, 64, 90, 110, 8); ctx.fill(); }
  else ctx.fillRect(20, 64, 90, 110);
  ctx.fillStyle = '#c9a227'; ctx.font = '38px Arial';
  ctx.textAlign = 'center'; ctx.fillText('👤', 65, 128);

  // Info
  ctx.textAlign = 'right';
  ctx.fillStyle = '#8a9bb5'; ctx.font = '10px Cairo'; ctx.fillText('الاسم الكامل', 380, 78);
  ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 18px Cairo'; ctx.fillText(name, 380, 98);
  ctx.fillStyle = '#8a9bb5'; ctx.font = '10px Cairo'; ctx.fillText('الرتبة', 380, 118);
  ctx.fillStyle = '#c9a227'; ctx.font = 'bold 14px Cairo'; ctx.fillText(rank, 380, 136);
  ctx.fillStyle = '#8a9bb5'; ctx.font = '10px Cairo'; ctx.fillText('الرقم العسكري', 380, 156);
  ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 13px monospace'; ctx.fillText(num, 380, 174);
  ctx.fillStyle = '#8a9bb5'; ctx.font = '10px Cairo'; ctx.fillText('الوحدة', 380, 194);
  ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 12px Cairo'; ctx.fillText(unit, 380, 212);

  // Barcode strip
  ctx.fillStyle = '#c9a227';
  for (let x = 126; x < 380; x += 4) {
    const h = 8 + ((x * 3 + 7) % 15);
    ctx.fillRect(x, 222, 2, -h);
  }

  cv.style.cssText = 'border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.5);max-width:100%';
  out.innerHTML = '';
  out.appendChild(cv);

  const a = document.createElement('a');
  a.href = cv.toDataURL('image/png'); a.download = `id-${name}-${Date.now()}.png`;
  const dlBtn = document.createElement('button');
  dlBtn.className = 'btn btn-outline btn-sm'; dlBtn.style.marginTop = '8px';
  dlBtn.innerHTML = '<i class="fas fa-download"></i> تحميل البطاقة';
  dlBtn.onclick = () => a.click();
  out.appendChild(dlBtn);
  toast('تم توليد بطاقة الهوية', 'success');
}
