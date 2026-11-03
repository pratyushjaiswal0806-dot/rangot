// @ts-nocheck
// Ported from design/Rangotsav.dc.html. Untyped on purpose. The truck-art drawing pieces (eyes,
// extruded lettering, banners) that the selfie frames and lib/art/truck.ts build from.
import { C, INK, TAU } from './palette';

export function flower(x,cx,cy,r,pc,cc){x.lineWidth=Math.max(2,r*.13);x.strokeStyle=INK;for(let k=0;k<6;k++){const a=k/6*TAU;x.beginPath();x.arc(cx+Math.cos(a)*r*.55,cy+Math.sin(a)*r*.55,r*.42,0,TAU);x.fillStyle=pc;x.fill();x.stroke()}x.beginPath();x.arc(cx,cy,r*.34,0,TAU);x.fillStyle=cc;x.fill();x.stroke()}
export function splitName(n){if(n.length>10&&n.includes(' ')){const i=n.indexOf(' ',Math.floor(n.length/2)-3);const k=i>0?i:n.indexOf(' ');return [n.slice(0,k),n.slice(k+1)]}return [n]}
export function pMark(x,cx,cy,r){x.beginPath();x.arc(cx,cy,r,0,TAU);x.fillStyle=INK;x.fill();x.lineWidth=r*.12;x.strokeStyle=C.marigold;x.stroke();x.fillStyle=C.marigold;x.font='900 '+(r*1.05)+'px Sarpanch, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('P',cx,cy+r*.05)}
export function stripes(x,px,py,pw,ph,col,gap,lw){x.save();x.beginPath();x.rect(px,py,pw,ph);x.clip();x.strokeStyle=col;x.lineWidth=lw;x.beginPath();for(let d=-ph;d<pw;d+=gap){x.moveTo(px+d,py);x.lineTo(px+d+ph,py+ph)}x.stroke();x.restore()}
export function checker(x,x0,y0,w,h,s){x.fillStyle=C.ivory;x.fillRect(x0,y0,w,h);x.fillStyle=INK;for(let i=0;i*s<w;i++)for(let j=0;j*s<h;j++)if((i+j)%2===0)x.fillRect(x0+i*s,y0+j*s,Math.min(s,w-i*s),Math.min(s,h-j*s))}
export function extruded(x,lines,cx,cy,maxW,maxH,maxS,o){
  const YA="'Yatra One', serif",W=x.canvas.width;let fs=maxS;x.font='400 '+fs+'px '+YA;
  const wm=Math.max(...lines.map(l=>x.measureText(l).width));
  fs=Math.floor(Math.min(fs,fs*maxW/wm,maxH/(lines.length*1.02+.12)));x.font='400 '+fs+'px '+YA;
  x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineCap='round';
  const lh=fs*1.02,y0=cy-(lines.length-1)*lh/2,dep=Math.max(4,Math.round(fs*.1)),dx=.6;
  lines.forEach((l,i)=>{const y=y0+i*lh;
    x.strokeStyle=INK;x.lineWidth=fs*.15;for(let k=dep;k>=0;k-=2)x.strokeText(l,cx+k*dx,y+k);x.strokeText(l,cx,y);
    x.fillStyle=o.side;for(let k=dep;k>=1;k--)x.fillText(l,cx+k*dx,y+k);
    x.save();x.beginPath();x.rect(0,y-fs,W,fs*.97);x.clip();x.fillStyle=o.f1;x.fillText(l,cx,y);x.restore();
    x.save();x.beginPath();x.rect(0,y-fs*.03,W,fs);x.clip();x.fillStyle=o.f2;x.fillText(l,cx,y);x.restore();
    x.lineWidth=Math.max(2,fs*.03);x.strokeStyle=INK;x.strokeText(l,cx,y);
  });
}
export function eye(x,cx,cy,w){
  const al=()=>{x.beginPath();x.moveTo(cx-w/2,cy);x.quadraticCurveTo(cx,cy-w*.55,cx+w/2,cy);x.quadraticCurveTo(cx,cy+w*.45,cx-w/2,cy);x.closePath()};
  x.lineCap='round';x.lineJoin='round';
  x.strokeStyle=INK;x.lineWidth=w*.07;x.beginPath();x.moveTo(cx-w*.56,cy-w*.3);x.quadraticCurveTo(cx,cy-w*.58,cx+w*.56,cy-w*.3);x.stroke();
  x.lineWidth=w*.022;for(let t=.18;t<=.83;t+=.13){const u=1-t,px=u*u*(cx-w/2)+2*u*t*cx+t*t*(cx+w/2),py=u*u*cy+2*u*t*(cy-w*.55)+t*t*cy,nx=(t-.5)*.9,ny=-1,m=Math.hypot(nx,ny);x.beginPath();x.moveTo(px,py);x.lineTo(px+nx/m*w*.09,py+ny/m*w*.09);x.stroke()}
  al();x.fillStyle=C.ivory;x.fill();
  x.save();al();x.clip();
  x.beginPath();x.arc(cx,cy+w*.02,w*.21,0,TAU);x.fillStyle=C.green;x.fill();x.lineWidth=w*.025;x.strokeStyle=INK;x.stroke();
  x.beginPath();x.arc(cx,cy+w*.02,w*.13,0,TAU);x.fillStyle=C.vermilion;x.fill();
  x.beginPath();x.arc(cx,cy+w*.02,w*.075,0,TAU);x.fillStyle=INK;x.fill();
  x.beginPath();x.arc(cx-w*.06,cy-w*.05,w*.035,0,TAU);x.fillStyle=C.ivory;x.fill();
  x.restore();
  al();x.lineWidth=w*.04;x.strokeStyle=INK;x.stroke();
}
export function okBanner(x,cx,cy,bw,bh,fs0,lw){
  const rx=cx-bw/2,ry=cy-bh/2,t=bh*.42;
  x.lineJoin='round';x.fillStyle=C.vermilion;x.strokeStyle=INK;x.lineWidth=lw;
  [[-1,rx],[1,rx+bw]].forEach(([s,ex])=>{x.beginPath();x.moveTo(ex-s*t,ry+bh*.22);x.lineTo(ex+s*t*1.5,ry+bh*.22);x.lineTo(ex+s*t*.9,cy+bh*.22);x.lineTo(ex+s*t*1.5,ry+bh*1.22);x.lineTo(ex-s*t,ry+bh*1.22);x.closePath();x.fill();x.stroke()});
  x.fillStyle=C.marigold;x.fillRect(rx,ry,bw,bh);x.lineWidth=lw*1.1;x.strokeRect(rx,ry,bw,bh);
  const r=bh*.56;let fs=fs0;const SP='Sarpanch, sans-serif';x.font='800 '+fs+'px '+SP;
  const meas=()=>{const a=x.measureText('RANGOTSAV').width,b=x.measureText('PLEASE!').width;return [a,b,a+b+2*r*1.45+fs*.6]};
  let [wa,wb,tot]=meas();if(tot>bw*.86){fs=Math.floor(fs*bw*.86/tot);x.font='800 '+fs+'px '+SP;[wa,wb,tot]=meas()}
  const s0=cx-tot/2;x.fillStyle=INK;x.textAlign='left';x.textBaseline='middle';
  x.fillText('RANGOTSAV',s0,cy+fs*.05);x.fillText('PLEASE!',s0+wa+fs*.6+2*r*1.45,cy+fs*.05);
  const ox=s0+wa+fs*.3+r*1.45;
  for(let i=0;i<10;i++){x.save();x.translate(ox,cy);x.rotate(i/10*TAU);x.beginPath();x.ellipse(0,-r*1.02,r*.24,r*.42,0,0,TAU);x.fillStyle=i%2?C.saffron:C.marigold;x.fill();x.lineWidth=lw*.55;x.strokeStyle=INK;x.stroke();x.restore()}
  x.beginPath();x.arc(ox,cy,r,0,TAU);x.fillStyle=C.vermilion;x.fill();x.lineWidth=lw*.9;x.strokeStyle=INK;x.stroke();
  x.beginPath();x.arc(ox,cy,r*.8,0,TAU);x.setLineDash([r*.12,r*.1]);x.lineWidth=lw*.4;x.strokeStyle=C.ivory;x.stroke();x.setLineDash([]);
  x.fillStyle=C.ivory;x.font='900 '+(r*.78)+'px '+SP;x.textAlign='center';x.fillText('OK',ox,cy+r*.05);
}
