// @ts-nocheck
// Ported from design/Rangotsav.dc.html. Untyped on purpose, like components/Rangotsav.tsx.
import { C, INK } from './palette';

export function posterGeom(word,tilt){return [...word].map((ch,i)=>({ch,ty:Math.sin(i*1.3+.6)*tilt*1.1,rot:(i%2?1:-1)*tilt*.55+Math.sin(i)*tilt*.3,skew:-tilt*.35}))}
export function drawPoster(cv,word,tilt,off,pal){
  const W=1080,H=1350;cv.width=W;cv.height=H;const x=cv.getContext('2d');
  x.fillStyle=INK;x.fillRect(0,0,W,H);x.fillStyle=C.marigold;x.fillRect(12,12,W-24,H-24);x.fillStyle=INK;x.fillRect(56,56,W-112,H-112);x.fillStyle=pal.bg;x.fillRect(64,64,W-128,H-128);
  [[90,90],[W-90,90],[90,H-90],[W-90,H-90]].forEach(([a,b])=>{x.save();x.translate(a,b);x.rotate(Math.PI/4);x.fillStyle=C.marigold;x.fillRect(-14,-14,28,28);x.lineWidth=4;x.strokeStyle=INK;x.strokeRect(-14,-14,28,28);x.restore()});
  const g=posterGeom(word,tilt),len=word.length;let fs=Math.min(420,860/(len*.7));x.font=`900 ${fs}px Sarpanch, sans-serif`;
  const ws=g.map(l=>x.measureText(l.ch).width),tot=ws.reduce((a,b)=>a+b,0);if(tot>860){fs*=860/tot;x.font=`900 ${fs}px Sarpanch, sans-serif`}
  const ws2=g.map(l=>x.measureText(l.ch).width),tot2=ws2.reduce((a,b)=>a+b,0),k=fs/100;
  x.textAlign='center';x.textBaseline='middle';
  const layer=(dx,dy,col)=>{x.save();x.translate(W/2,H/2);x.rotate(-tilt*.25*Math.PI/180);let cx=-tot2/2;g.forEach((l,i)=>{const w=ws2[i];x.save();x.translate(cx+w/2+dx,l.ty*k+dy);x.rotate(l.rot*Math.PI/180);x.transform(1,0,Math.tan(l.skew*Math.PI/180),1,0,0);x.fillStyle=col;x.fillText(l.ch,0,0);x.restore();cx+=w});x.restore()};
  layer((off+4)*k,(off*.8+4)*k,INK);layer(off*k,off*.8*k,pal.mis);layer(0,0,pal.fg);
  x.fillStyle=pal.fg;x.font='800 30px Sarpanch, sans-serif';x.textAlign='center';x.textBaseline='alphabetic';x.fillText('RANGOTSAV · KARKHANA · PEGASUS RVITM',W/2,H-100);
}
