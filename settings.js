/* settings.js */
function initSettingsPage() {
  const s = S.settings;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  const setChk = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };

  set('sOrg', s.orgName);
  set('sCmd', s.command);
  set('sCtry', s.country);
  set('sSlogan', s.slogan);
  set('sStartNum', s.startNum || 1001);
  set('sPrimary', s.primary || '#c9a227');
  set('sFont', s.font || 'Cairo');
  set('sTheme', s.theme || 'dark');
  set('sAccess', s.access || 'secret');
  set('sPaper', s.paper || 'a4');
  set('sOrient', s.orient || 'portrait');
  set('sPass', '');
  set('sPass2', '');
  setChk('sAnimations', s.animations !== false);
  setChk('sEncrypt', s.encrypt !== false);
  setChk('sAutoQR', s.autoQR !== false);
  setChk('sPageNum', s.pageNum !== false);
  setChk('sPrintHeader', s.printHeader !== false);
  setChk('nSave', s.nSave !== false);
  setChk('nDelete', s.nDelete !== false);
  setChk('nExport', !!s.nExport);
  set('nSound', s.nSound || 'none');
  updateSettingsInfo();
}

function saveSettings() {
  const g = id => document.getElementById(id)?.value || '';
  const gc = id => document.getElementById(id)?.checked || false;

  const pass = g('sPass');
  const pass2 = g('sPass2');
  if (pass && pass !== pass2) { toast('كلمات المرور غير متطابقة', 'error'); return; }

  S.settings.orgName = g('sOrg');
  S.settings.command = g('sCmd');
  S.settings.country = g('sCtry');
  S.settings.slogan = g('sSlogan');
  S.settings.startNum = parseInt(g('sStartNum')) || 1001;
  S.settings.primary = g('sPrimary');
  S.settings.font = g('sFont');
  S.settings.theme = g('sTheme');
  S.settings.access = g('sAccess');
  S.settings.paper = g('sPaper');
  S.settings.orient = g('sOrient');
  S.settings.animations = gc('sAnimations');
  S.settings.encrypt = gc('sEncrypt');
  S.settings.autoQR = gc('sAutoQR');
  S.settings.pageNum = gc('sPageNum');
  S.settings.printHeader = gc('sPrintHeader');
  S.settings.nSave = gc('nSave');
  S.settings.nDelete = gc('nDelete');
  S.settings.nExport = gc('nExport');
  S.settings.nSound = g('nSound');
  if (pass) S.settings.password = pass;

  applyAllSettings();
  saveState();
  updateSettingsInfo();

  const sb = document.getElementById('sbUsername');
  if (sb) sb.textContent = S.settings.orgName || 'مستخدم النظام';

  toast('تم حفظ الإعدادات بنجاح', 'success');
}
