// @ts-nocheck
// Ported from design/Rangotsav.dc.html. Untyped on purpose, like components/Rangotsav.tsx.
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
export function drawPlate(cv,fmt,raw){
  const name=(raw||'').trim()||'Apna Naam',st=fmt==='sticker',W=st?512:1080,H=st?512:1920;
  if(cv.width!==W)cv.width=W;if(cv.height!==H)cv.height=H;
  const x=cv.getContext('2d');x.clearRect(0,0,W,H);x.lineJoin='round';
  const lines=splitName(name),ink={f1:C.vermilion,f2:C.saffron,side:'#4A0A26'};
  if(!st){
    x.fillStyle=INK;x.fillRect(0,0,W,H);
    checker(x,20,20,1040,1880,20);
    [[60,INK],[63,C.marigold],[75,INK],[78,C.green],[90,INK],[93,C.vermilion],[105,INK],[108,C.indigo]].forEach(([i,c])=>{x.fillStyle=c;x.fillRect(i,i,W-2*i,H-2*i)});
    stripes(x,108,108,W-216,H-216,'#264470',46,14);
    const cx=W/2,ab=632,arch=(i)=>{const l=132+i,r=948-i,b=ab;x.beginPath();x.moveTo(l,b);x.lineTo(l,370);x.bezierCurveTo(l,230+i*.4,380,180+i,cx,138+i);x.bezierCurveTo(700,180+i,r,230+i*.4,r,370);x.lineTo(r,b);x.closePath()};
    x.save();arch(0);x.clip();x.fillStyle=C.ruby;x.fillRect(0,0,W,ab);
    for(let i=0;i<28;i++){const a0=Math.PI+i/28*Math.PI,a1=Math.PI+(i+1)/28*Math.PI;x.beginPath();x.moveTo(cx,ab);x.arc(cx,ab,900,a0,a1);x.closePath();x.fillStyle=i%2?C.saffron:C.marigold;x.fill()}
    x.strokeStyle=INK;x.lineWidth=5;
    [[300,11,C.magenta,46,118],[218,9,'#C93A82',40,96],[140,7,C.ivory,32,72]].forEach(([R,n,col,rw,rh])=>{for(let k=0;k<n;k++){const a=Math.PI+(k+.5)/n*Math.PI;x.save();x.translate(cx+Math.cos(a)*R*.62,ab+Math.sin(a)*R*.62);x.rotate(a+Math.PI/2);x.beginPath();x.ellipse(0,0,rw,rh,0,0,TAU);x.fillStyle=col;x.fill();x.stroke();x.restore()}});
    x.beginPath();x.arc(cx,ab,70,Math.PI,TAU);x.closePath();x.fillStyle=C.green;x.fill();x.stroke();
    for(let k=0;k<5;k++){const a=Math.PI+(k+.5)/5*Math.PI;x.beginPath();x.arc(cx+Math.cos(a)*46,ab+Math.sin(a)*46,8,0,TAU);x.fillStyle=C.marigold;x.fill();x.lineWidth=3;x.stroke()}
    x.restore();
    arch(0);x.lineWidth=14;x.strokeStyle=INK;x.stroke();arch(14);x.lineWidth=5;x.strokeStyle=C.ivory;x.stroke();
    x.fillStyle=INK;x.fillRect(120,ab-6,840,16);x.fillStyle=C.marigold;x.fillRect(120,ab-2,840,8);
    const tc=[C.vermilion,C.green,C.magenta,C.saffron];
    for(let i=0;i<17;i++){const tx=150+i*(780/16);x.strokeStyle=INK;x.lineWidth=4;x.beginPath();x.moveTo(tx,ab+8);x.lineTo(tx,ab+30);x.stroke();
      x.beginPath();x.arc(tx,ab+38,9,0,TAU);x.fillStyle=C.marigold;x.fill();x.lineWidth=3.5;x.stroke();
      x.beginPath();x.moveTo(tx,ab+48);x.bezierCurveTo(tx+20,ab+68,tx+16,ab+92,tx,ab+100);x.bezierCurveTo(tx-16,ab+92,tx-20,ab+68,tx,ab+48);x.fillStyle=tc[i%4];x.fill();x.lineWidth=4;x.stroke();
      x.beginPath();x.arc(tx,ab+106,5,0,TAU);x.fillStyle=C.ivory;x.fill();x.lineWidth=2.5;x.stroke()}
    for(let y=780;y<1800;y+=64)[126,954].forEach(mx=>{x.beginPath();x.arc(mx,y,9,0,TAU);x.fillStyle=C.ivory;x.fill();x.lineWidth=3;x.strokeStyle=INK;x.stroke();x.beginPath();x.arc(mx-2,y-2,3,0,TAU);x.fillStyle=C.marigold;x.fill()});
    const bx=156,by=776,bw=768,bh=418;
    for(const [r,c] of [[24,INK],[17,C.green]]){const step=bw/19;for(let i=0;i<=19;i++){[by,by+bh].forEach(yy=>{x.beginPath();x.arc(bx+i*step,yy,r,0,TAU);x.fillStyle=c;x.fill()})}const sv=bh/10;for(let j=1;j<10;j++){[bx,bx+bw].forEach(xx=>{x.beginPath();x.arc(xx,by+j*sv,r,0,TAU);x.fillStyle=c;x.fill()})}}
    x.fillStyle=INK;x.fillRect(bx-7,by-7,bw+14,bh+14);x.fillStyle=C.green;x.fillRect(bx,by,bw,bh);
    x.fillStyle=C.ivory;x.fillRect(bx+16,by+16,bw-32,bh-32);x.lineWidth=5;x.strokeStyle=INK;x.strokeRect(bx+16,by+16,bw-32,bh-32);
    x.setLineDash([14,10]);x.lineWidth=3;x.strokeStyle=C.vermilion;x.strokeRect(bx+30,by+30,bw-60,bh-60);x.setLineDash([]);
    [[bx+46,by+46],[bx+bw-46,by+46],[bx+46,by+bh-46],[bx+bw-46,by+bh-46]].forEach(([fx,fy],i)=>flower(x,fx,fy,30,i%3?C.marigold:C.magenta,i%3?C.vermilion:C.marigold));
    x.fillStyle=C.ruby;x.font='700 44px Mukta, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('॥ शुभ यात्रा ॥',cx,by+70);
    extruded(x,lines,cx-6,by+bh/2+38,bw-150,bh-170,250,ink);
    const ey=1352;eye(x,330,ey,262);eye(x,750,ey,262);
    x.save();x.translate(cx,ey);x.rotate(Math.PI/4);x.fillStyle=C.marigold;x.fillRect(-20,-20,40,40);x.lineWidth=5;x.strokeStyle=INK;x.strokeRect(-20,-20,40,40);x.restore();
    x.fillStyle=C.marigold;x.font='800 40px Sarpanch, sans-serif';if('letterSpacing' in x)x.letterSpacing='8px';x.textAlign='center';x.textBaseline='alphabetic';x.fillText('NAZAR NA LAGE',cx+4,1468);if('letterSpacing' in x)x.letterSpacing='0px';
    okBanner(x,cx,1570,720,108,62,8);
    pMark(x,cx,1716,40);
    x.fillStyle=C.ivory;x.font='800 30px Mukta, sans-serif';x.textAlign='center';x.textBaseline='alphabetic';x.fillText('A PEGASUS · RVITM PROJECT',cx,1792);
  }else{
    const cx=256,cy=256;
    for(let i=0;i<32;i++){const a=i/32*TAU;x.beginPath();x.arc(cx+Math.cos(a)*230,cy+Math.sin(a)*230,24,0,TAU);x.fillStyle=INK;x.fill()}
    for(let i=0;i<32;i++){const a=i/32*TAU;x.beginPath();x.arc(cx+Math.cos(a)*230,cy+Math.sin(a)*230,17,0,TAU);x.fillStyle=i%2?C.marigold:C.saffron;x.fill()}
    x.beginPath();x.arc(cx,cy,228,0,TAU);x.fillStyle=INK;x.fill();
    x.beginPath();x.arc(cx,cy,222,0,TAU);x.fillStyle=C.ivory;x.fill();
    for(let i=0;i<48;i+=2){x.beginPath();x.arc(cx,cy,222,i/48*TAU,(i+1)/48*TAU);x.arc(cx,cy,202,(i+1)/48*TAU,i/48*TAU,true);x.closePath();x.fillStyle=INK;x.fill()}
    x.save();x.beginPath();x.arc(cx,cy,200,0,TAU);x.clip();
    for(let i=0;i<24;i++){x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,220,i/24*TAU,(i+1)/24*TAU);x.closePath();x.fillStyle=i%2?C.indigo:'#3A5E93';x.fill()}
    x.restore();
    x.beginPath();x.arc(cx,cy,200,0,TAU);x.lineWidth=6;x.strokeStyle=INK;x.stroke();
    eye(x,198,140,84);eye(x,314,140,84);
    const bx=28,by=196,bw=456,bh=118;
    x.fillStyle=INK;x.fillRect(bx-5,by-5,bw+10,bh+10);x.fillStyle=C.green;x.fillRect(bx,by,bw,bh);
    x.fillStyle=C.ivory;x.fillRect(bx+9,by+9,bw-18,bh-18);x.lineWidth=3;x.strokeStyle=INK;x.strokeRect(bx+9,by+9,bw-18,bh-18);
    [[bx+24,by+24],[bx+bw-24,by+24],[bx+24,by+bh-24],[bx+bw-24,by+bh-24]].forEach(([fx,fy])=>{x.beginPath();x.arc(fx,fy,6,0,TAU);x.fillStyle=C.vermilion;x.fill();x.lineWidth=2;x.strokeStyle=INK;x.stroke()});
    extruded(x,lines,cx-3,by+bh/2+2,bw-96,bh-26,110,ink);
    okBanner(x,cx,362,300,44,24,4);
    pMark(x,cx,436,22);
  }
}
