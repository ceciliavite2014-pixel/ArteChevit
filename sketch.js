// Interactuar con mi obra — Cecilia Vite — UNA 2026
// La imagen original permanece intacta; las intervenciones se dibujan en capas.
const canvas = document.getElementById('obraCanvas');
const ctx = canvas.getContext('2d');
const img = new Image();
const modes = document.querySelectorAll('[data-mode]');
const hint = document.getElementById('hint');
const description = document.getElementById('modeDescription');
const overlay = document.createElement('canvas');
const oc = overlay.getContext('2d');
let mode = 'huella', pressed = false, previous = null;
let stamps = [], pieces = [], waves = [], pointer = null, raf = null;
const colors = [[20,130,240],[40,220,235],[75,185,105],[250,205,45],[245,115,45],[140,80,195]];
const texts = {
 huella:['Mové el mouse o arrastrá el dedo para dejar marcas de color.','Cada gesto deja una marca irrepetible sobre la imagen.'],
 revelar:['Mové el cursor o el dedo para abrir caminos en la oscuridad.','La imagen se descubre solamente donde alguien interviene.'],
 mirada:['Mové el cursor alrededor del ojo: la pupila intenta seguirte.','El espectador deja de ser el único que observa.'],
 fragmentar:['Hacé clic o tocá la obra para desplazar sus fragmentos.','Cada intervención altera la composición original.'],
 ondas:['Hacé clic o tocá la pintura para crear ondas.','La imagen reacciona a la presencia mediante vibraciones.'],
 libre:['Recorré la pintura para dejar huellas y revelar; hacé clic para fragmentar y crear ondas.','Todas las intervenciones conviven sobre una misma imagen.']
};
function has(k){return mode===k||mode==='libre'}
function base(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height)}
function reset(){
 if(!img.naturalWidth)return;
 canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
 overlay.width=canvas.width;overlay.height=canvas.height;
 stamps=[];pieces=[];waves=[];pointer=null;previous=null;
 if(has('revelar')){oc.fillStyle='rgba(8,18,28,.94)';oc.fillRect(0,0,overlay.width,overlay.height)}
 render();
}
function choose(m){
 mode=m;
 modes.forEach(b=>{let active=b.dataset.mode===m;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
 hint.textContent=texts[m][0];description.textContent=texts[m][1];reset();
}
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}
function addStamp(p){
 const c=colors[Math.floor(Math.random()*colors.length)];
 stamps.push({x:p.x,y:p.y,w:canvas.width*(.012+Math.random()*.014),h:canvas.width*(.007+Math.random()*.008),c});
 if(stamps.length>2500)stamps.shift();
}
function paintStamp(s){ctx.fillStyle=`rgba(${s.c.join(',')},.40)`;ctx.beginPath();ctx.ellipse(s.x,s.y,s.w,s.h,0,0,Math.PI*2);ctx.fill()}
function eraseAt(p){
 oc.save();oc.globalCompositeOperation='destination-out';oc.beginPath();
 oc.arc(p.x,p.y,canvas.width*.0625,0,Math.PI*2);oc.fill();oc.restore();
}
function addPiece(p){
 const w=canvas.width*.1625,h=canvas.width*.1625;
 const x=Math.max(0,Math.min(canvas.width-w,p.x-w/2)),y=Math.max(0,Math.min(canvas.height-h,p.y-h/2));
 pieces.push({x,y,w,h,dx:(Math.random()-.5)*canvas.width*.175,dy:(Math.random()-.5)*canvas.width*.175});
}
function drawPupil(){
 if(!pointer)return;
 const eye={x:canvas.width*.56,y:canvas.height*.24};
 const dx=Math.max(-canvas.width*.0375,Math.min(canvas.width*.0375,(pointer.x-eye.x)*.06));
 const dy=Math.max(-canvas.width*.03,Math.min(canvas.width*.03,(pointer.y-eye.y)*.06));
 ctx.save();ctx.fillStyle='rgba(12,20,35,.96)';ctx.beginPath();
 ctx.ellipse(eye.x+dx,eye.y+dy,canvas.width*.0225,canvas.width*.0275,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='rgba(255,255,255,.82)';ctx.beginPath();ctx.ellipse(eye.x+dx+canvas.width*.0075,eye.y+dy-canvas.width*.0125,canvas.width*.006,canvas.width*.0075,0,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawPieces(){for(const p of pieces){ctx.drawImage(img,p.x,p.y,p.w,p.h,p.x+p.dx,p.y+p.dy,p.w,p.h)}}
function drawWaves(){
 const now=performance.now();waves=waves.filter(w=>now-w.t<1500);
 for(const w of waves){const age=(now-w.t)/1500;
 ctx.strokeStyle=`rgba(80,220,240,${(1-age)*.86})`;ctx.lineWidth=Math.max(1,canvas.width*.005);
 ctx.beginPath();ctx.arc(w.x,w.y,canvas.width*(.0125+age*.30),0,Math.PI*2);ctx.stroke();}
}
function render(){
 if(!img.naturalWidth)return;
 base();
 if(has('revelar'))ctx.drawImage(overlay,0,0);
 if(has('huella'))stamps.forEach(paintStamp);
 if(has('mirada'))drawPupil();
 if(has('fragmentar'))drawPieces();
 if(has('ondas'))drawWaves();
}
function animate(){raf=null;render();if(waves.length&&has('ondas'))raf=requestAnimationFrame(animate)}
function act(p,click=false){
 pointer=p;
 if(has('huella')&&(!previous||Math.hypot(p.x-previous.x,p.y-previous.y)>canvas.width*.006||click))addStamp(p);
 if(has('revelar'))eraseAt(p);
 if(click&&has('fragmentar'))addPiece(p);
 if(click&&has('ondas'))waves.push({x:p.x,y:p.y,t:performance.now()});
 previous=p;
 render();if(waves.length&&has('ondas')&&!raf)raf=requestAnimationFrame(animate);
}
canvas.addEventListener('pointerdown',e=>{pressed=true;canvas.setPointerCapture(e.pointerId);act(point(e),true)});
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||pressed)act(point(e))});
canvas.addEventListener('pointerup',()=>{pressed=false;previous=null});
canvas.addEventListener('pointercancel',()=>{pressed=false;previous=null});
canvas.addEventListener('pointerleave',()=>{previous=null;if(has('mirada')){pointer=null;render()}});
document.getElementById('reset').addEventListener('click',reset);
modes.forEach(b=>b.addEventListener('click',()=>choose(b.dataset.mode)));
img.addEventListener('load',()=>choose('huella'));
img.src='huellas.jpg';
if(img.complete&&img.naturalWidth)choose('huella');
