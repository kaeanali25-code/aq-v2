/* maps.js */
const mapState={canvas:null,ctx:null,tool:'select',color:'#e74c3c',lw:2,opacity:1,drawing:false,sx:0,sy:0,elements:[],layers:{symbols:true,drawings:true,text:true},undoStack:[],zoom:1,panX:0,panY:0};

function initMap(){
  const cv=document.getElementById('mapCanvas');if(!cv)return;
  const par=cv.parentElement;
  cv.width=par.clientWidth;cv.height=par.clientHeight;
  mapState.canvas=cv;mapState.ctx=cv.getContext('2d');
  cv.onmousedown=mapDown;cv.onmousemove=mapMove;cv.onmouseup=mapUp;cv.onmouseleave=()=>{mapState.drawing=false;redrawMap()};
  cv.ontouchstart=e=>{e.preventDefault();mapDown(e.touches[0])};
  cv.ontouchmove=e=>{e.preventDefault();mapMove(e.touches[0])};
  cv.ontouchend=e=>{e.preventDefault();mapUp(e.changedTouches[0])};
  redrawMap();
}

function setTool(t){
  mapState.tool=t;
  document.querySelectorAll('.mt-btn').forEach(b=>b.classList.remove('active'));
  document.querySelector(`.mt-btn[data-tool="${t}"]`)?.classList.add('active');
  if(mapState.canvas)mapState.canvas.style.cursor=({select:'default',pan:'grab',eraser:'cell',text:'text'})[t]||'crosshair';
}
function updateMapOpts(){
  mapState.color=document.getElementById('mapColor')?.value||'#e74c3c';
  mapState.lw=parseInt(document.getElementById('mapLW')?.value)||2;
  mapState.opacity=parseFloat(document.getElementById('mapOpacity')?.value)||1;
}
function getPos(e){
  const r=mapState.canvas.getBoundingClientRect();
  return{x:e.clientX-r.left,y:e.clientY-r.top};
}

const SYM_TOOLS=['sym_friendly','sym_enemy','sym_objective','sym_base','sym_checkpoint','sym_supply','sym_medical','sym_artillery','sym_airfield','sym_hq'];

function mapDown(e){
  const p=getPos(e);mapState.drawing=true;mapState.sx=p.x;mapState.sy=p.y;
  if(SYM_TOOLS.includes(mapState.tool)){
    pushUndo();
    mapState.elements.push({kind:'symbol',sym:mapState.tool.replace('sym_',''),x:p.x,y:p.y,layer:'symbols'});
    mapState.drawing=false;redrawMap();
  }else if(mapState.tool==='text'){
    const txt=prompt('أدخل النص:','');
    if(txt){pushUndo();mapState.elements.push({kind:'text',text:txt,x:p.x,y:p.y,color:mapState.color,layer:'text'});}
    mapState.drawing=false;redrawMap();
  }else if(mapState.tool==='eraser'){
    pushUndo();
    mapState.elements=mapState.elements.filter(el=>{
      const ex=el.x||el.x1;const ey=el.y||el.y1;
      return Math.hypot(ex-p.x,ey-p.y)>24;
    });
    mapState.drawing=false;redrawMap();
  }else if(mapState.tool==='freehand'){
    pushUndo();
    mapState.elements.push({kind:'freehand',pts:[{x:p.x,y:p.y}],color:mapState.color,lw:mapState.lw,opacity:mapState.opacity,layer:'drawings'});
  }
}

function mapMove(e){
  const p=getPos(e);
  const coord=document.getElementById('mapCoords');
  if(coord)coord.textContent=`X: ${Math.round(p.x)} | Y: ${Math.round(p.y)}`;
  if(!mapState.drawing)return;
  if(mapState.tool==='freehand'){
    const last=mapState.elements[mapState.elements.length-1];
    if(last&&last.kind==='freehand')last.pts.push({x:p.x,y:p.y});
    redrawMap();return;
  }
  const draws=['line','arrow','dashed','rect','circle'];
  if(!draws.includes(mapState.tool))return;
  redrawMap();
  const ctx=mapState.ctx;
  ctx.save();ctx.globalAlpha=mapState.opacity;
  ctx.strokeStyle=mapState.color;ctx.lineWidth=mapState.lw;ctx.lineCap='round';
  if(mapState.tool==='dashed')ctx.setLineDash([8,5]);else ctx.setLineDash([]);
  if(mapState.tool==='line'||mapState.tool==='dashed'){ctx.beginPath();ctx.moveTo(mapState.sx,mapState.sy);ctx.lineTo(p.x,p.y);ctx.stroke();}
  else if(mapState.tool==='arrow'){drawArrow(ctx,mapState.sx,mapState.sy,p.x,p.y,mapState.color,mapState.lw);}
  else if(mapState.tool==='rect'){ctx.strokeRect(mapState.sx,mapState.sy,p.x-mapState.sx,p.y-mapState.sy);}
  else if(mapState.tool==='circle'){const rx=Math.abs(p.x-mapState.sx)/2,ry=Math.abs(p.y-mapState.sy)/2,cx=mapState.sx+(p.x-mapState.sx)/2,cy=mapState.sy+(p.y-mapState.sy)/2;ctx.beginPath();ctx.ellipse(cx,cy,rx||1,ry||1,0,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
}

function mapUp(e){
  if(!mapState.drawing)return;
  const p=getPos(e);mapState.drawing=false;
  const draws=['line','arrow','dashed','rect','circle'];
  if(!draws.includes(mapState.tool))return;
  pushUndo();
  mapState.elements.push({kind:mapState.tool,x1:mapState.sx,y1:mapState.sy,x2:p.x,y2:p.y,color:mapState.color,lw:mapState.lw,opacity:mapState.opacity,layer:'drawings'});
  redrawMap();
}

function drawArrow(ctx,x1,y1,x2,y2,color,lw){
  const hl=16,ang=Math.atan2(y2-y1,x2-x1);
  ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=lw;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x2,y2);
  ctx.lineTo(x2-hl*Math.cos(ang-Math.PI/6),y2-hl*Math.sin(ang-Math.PI/6));
  ctx.lineTo(x2-hl*Math.cos(ang+Math.PI/6),y2-hl*Math.sin(ang+Math.PI/6));
  ctx.closePath();ctx.fill();
}

const SYM_CFG={friendly:{color:'#4CAF50',shape:'rect',label:'F'},enemy:{color:'#f44336',shape:'diamond',label:'X'},objective:{color:'#FF9800',shape:'circle',label:'OBJ'},base:{color:'#2196F3',shape:'rect',label:'B'},checkpoint:{color:'#9C27B0',shape:'circle',label:'CP'},supply:{color:'#795548',shape:'rect',label:'S'},medical:{color:'#E91E63',shape:'cross',label:'+'},artillery:{color:'#FF5722',shape:'triangle',label:'A'},airfield:{color:'#00BCD4',shape:'circle',label:'✈'},hq:{color:'#FFC107',shape:'star',label:'HQ'}};

function drawSymbol(ctx,sym,x,y){
  const c=SYM_CFG[sym]||{color:'#fff',shape:'circle',label:'?'};
  const r=18;ctx.save();ctx.translate(x,y);
  ctx.fillStyle=c.color+'33';ctx.strokeStyle=c.color;ctx.lineWidth=2.5;
  if(c.shape==='circle'){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();}
  else if(c.shape==='rect'){ctx.fillRect(-r,-r,r*2,r*2);ctx.strokeRect(-r,-r,r*2,r*2);}
  else if(c.shape==='diamond'){ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r,0);ctx.lineTo(0,r);ctx.lineTo(-r,0);ctx.closePath();ctx.fill();ctx.stroke();}
  else if(c.shape==='triangle'){ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r,r);ctx.lineTo(-r,r);ctx.closePath();ctx.fill();ctx.stroke();}
  else if(c.shape==='cross'){ctx.fillStyle=c.color;ctx.fillRect(-r,-5,r*2,10);ctx.fillRect(-5,-r,10,r*2);}
  else if(c.shape==='star'){drawStar5(ctx,0,0,r,r*.45);ctx.fillStyle=c.color+'33';ctx.fill();ctx.stroke();}
  ctx.fillStyle=c.color;ctx.font='bold 9px Cairo';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(c.label,0,0);ctx.restore();
}

function drawStar5(ctx,cx,cy,or,ir){
  let rot=-Math.PI/2;ctx.beginPath();
  for(let i=0;i<5;i++){ctx.lineTo(cx+or*Math.cos(rot),cy+or*Math.sin(rot));rot+=Math.PI/5;ctx.lineTo(cx+ir*Math.cos(rot),cy+ir*Math.sin(rot));rot+=Math.PI/5;}ctx.closePath();
}

function redrawMap(){
  const cv=mapState.canvas;if(!cv)return;
  const ctx=mapState.ctx;const W=cv.width;const H=cv.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0d1b2a';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(201,162,39,.06)';ctx.lineWidth=1;ctx.setLineDash([]);
  for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  mapState.elements.forEach(el=>{
    if(!mapState.layers[el.layer||'drawings'])return;
    ctx.save();ctx.globalAlpha=el.opacity||1;
    if(el.kind==='symbol'){drawSymbol(ctx,el.sym,el.x,el.y);}
    else if(el.kind==='text'){ctx.font=`bold 14px Cairo`;ctx.fillStyle=el.color||'#fff';ctx.textAlign='right';ctx.fillText(el.text,el.x,el.y);}
    else if(el.kind==='freehand'){ctx.strokeStyle=el.color;ctx.lineWidth=el.lw||2;ctx.lineCap='round';ctx.lineJoin='round';ctx.setLineDash([]);ctx.beginPath();el.pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}
    else{
      ctx.strokeStyle=el.color;ctx.lineWidth=el.lw||2;ctx.lineCap='round';
      if(el.kind==='dashed')ctx.setLineDash([8,5]);else ctx.setLineDash([]);
      if(el.kind==='line'||el.kind==='dashed'){ctx.beginPath();ctx.moveTo(el.x1,el.y1);ctx.lineTo(el.x2,el.y2);ctx.stroke();}
      else if(el.kind==='arrow'){drawArrow(ctx,el.x1,el.y1,el.x2,el.y2,el.color,el.lw);}
      else if(el.kind==='rect'){ctx.strokeRect(el.x1,el.y1,el.x2-el.x1,el.y2-el.y1);}
      else if(el.kind==='circle'){const rx=Math.abs(el.x2-el.x1)/2,ry=Math.abs(el.y2-el.y1)/2,cx=el.x1+(el.x2-el.x1)/2,cy=el.y1+(el.y2-el.y1)/2;ctx.beginPath();ctx.ellipse(cx,cy,rx||1,ry||1,0,0,Math.PI*2);ctx.stroke();}
    }
    ctx.restore();
  });
}

function pushUndo(){mapState.undoStack.push(JSON.stringify(mapState.elements));if(mapState.undoStack.length>30)mapState.undoStack.shift();}
function undoMap(){if(mapState.undoStack.length){mapState.elements=JSON.parse(mapState.undoStack.pop());redrawMap();}else toast('لا يوجد شيء للتراجع عنه','info')}
function clearMap(){mapState.elements=[];redrawMap();toast('تم مسح الخريطة','info')}
function zoomMap(f){mapState.zoom*=f;redrawMap()}
function resetMapView(){mapState.zoom=1;redrawMap()}
function toggleLayer(name){mapState.layers[name]=!mapState.layers[name];redrawMap()}
function exportMap(){
  const link=document.createElement('a');link.download=`military-map-${Date.now()}.png`;link.href=mapState.canvas.toDataURL('image/png');link.click();
  toast('تم تصدير الخريطة','success');
}
