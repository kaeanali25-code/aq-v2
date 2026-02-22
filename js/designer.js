/* designer.js */
let dsnZoomLevel = 1;

function initDesigner() {
  dsnZoomLevel = 1;
  const pg = document.getElementById('dsnPage');
  if (pg) pg.style.transform = 'scale(1)';
  const lbl = document.getElementById('dsnZoomLbl');
  if (lbl) lbl.textContent = '100%';
}

function dsnZoom(d) {
  dsnZoomLevel = Math.min(1.6, Math.max(0.4, dsnZoomLevel + d));
  document.getElementById('dsnPage').style.transform = `scale(${dsnZoomLevel})`;
  document.getElementById('dsnZoomLbl').textContent = Math.round(dsnZoomLevel * 100) + '%';
}

function clearDsn() {
  document.getElementById('dsnPage').innerHTML = '<div class="dsn-empty-hint" id="dsnEmptyHint"><i class="fas fa-drafting-compass"></i><p>اختر قالباً من القائمة أو أضف عناصر من اليمين للبدء</p></div>';
  toast('تم مسح المستند', 'info');
}

function dsnUndo() { toast('التراجع قيد التطوير', 'info'); }
function dsnRedo() { toast('الإعادة قيد التطوير', 'info'); }

/* ---- Helper builders ---- */
function mkEl(innerHTML) {
  return `<div class="dsn-el"><button class="dsn-el-del" onclick="this.closest('.dsn-el').remove()"><i class="fas fa-times"></i></button>${innerHTML}</div>`;
}

function mkSec(label, placeholder) {
  placeholder = placeholder || 'أدخل النص هنا...';
  return mkEl(`
    <div style="border-right:4px solid #c9a227;padding-right:10px;margin-bottom:6px;font-size:13px;font-weight:900;color:#1a1a2e">${label}</div>
    <div style="font-size:12px;color:#444;min-height:50px;line-height:1.9;border:1px dashed #ddd;padding:8px;border-radius:4px" contenteditable="true" onclick="this.style.borderColor='#c9a227'" onblur="this.style.borderColor='#ddd'">${placeholder}</div>
  `);
}

function mkSigs() {
  return mkEl(`
    <div style="border-top:2px solid #1a1a2e;margin-top:30px;padding-top:14px;display:flex;justify-content:space-between;font-size:11px;color:#555;gap:10px">
      <div style="text-align:center;flex:1"><div style="border-top:1px solid #1a1a2e;padding-top:6px;margin-top:40px">محرر التقرير<br><small style="color:#aaa">الاسم والرتبة</small></div></div>
      <div style="text-align:center;flex:1"><div style="border-top:1px solid #1a1a2e;padding-top:6px;margin-top:40px">المراجع<br><small style="color:#aaa">الاسم والرتبة</small></div></div>
      <div style="text-align:center;flex:1"><div style="border-top:1px solid #1a1a2e;padding-top:6px;margin-top:40px">المعتمد<br><small style="color:#aaa">الاسم والرتبة</small></div></div>
    </div>
  `);
}

function mkHeader(org, cmd, title, sub) {
  return mkEl(`
    <div style="text-align:center;border-bottom:3px double #1a1a2e;padding-bottom:14px;margin-bottom:18px">
      <div style="font-size:10px;color:#777;letter-spacing:1.5px;margin-bottom:4px">${org} &bull; ${cmd}</div>
      <div style="font-size:22px;font-weight:900;color:#1a1a2e">${title}</div>
      ${sub ? `<div style="font-size:11px;color:#999;margin-top:4px">${sub}</div>` : ''}
    </div>
  `);
}

function mkMetaTable(rows) {
  const trs = rows.map(([k, v]) => `
    <tr>
      <td style="border:1px solid #ddd;padding:8px;font-weight:800;background:#f5f5f5;width:140px">${k}</td>
      <td style="border:1px solid #ddd;padding:8px" contenteditable="true">${v}</td>
    </tr>
  `).join('');
  return mkEl(`<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px">${trs}</table>`);
}

/* ---- Load Template ---- */
function loadDsnTemplate() {
  const t = document.getElementById('dsnTemplate')?.value;
  if (!t) return;
  const pg = document.getElementById('dsnPage');
  const hint = pg.querySelector('.dsn-empty-hint');
  if (hint) hint.remove();

  const org = S.settings.orgName || 'القوات المسلحة اليمنية';
  const cmd = S.settings.command || 'القيادة العامة للقوات المسلحة';
  const now = fmtDate(new Date().toISOString().split('T')[0]);
  let html = '';

  if (t === 'ops') {
    html += mkEl(`<div style="background:repeating-linear-gradient(90deg,#c00 0,#c00 18px,#fff 18px,#fff 20px);height:10px;margin:-4px -4px 12px"></div>`);
    html += mkHeader(org, cmd, 'تقرير عملياتي', 'OPERATIONAL REPORT');
    html += mkMetaTable([['رقم التقرير', 'OPS-202603-____'], ['التاريخ', now], ['الوحدة', ''], ['القائد', ''], ['درجة السرية', '<span style="color:#c0392b;font-weight:900">سري</span>'], ['الأولوية', '<span style="color:#e67e22;font-weight:800">فوري</span>']]);
    html += mkSec('الملخص التنفيذي', 'ملخص موجز للعملية...');
    html += mkSec('تفاصيل العمليات', 'وصف تفصيلي لمجريات العملية...');
    html += mkSec('الأهداف المنجزة', '- الهدف الأول\n- الهدف الثاني');
    html += mkSec('التوصيات', 'التوصيات والخطوات المقترحة...');
    html += mkSigs();

  } else if (t === 'int') {
    html += mkEl(`<div style="background:#7b0000;color:#fff;text-align:center;padding:8px;font-size:12px;font-weight:900;letter-spacing:4px;margin-bottom:12px">سري جداً — CLASSIFIED</div>`);
    html += mkHeader(org, 'الاستخبارات العسكرية', 'تقرير استخباراتي', 'INTELLIGENCE REPORT');
    html += mkMetaTable([['رقم التقرير', 'INT-202603-____'], ['التاريخ', now], ['المصدر', ''], ['مستوى الموثوقية', ''], ['درجة السرية', '<span style="color:#7b0000;font-weight:900">سري جداً</span>']]);
    html += mkSec('ملخص المعلومات', 'ملخص المعلومات الاستخباراتية...');
    html += mkSec('المعلومات التفصيلية', 'وصف تفصيلي للمعلومات المجمعة...');
    html += mkSec('تقييم المصدر', 'تقييم موثوقية المصدر والمعلومات...');
    html += mkSec('التوصيات والإجراءات', 'الإجراءات المقترحة بناءً على المعلومات...');
    html += mkSigs();
    html += mkEl(`<div style="background:#7b0000;color:#fff;text-align:center;padding:8px;font-size:12px;font-weight:900;letter-spacing:4px;margin-top:12px">سري جداً — CLASSIFIED</div>`);

  } else if (t === 'letter') {
    html += mkHeader(org, cmd, 'خطاب رسمي', 'OFFICIAL LETTER');
    html += mkMetaTable([['رقم الخطاب', '____/____/2026'], ['التاريخ', now], ['إلى', ''], ['من', ''], ['الموضوع', '']]);
    html += mkEl(`<div style="font-size:13px;color:#1a1a2e;margin:16px 0 8px">السيد / ................................................................ المحترم</div>`);
    html += mkEl(`<div style="font-size:13px;color:#1a1a2e;margin-bottom:16px">السلام عليكم ورحمة الله وبركاته،،،</div>`);
    html += mkEl(`<div style="font-size:13px;color:#444;min-height:120px;line-height:2;border:1px dashed #ddd;padding:10px;border-radius:4px" contenteditable="true">أشير إلى الموضوع أعلاه، وأفيدكم بما يلي:...</div>`);
    html += mkEl(`<div style="font-size:13px;color:#1a1a2e;margin:16px 0">وتفضلوا بقبول وافر الاحترام والتقدير،،،</div>`);
    html += mkSigs();

  } else if (t === 'memo') {
    html += mkHeader(org, cmd, 'مذكرة داخلية', 'INTERNAL MEMO');
    html += mkMetaTable([['رقم المذكرة', '____/____/2026'], ['التاريخ', now], ['إلى', ''], ['من', ''], ['نسخة إلى', ''], ['الموضوع', '']]);
    html += mkEl(`<div style="border:2px solid #c9a227;padding:12px 16px;border-radius:6px;font-size:13px;color:#1a1a2e;font-weight:700;margin-bottom:12px">الموضوع: ................................................................</div>`);
    html += mkEl(`<div style="font-size:13px;color:#444;min-height:200px;line-height:2;border:1px dashed #ddd;padding:10px;border-radius:4px" contenteditable="true">محتوى المذكرة الداخلية...</div>`);
    html += mkSigs();

  } else if (t === 'cert') {
    html += mkEl(`<div style="border:4px double #c9a227;padding:40px;text-align:center;background:linear-gradient(135deg,#fffef5,#fff)">
      <div style="font-size:14px;color:#777;letter-spacing:2px;margin-bottom:8px">${org}</div>
      <div style="font-size:36px;font-weight:900;color:#1a1a2e;margin-bottom:8px">شهادة تقدير</div>
      <div style="font-size:14px;color:#c9a227;letter-spacing:3px;margin-bottom:24px">CERTIFICATE OF APPRECIATION</div>
      <div style="font-size:16px;color:#555;margin-bottom:16px">تشهد القيادة العامة بأن</div>
      <div style="font-size:26px;font-weight:900;color:#1a1a2e;border-bottom:2px solid #c9a227;display:inline-block;padding:0 40px 8px;margin-bottom:16px" contenteditable="true">اسم المكرَّم</div>
      <div style="font-size:14px;color:#555;margin:16px auto;max-width:460px;line-height:2" contenteditable="true">قد أدّى واجبه الوطني بإخلاص وتفانٍ، وأبدى كفاءةً عالية في تنفيذ المهام الموكلة إليه، ويستحق هذه الشهادة تقديراً وعرفاناً.</div>
      <div style="font-size:13px;color:#777;margin-top:16px">التاريخ: ${now}</div>
    </div>`);
    html += mkSigs();
  }

  pg.innerHTML = html;
  toast(`تم تحميل قالب: ${t}`, 'success');
}

/* ---- Add Element ---- */
function addDsnElem(type) {
  const pg = document.getElementById('dsnPage');
  const hint = pg.querySelector('.dsn-empty-hint');
  if (hint) hint.remove();
  const org = S.settings.orgName || 'القوات المسلحة اليمنية';
  const cmd = S.settings.command || 'القيادة العامة';
  const now = fmtDate(new Date().toISOString().split('T')[0]);
  let html = '';

  if (type === 'header') {
    html = mkHeader(org, cmd, 'ترويسة المستند', '');
  } else if (type === 'title') {
    html = mkEl(`<h2 style="font-size:20px;font-weight:900;text-align:center;color:#1a1a2e;padding:8px 0;border-bottom:2px solid #c9a227" contenteditable="true">عنوان المستند</h2>`);
  } else if (type === 'text') {
    html = mkEl(`<div style="font-size:13px;color:#444;min-height:80px;line-height:2;padding:6px 0" contenteditable="true">أضف نصاً هنا...</div>`);
  } else if (type === 'table') {
    html = mkEl(`<table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead><tr>${['العمود 1', 'العمود 2', 'العمود 3'].map(h => `<th style="border:1px solid #ccc;padding:8px;background:#f0f0f0;font-weight:800" contenteditable="true">${h}</th>`).join('')}</tr></thead>
      <tbody>${[1, 2, 3].map(() => `<tr>${[1, 2, 3].map(() => `<td style="border:1px solid #ccc;padding:8px" contenteditable="true">بيانات</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`);
  } else if (type === 'signature') {
    html = mkSigs();
  } else if (type === 'qr') {
    html = mkEl(`<div style="text-align:center;padding:10px"><div style="width:90px;height:90px;background:#1a1a2e;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;margin-bottom:6px"><span style="color:#c9a227;font-size:44px">▣</span></div><div style="font-size:10px;color:#777">رمز QR للتحقق</div></div>`);
  } else if (type === 'stamp') {
    html = mkEl(`<div style="text-align:center;padding:10px"><svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#1a3a5c" stroke-width="4"/><circle cx="50" cy="50" r="38" fill="none" stroke="#1a3a5c" stroke-width="1.5"/><text x="50" y="54" text-anchor="middle" font-family="Cairo,sans-serif" font-size="16" font-weight="900" fill="#1a3a5c">رسمي</text><text x="50" y="74" text-anchor="middle" font-family="Cairo,sans-serif" font-size="7" fill="#1a3a5c">القوات المسلحة اليمنية</text></svg></div>`);
  } else if (type === 'divider') {
    html = mkEl(`<div style="display:flex;align-items:center;gap:10px;margin:8px 0"><div style="flex:1;height:1px;background:linear-gradient(to left,transparent,#c9a227,transparent)"></div><i class="fas fa-star" style="color:#c9a227;font-size:10px"></i><div style="flex:1;height:1px;background:linear-gradient(to right,transparent,#c9a227,transparent)"></div></div>`);
  } else if (type === 'image') {
    html = mkEl(`<div style="border:2px dashed #ccc;padding:24px;text-align:center;color:#aaa;border-radius:6px"><i class="fas fa-image" style="font-size:36px;margin-bottom:8px;display:block"></i><div style="font-size:12px">مكان الصورة / الشعار</div></div>`);
  } else if (type === 'watermark') {
    html = mkEl(`<div style="text-align:center;transform:rotate(-30deg);font-size:48px;font-weight:900;color:rgba(26,26,46,.06);letter-spacing:6px;pointer-events:none;user-select:none;margin:10px 0">سري</div>`);
  } else if (type === 'secbar') {
    html = mkEl(`<div style="background:repeating-linear-gradient(90deg,#c00 0,#c00 18px,#fff 18px,#fff 20px);height:12px;margin:8px 0"></div>`);
  } else if (type === 'footer') {
    html = mkEl(`<div style="border-top:1px solid #ccc;padding-top:10px;display:flex;justify-content:space-between;font-size:10px;color:#999;margin-top:20px"><span>${org}</span><span>تذييل الصفحة</span><span>صفحة 1 من 1</span></div>`);
  }

  if (html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    pg.appendChild(div.firstElementChild);
    toast(`تمت إضافة: ${type}`, 'success');
  }
}
