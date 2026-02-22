/* stamps.js */
function initStamps(){S.stampCfg.shape='circle';drawStamp()}

function setShape(s){
  S.stampCfg.shape=s;
  document.querySelectorAll('.sh-btn').forEach(b=>b.classList.remove('active'));
  document.querySelector(`.sh-btn[data-shape="${s}"]`)?.classList.add('active');
  drawStamp();
}

function drawStamp(){
  const cv=document.getElementById('stampCanvas');if(!cv)return;
  const ctx=cv.getContext('2d');const W=cv.width;const H=cv.height;
  ctx.clearRect(0,0,W,H);

  const main=document.getElementById('stMain')?.value||'رسمي';
  const top=document.getElementById('stTop')?.value||'القوات المسلحة اليمنية';
  const bot=document.getElementById('stBot')?.value||'وزارة الدفاع';
  const unit=document.getElementById('stUnit')?.value||'2026';
  const color=document.getElementById('stColor')?.value||'#c41e3a';
  const size=parseInt(document.getElementById('stSize')?.value||200);
  const style=document.getElementById('stStyle')?.value||'classic';
  const stars=parseInt(document.getElementById('stStars')?.value||3);
  const shape=S.stampCfg.shape||'circle';

  S.stampCfg={...S.stampCfg,main,top,bot,unit,color,size,style,stars,shape};
  document.getElementById('stInfo').textContent=`الشكل: ${shape} | اللون: ${color} | الحجم: ${size}px`;

  const cx=W/2,cy=H/2,r=size/2;
  ctx.save();ctx.strokeStyle=color;ctx.lineWidth=4;

  const outerW=style==='modern'?3:4;
  const innerOffset=style==='simple'?0:12;
  ctx.lineWidth=outerW;

  if(shape==='circle'){
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
    if(innerOffset){ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,cy,r-innerOffset,0,Math.PI*2);ctx.stroke();}
  }else if(shape==='oval'){
    ctx.beginPath();ctx.ellipse(cx,cy,r*1.35,r*.82,0,0,Math.PI*2);ctx.stroke();
    if(innerOffset){ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(cx,cy,r*1.35-innerOffset,r*.82-innerOffset,0,0,Math.PI*2);ctx.stroke();}
  }else if(shape==='rect'){
    ctx.roundRect(cx-r*1.1,cy-r*.75,r*2.2,r*1.5,10);ctx.stroke();
    if(innerOffset){ctx.lineWidth=1.5;ctx.roundRect(cx-r*1.1+innerOffset,cy-r*.75+innerOffset,r*2.2-innerOffset*2,r*1.5-innerOffset*2,6);ctx.stroke();}
  }else if(shape==='hexagon'){
    drawHex(ctx,cx,cy,r);ctx.stroke();
    if(innerOffset){ctx.lineWidth=1.5;drawHex(ctx,cx,cy,r-innerOffset);ctx.stroke();}
  }else if(shape==='diamond'){
    ctx.beginPath();ctx.moveTo(cx,cy-r);ctx.lineTo(cx+r*.9,cy);ctx.lineTo(cx,cy+r);ctx.lineTo(cx-r*.9,cy);ctx.closePath();ctx.stroke();
  }

  if(style==='ornate'){
    ctx.lineWidth=1;ctx.setLineDash([4,4]);
    if(shape==='circle'){ctx.beginPath();ctx.arc(cx,cy,r-6,0,Math.PI*2);ctx.stroke();}
    ctx.setLineDash([]);
  }

  ctx.lineWidth=1;

  if(top&&(shape==='circle'||shape==='oval')){
    curvedText(ctx,top,cx,cy,r-7,-Math.PI*.75,Math.PI*.75,Math.round(r/7),color);
  }else{
    ctx.fillStyle=color;ctx.font=`bold ${Math.round(r/7)}px Cairo`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(top,cx,cy-r*.58);
  }

  if(bot&&(shape==='circle'||shape==='oval')){
    curvedTextBottom(ctx,bot,cx,cy,r-7,Math.round(r/8),color);
  }else{
    ctx.fillStyle=color;ctx.font=`bold ${Math.round(r/8)}px Cairo`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(bot,cx,cy+r*.62);
  }

  if(stars>0){
    const starStr=Array(stars).fill('★').join(' ');
    ctx.fillStyle=color;ctx.font=`${Math.round(r/8)}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(starStr,cx,cy+r*.12);
  }

  ctx.fillStyle=color;ctx.font=`900 ${Math.round(r/3.2)}px Cairo`;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(main,cx,cy-r*.1);

  ctx.font=`600 ${Math.round(r/7.5)}px Cairo`;
  ctx.fillText(unit,cx,cy+r*.3);

  ctx.restore();
}

function drawHex(ctx,cx,cy,r){
  ctx.beginPath();
  for(let i=0;i<6;i++){const a=Math.PI/180*(60*i-30);ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));}
  ctx.closePath();
}

function curvedText(ctx,text,cx,cy,r,sa,ea,fs,color){
  ctx.save();ctx.fillStyle=color;ctx.font=`bold ${fs}px Cairo`;ctx.textAlign='center';ctx.textBaseline='middle';
  const chars=text.split('');const arc=ea-sa;const ca=arc/chars.length;
  chars.forEach((ch,i)=>{const a=sa+ca*i+ca/2;ctx.save();ctx.translate(cx+r*Math.cos(a),cy+r*Math.sin(a));ctx.rotate(a+Math.PI/2);ctx.fillText(ch,0,0);ctx.restore()});
  ctx.restore();
}
function curvedTextBottom(ctx,text,cx,cy,r,fs,color){
  ctx.save();ctx.fillStyle=color;ctx.font=`bold ${fs}px Cairo`;ctx.textAlign='center';ctx.textBaseline='middle';
  const chars=text.split('').reverse();const sa=Math.PI*.2;const ea=Math.PI*.8;const arc=ea-sa;const ca=arc/chars.length;
  chars.forEach((ch,i)=>{const a=sa+ca*i+ca/2;ctx.save();ctx.translate(cx+r*Math.cos(a),cy+r*Math.sin(a));ctx.rotate(a-Math.PI/2);ctx.fillText(ch,0,0);ctx.restore()});
  ctx.restore();
}

const STAMP_PRESETS={
  secret:{main:'سري',top:'القوات المسلحة اليمنية',bot:'وزارة الدفاع',color:'#c0392b',shape:'circle'},
  top_secret:{main:'سري جداً',top:'القوات المسلحة اليمنية',bot:'وزارة الدفاع',color:'#7b0000',shape:'circle'},
  official:{main:'رسمي',top:'القوات المسلحة اليمنية',bot:'وزارة الدفاع',color:'#1a3a5c',shape:'circle'},
  approved:{main:'معتمد',top:'القوات المسلحة اليمنية',bot:'وزارة الدفاع',color:'#1a6b3c',shape:'circle'},
  urgent:{main:'عاجل',top:'القوات المسلحة اليمنية',bot:'وزارة الدفاع',color:'#e67e22',shape:'circle'},
  classified:{main:'مصنف',top:'القوات المسلحة اليمنية',bot:'وزارة الدفاع',color:'#5b2c8d',shape:'hexagon'},
  medical:{main:'طبي',top:'الخدمة الطبية العسكرية',bot:'وزارة الدفاع',color:'#e91e63',shape:'circle'},
  private:{main:'خاص',top:'القوات المسلحة اليمنية',bot:'وزارة الدفاع',color:'#546e7a',shape:'oval'}
};

function loadPreset(key){
  const p=STAMP_PRESETS[key];if(!p)return;
  document.getElementById('stMain').value=p.main;
  document.getElementById('stTop').value=p.top;
  document.getElementById('stBot').value=p.bot;
  document.getElementById('stColor').value=p.color;
  document.getElementById('stUnit').value=new Date().getFullYear();
  setShape(p.shape);
  drawStamp();
  toast(`تم تحميل ختم: ${p.main}`,'success');
}

function downloadStamp(){
  const cv=document.getElementById('stampCanvas');
  const a=document.createElement('a');a.download=`stamp-${S.stampCfg.main||'ختم'}-${Date.now()}.png`;a.href=cv.toDataURL('image/png');a.click();
  toast('تم تحميل الختم','success');
}

function copyStampToReport(){
  toast('تم إضافة الختم للتقرير الحالي','success');
  nav('newReport');
  setTimeout(()=>{document.getElementById('fStamp').value='official';livePreview()},300);
}
