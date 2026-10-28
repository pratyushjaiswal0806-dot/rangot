// @ts-nocheck
// Ported from design/Rangotsav.dc.html. Untyped on purpose, like components/Rangotsav.tsx.
import { TAU } from './palette';

export function drawBlock(x,type){
  x.lineCap='round';x.lineJoin='round';
  const out=()=>{x.globalCompositeOperation='destination-out'},ins=()=>{x.globalCompositeOperation='source-over'};
  const dot=(a,b,r)=>{x.beginPath();x.arc(a,b,r,0,TAU);x.fill()};
  if(type==='paisley'){
    const P=(s,dx,dy)=>{x.moveTo(dx,dy+40*s);x.bezierCurveTo(dx-40*s,dy+40*s,dx-42*s,dy-8*s,dx-12*s,dy-22*s);x.bezierCurveTo(dx+4*s,dy-30*s,dx+12*s,dy-38*s,dx+22*s,dy-46*s);x.bezierCurveTo(dx+22*s,dy-26*s,dx+36*s,dy-12*s,dx+32*s,dy+10*s);x.bezierCurveTo(dx+29*s,dy+30*s,dx+16*s,dy+40*s,dx,dy+40*s);x.closePath()};
    x.beginPath();P(1,0,0);x.fill();
    out();x.beginPath();P(.74,-1,4);x.fill();
    ins();x.beginPath();P(.52,-2,8);x.fill();
    out();x.beginPath();P(.3,-2.5,11);x.fill();
    ins();dot(-3,17,4);
    [[-44,26],[-47,4],[-37,-17],[-21,-33],[3,-44],[40,-8],[41,16],[30,40],[8,50],[-20,49]].forEach(([a,b])=>dot(a,b,3.2));
  }else if(type==='lotus'){
    const A=[-66,-33,0,33,66];
    x.beginPath();A.forEach(a=>{x.save();x.translate(0,18);x.rotate(a*Math.PI/180);x.moveTo(0,0);x.bezierCurveTo(-16,-12,-13,-38,0,-50);x.bezierCurveTo(13,-38,16,-12,0,0);x.restore()});x.fill();
    out();x.lineWidth=2.6;A.forEach(a=>{x.save();x.translate(0,18);x.rotate(a*Math.PI/180);x.beginPath();x.moveTo(0,-9);x.lineTo(0,-38);x.stroke();x.restore()});
    ins();x.fillRect(-36,24,72,7);dot(0,18,7);
    [-30,-15,0,15,30].forEach(a=>dot(a,40,3.4));
    x.lineWidth=3;x.strokeRect(-47,-47,94,94);
  }else{
    x.beginPath();x.ellipse(-6,2,31,21,0,0,TAU);x.fill();
    dot(24,-9,16);
    [[-31,12,11,26],[-15,14,11,24],[5,14,11,24],[19,10,11,28]].forEach(r=>x.fillRect(r[0],r[1],r[2],r[3]));
    x.lineWidth=9;x.beginPath();x.moveTo(36,-6);x.quadraticCurveTo(46,10,43,28);x.quadraticCurveTo(41,36,34,33);x.stroke();
    x.lineWidth=3;x.beginPath();x.moveTo(-36,-4);x.quadraticCurveTo(-45,6,-42,18);x.stroke();
    x.beginPath();x.moveTo(14,-22);x.lineTo(24,-35);x.lineTo(34,-22);x.closePath();x.fill();
    out();x.lineWidth=2.6;
    x.beginPath();x.ellipse(17,-6,8,11,-.2,0,TAU);x.stroke();
    dot(31,-13,2.4);
    x.strokeRect(-25,-15,30,19);
    [-20,-12,-4].forEach(a=>dot(a,5,3));
    [-17,-10,-3].forEach(a=>dot(a,-6,1.8));
    x.beginPath();x.moveTo(37,4);x.quadraticCurveTo(45,7,48,1);x.stroke();
    ins();x.fillRect(-46,40,94,4);
  }
  ins();
}
export function makeStamp(type,color,size){
  const d=Math.min(2,window.devicePixelRatio||1),s=Math.ceil(size*1.2*d);
  const c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');
  x.translate(s/2,s/2);x.scale(s/120,s/120);x.fillStyle=color;x.strokeStyle=color;drawBlock(x,type);
  x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='destination-out';
  const n=Math.round(s*s/80);
  for(let i=0;i<n;i++){x.globalAlpha=.25+Math.random()*.75;x.beginPath();x.arc(Math.random()*s,Math.random()*s,(Math.random()*1.3+.3)*d,0,TAU);x.fill()}
  for(let i=0;i<3;i++){x.globalAlpha=.12+Math.random()*.2;x.beginPath();x.arc(Math.random()*s,Math.random()*s,s*(.12+Math.random()*.2),0,TAU);x.fill()}
  x.globalAlpha=1;x.globalCompositeOperation='source-over';return c;
}
export function paintFabric(x,w,h){
  x.fillStyle='#F2E4C6';x.fillRect(0,0,w,h);
  x.lineWidth=1;x.strokeStyle='rgba(110,80,40,.07)';x.beginPath();for(let y=0;y<h;y+=3){x.moveTo(0,y+.5);x.lineTo(w,y+.5)}x.stroke();
  x.strokeStyle='rgba(110,80,40,.05)';x.beginPath();for(let i=0;i<w;i+=3){x.moveTo(i+.5,0);x.lineTo(i+.5,h)}x.stroke();
  x.strokeStyle='rgba(110,80,40,.09)';x.lineWidth=1.4;x.beginPath();for(let i=0;i<(w*h)/1600;i++){const a=Math.random()*w,b=Math.random()*h;x.moveTo(a,b);x.lineTo(a+6+Math.random()*14,b)}x.stroke();
}

export const BLOCK_TYPES=['paisley','lotus','elephant'];
// Presses one recipe stamp ({x,y,z} per-mille of the cloth width; r = fill the whole cloth) onto
// a W×H cloth. Same layout maths as the live tool, so replays land where the taps did.
export function blockPress(x,W,H,st,cache={}){const size=st.z*W/1000,type=BLOCK_TYPES[st.t]||'paisley',key=type+st.i+Math.round(size);
  if(!cache[key])cache[key]=[0,1,2].map(()=>makeStamp(type,st.i,Math.round(size)));
  const one=(px,py)=>{const v=cache[key][Math.floor(Math.random()*3)];x.save();x.globalCompositeOperation='multiply';x.globalAlpha=.84+Math.random()*.14;x.translate(px,py);x.rotate((Math.random()-.5)*.09);x.drawImage(v,-size*.6,-size*.6,size*1.2,size*1.2);x.restore()};
  const px=st.x*W/1000,py=st.y*W/1000;if(!st.r){one(px,py);return}
  const step=size*1.08,ox=((px%step)+step)%step,oy=((py%step)+step)%step;let col=0;
  for(let xx=ox-step;xx<W+step;xx+=step,col++){const off=col%2?step/2:0;for(let yy=oy-step-off;yy<H+step;yy+=step)one(xx,yy)}}
