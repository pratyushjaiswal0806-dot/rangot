// @ts-nocheck
"use client";
// Ported from design/Rangotsav.dc.html (logic class). Untyped on purpose: it is a faithful port of
// the prototype's imperative canvas / DOM code. Markup lives in RangotsavView.generated.tsx.
import React from 'react';
import RangotsavView from './RangotsavView.generated';
import makersData from '../data/makers.json';

const INK='#1B1410';
const C={ivory:'#FBF3E4',parch:'#F6E7C8',marigold:'#FFC21A',saffron:'#E8761E',turmeric:'#DE9B1C',vermilion:'#CC3B22',magenta:'#B0246A',ruby:'#7A0E3A',green:'#2F6B3B',leaf:'#4F8A3C',indigo:'#2D4C7C',terracotta:'#B4542A',floor:'#3B2117'};
const TAU=Math.PI*2;
// Phone tool sheets: the drawing stage is at least as tall as the screen is wide (+28px fit
// padding) so square canvases fill the width; capped so the control tray keeps room.
const NARROW_STAGE='min(100vw + 28px, 62dvh)';
const RCOLS=[['Rice white',C.ivory],['Marigold',C.marigold],['Turmeric',C.turmeric],['Saffron',C.saffron],['Vermilion','#D8452A'],['Magenta','#C93A82'],['Leaf green',C.leaf],['Indigo','#4D6FA3']];
const KCOLS=[['Rice white',C.ivory],['Marigold',C.marigold],['Vermilion','#E0532E'],['Magenta','#D2448A']];
const INKS=[['Indigo',C.indigo],['Madder red',C.vermilion],['Magenta',C.magenta],['Forest green',C.green],['Kohl black',INK],['Turmeric',C.turmeric]];
const BLOCKS=[['paisley','Paisley'],['lotus','Lotus'],['elephant','Haathi']];
const PALS=[{name:'Turmeric on magenta',bg:C.magenta,fg:'#F2B230',mis:C.vermilion},{name:'Marigold on green',bg:C.green,fg:C.marigold,mis:C.saffron},{name:'Ivory on vermilion',bg:C.vermilion,fg:C.ivory,mis:C.indigo},{name:'Marigold on indigo',bg:C.indigo,fg:C.marigold,mis:C.magenta}];
const GREET={'Shubh Prabhat':['Shubh Prabhat','शुभ प्रभात','ಶುಭೋದಯ'],'Swagat':['Swagat!','स्वागत है','ಸುಸ್ವಾಗತ'],'Shubh Sandhya':['Shubh Sandhya','शुभ संध्या','ಶುಭ ಸಂಜೆ'],'Shubh Ratri':['Shubh Ratri','शुभ रात्रि','ಶುಭ ರಾತ್ರಿ']};
const MAKERS=makersData.map(m=>[m.name,m.role,m.color]);
const ROW_ORDER=[5,4,6,3,7,2,8,1,9,0,10];
const LS='rangotsav:diyas-mine';
const mkRng=()=>{let seed=20251027;return()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}};

function kTour(d){
  const n=d.length; if(n<4) return d.slice();
  const rest=d.slice(); let cur=rest.shift(); const out=[cur];
  while(rest.length){let bi=0,bd=Infinity;for(let i=0;i<rest.length;i++){const q=rest[i],dd=(q.x-cur.x)**2+(q.y-cur.y)**2;if(dd<bd-1e-6){bd=dd;bi=i}}cur=rest.splice(bi,1)[0];out.push(cur)}
  const D=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  for(let pass=0,imp=true;imp&&pass<30;pass++){imp=false;
    for(let i=0;i<n-2;i++)for(let j=i+2;j<n;j++){if(i===0&&j===n-1)continue;
      const a=out[i],b=out[i+1],c=out[j],e=out[(j+1)%n];
      if(D(a,c)+D(b,e)<D(a,b)+D(c,e)-1e-6){const seg=out.slice(i+1,j+1).reverse();out.splice(i+1,seg.length,...seg);imp=true}}}
  return out;
}
function kLoop(t,r,g=.6){
  const n=t.length,pts=[]; if(!n) return pts;
  if(n===1){for(let k=0;k<12;k++){const a=k/12*TAU;pts.push({x:t[0].x+r*Math.cos(a),y:t[0].y+r*Math.sin(a)})}return pts}
  for(let i=0;i<n;i++){const c=t[i],p=t[(i-1+n)%n],q=t[(i+1)%n];
    const ti=Math.atan2(p.y-c.y,p.x-c.x),to=Math.atan2(q.y-c.y,q.x-c.x);
    const a0=ti+g;let sw=(to-ti)%TAU;if(sw<0)sw+=TAU;if(sw<.35*Math.PI)sw+=TAU;
    const st=Math.max(3,Math.round(sw/.34));
    for(let k=0;k<=st;k++){const a=a0+sw*k/st;pts.push({x:c.x+r*Math.cos(a),y:c.y+r*Math.sin(a)})}}
  return pts;
}
function kBez(pts){const n=pts.length,s=[];if(n<3)return s;for(let i=0;i<n;i++){const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];s.push([p1,{x:p1.x+(p2.x-p0.x)/6,y:p1.y+(p2.y-p0.y)/6},{x:p2.x-(p3.x-p1.x)/6,y:p2.y-(p3.y-p1.y)/6},p2])}return s}
function kD(segs){if(!segs.length)return '';const f=v=>v.toFixed(2);let d=`M${f(segs[0][0].x)} ${f(segs[0][0].y)}`;for(const s of segs)d+=`C${f(s[1].x)} ${f(s[1].y)} ${f(s[2].x)} ${f(s[2].y)} ${f(s[3].x)} ${f(s[3].y)}`;return d+'Z'}
function ring(n,R,off=0){return Array.from({length:n},(_,i)=>{const a=off+i/n*TAU;return {x:R*Math.cos(a),y:R*Math.sin(a)}})}
function diamondCells(rows,c){const o=[];rows.forEach((w,j)=>{for(let k=0;k<w;k++)o.push([c-(w-1)/2+k,j])});return o}

function drawBlock(x,type){
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
function makeStamp(type,color,size){
  const d=Math.min(2,window.devicePixelRatio||1),s=Math.ceil(size*1.2*d);
  const c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');
  x.translate(s/2,s/2);x.scale(s/120,s/120);x.fillStyle=color;x.strokeStyle=color;drawBlock(x,type);
  x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='destination-out';
  const n=Math.round(s*s/80);
  for(let i=0;i<n;i++){x.globalAlpha=.25+Math.random()*.75;x.beginPath();x.arc(Math.random()*s,Math.random()*s,(Math.random()*1.3+.3)*d,0,TAU);x.fill()}
  for(let i=0;i<3;i++){x.globalAlpha=.12+Math.random()*.2;x.beginPath();x.arc(Math.random()*s,Math.random()*s,s*(.12+Math.random()*.2),0,TAU);x.fill()}
  x.globalAlpha=1;x.globalCompositeOperation='source-over';return c;
}
function paintFabric(x,w,h){
  x.fillStyle='#F2E4C6';x.fillRect(0,0,w,h);
  x.lineWidth=1;x.strokeStyle='rgba(110,80,40,.07)';x.beginPath();for(let y=0;y<h;y+=3){x.moveTo(0,y+.5);x.lineTo(w,y+.5)}x.stroke();
  x.strokeStyle='rgba(110,80,40,.05)';x.beginPath();for(let i=0;i<w;i+=3){x.moveTo(i+.5,0);x.lineTo(i+.5,h)}x.stroke();
  x.strokeStyle='rgba(110,80,40,.09)';x.lineWidth=1.4;x.beginPath();for(let i=0;i<(w*h)/1600;i++){const a=Math.random()*w,b=Math.random()*h;x.moveTo(a,b);x.lineTo(a+6+Math.random()*14,b)}x.stroke();
}
function flower(x,cx,cy,r,pc,cc){x.lineWidth=Math.max(2,r*.13);x.strokeStyle=INK;for(let k=0;k<6;k++){const a=k/6*TAU;x.beginPath();x.arc(cx+Math.cos(a)*r*.55,cy+Math.sin(a)*r*.55,r*.42,0,TAU);x.fillStyle=pc;x.fill();x.stroke()}x.beginPath();x.arc(cx,cy,r*.34,0,TAU);x.fillStyle=cc;x.fill();x.stroke()}
function splitName(n){if(n.length>10&&n.includes(' ')){const i=n.indexOf(' ',Math.floor(n.length/2)-3);const k=i>0?i:n.indexOf(' ');return [n.slice(0,k),n.slice(k+1)]}return [n]}
function pMark(x,cx,cy,r){x.beginPath();x.arc(cx,cy,r,0,TAU);x.fillStyle=INK;x.fill();x.lineWidth=r*.12;x.strokeStyle=C.marigold;x.stroke();x.fillStyle=C.marigold;x.font='900 '+(r*1.05)+'px Sarpanch, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('P',cx,cy+r*.05)}
function stripes(x,px,py,pw,ph,col,gap,lw){x.save();x.beginPath();x.rect(px,py,pw,ph);x.clip();x.strokeStyle=col;x.lineWidth=lw;x.beginPath();for(let d=-ph;d<pw;d+=gap){x.moveTo(px+d,py);x.lineTo(px+d+ph,py+ph)}x.stroke();x.restore()}
function checker(x,x0,y0,w,h,s){x.fillStyle=C.ivory;x.fillRect(x0,y0,w,h);x.fillStyle=INK;for(let i=0;i*s<w;i++)for(let j=0;j*s<h;j++)if((i+j)%2===0)x.fillRect(x0+i*s,y0+j*s,Math.min(s,w-i*s),Math.min(s,h-j*s))}
function extruded(x,lines,cx,cy,maxW,maxH,maxS,o){
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
function eye(x,cx,cy,w){
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
function okBanner(x,cx,cy,bw,bh,fs0,lw){
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
function drawPlate(cv,fmt,raw){
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
function posterGeom(word,tilt){return [...word].map((ch,i)=>({ch,ty:Math.sin(i*1.3+.6)*tilt*1.1,rot:(i%2?1:-1)*tilt*.55+Math.sin(i)*tilt*.3,skew:-tilt*.35}))}
function storyCard(cv,sub){
  const W=1080,H=1920,o=document.createElement('canvas');o.width=W;o.height=H;const x=o.getContext('2d');
  x.fillStyle=C.ruby;x.fillRect(0,0,W,H);
  stripes(x,0,0,W,H,'rgba(255,194,26,.07)',54,18);
  x.lineJoin='round';x.strokeStyle=INK;x.lineWidth=16;x.strokeRect(36,36,W-72,H-72);x.strokeStyle=C.marigold;x.lineWidth=6;x.strokeRect(56,56,W-112,H-112);
  x.textAlign='center';x.textBaseline='middle';
  x.font="400 150px 'Yatra One', serif";x.lineWidth=22;x.strokeStyle=INK;x.strokeText('RANGOTSAV',W/2,250);x.fillStyle=C.marigold;x.fillText('RANGOTSAV',W/2,250);
  x.font='800 54px Sarpanch, sans-serif';if('letterSpacing' in x)x.letterSpacing='6px';x.fillStyle=C.ivory;x.fillText(sub.toUpperCase(),W/2,375);if('letterSpacing' in x)x.letterSpacing='0px';
  const side=840,fx=(W-side)/2,fy=500;
  x.fillStyle=INK;x.fillRect(fx-16+22,fy-16+22,side+32,side+32);
  x.fillStyle=INK;x.fillRect(fx-16,fy-16,side+32,side+32);x.fillStyle=C.ivory;x.fillRect(fx-8,fy-8,side+16,side+16);
  const m=Math.min(cv.width,cv.height),sx=(cv.width-m)/2,sy=(cv.height-m)/2;x.drawImage(cv,sx,sy,m,m,fx,fy,side,side);
  x.lineWidth=6;x.strokeStyle=INK;x.strokeRect(fx-8,fy-8,side+16,side+16);
  x.fillStyle=C.ivory;x.font="400 70px 'Yatra One', serif";x.fillText('Made by me. Now you try.',W/2,1500);
  x.fillStyle=C.marigold;x.font='700 44px Mukta, sans-serif';x.fillText('Draw · Weave · Print · Paint',W/2,1575);
  pMark(x,W/2,1672,46);
  x.fillStyle=C.ivory;x.font='800 32px Mukta, sans-serif';x.fillText('A PEGASUS · RVITM PROJECT',W/2,1758);
  x.fillStyle=C.marigold;x.font='800 36px Sarpanch, sans-serif';x.fillText(location.host,W/2,1812);
  return o;
}
const CAPTION='I made this at Rangotsav! Draw rangoli, weave kolam, block-print cloth and paint truck art. #Rangotsav #IndianArt #Rangoli #Kolam #RVITM #Pegasus';

function drawPoster(cv,word,tilt,off,pal){
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

export default class Rangotsav extends React.Component {
  static defaultProps={ambient:'Festive',sound:'On',greeting:'Auto',diyaApiUrl:'/api/diyas',clubUrl:'#'};
  state={tool:null,trayOpen:true,sym:8,rColor:C.ivory,rSize:6,rGrid:true,kColor:C.ivory,kShowDots:true,kCount:0,block:'paisley',ink:C.indigo,bSize:96,bRepeat:false,tdWord:'MELA',tdTilt:8,tdOff:6,tdPal:0,plateName:'',plateFmt:'wallpaper',mine:0,apiCount:null,pending:0,lit:false,sparkOn:false,rowLit:5,morph:0,tiltAsk:false,toast:'',wide:false,ready:false,navOn:false,active:'',rCanUndo:false,bCanUndo:false,rTouched:false,countAnim:null};
  isPhone=typeof window!=='undefined'&&Math.min(window.innerWidth,(window.screen&&screen.width)||9999)<700;
  reduced=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  rnd=mkRng();
  petalSeed=Array.from({length:14},(_,i)=>{const w=10+this.rnd()*8;return {left:(this.rnd()*100).toFixed(1)+'%',w:w.toFixed(0)+'px',h:(w*1.35).toFixed(0)+'px',dur:(12+this.rnd()*10).toFixed(1)+'s',delay:(-this.rnd()*22).toFixed(1)+'s',dx:((this.rnd()-.5)*120).toFixed(0)+'px',color:[C.marigold,C.saffron,C.vermilion,C.magenta,C.marigold,C.ivory][i%6]}});
  toran=Array.from({length:17},(_,i)=>({leaf:i%2===0,bud:i%2===1,color:i%4===0?C.green:C.leaf,dur:(3.4+this.rnd()*2).toFixed(2)+'s',delay:(-this.rnd()*6).toFixed(2)+'s'}));
  strand=Array.from({length:10},(_,i)=>({color:i%2?C.saffron:C.marigold}));
  heroDiyas=Array.from({length:5},()=>({delay:(-this.rnd()*3).toFixed(2)+'s'}));
  rowDelays=Array.from({length:11},()=>(-this.rnd()*3).toFixed(2)+'s');
  heroK=(()=>{const o=ring(12,40,-Math.PI/2),inn=ring(6,21,-Math.PI/2+Math.PI/6);
    const dots=[...o.map(p=>({x:p.x.toFixed(2),y:p.y.toFixed(2),r:1.3,c:C.marigold})),...inn.map(p=>({x:p.x.toFixed(2),y:p.y.toFixed(2),r:1.2,c:C.ivory})),{x:0,y:0,r:1.4,c:C.marigold},...ring(24,49,-Math.PI/2).map(p=>({x:p.x.toFixed(2),y:p.y.toFixed(2),r:.8,c:C.ivory}))];
    return {outer:kD(kBez(kLoop(o,6.4))),inner:kD(kBez(kLoop(inn,6))),dots}})();
  kPrev=(()=>{const cells=diamondCells([1,3,5,3,1],2),pts=cells.map(([i,j])=>({x:(i-2)*15,y:(j-2)*15}));return {d:kD(kBez(kLoop(kTour(pts),6.2))),dots:pts.map(p=>({x:p.x,y:p.y}))}})();
  prevA=Array.from({length:12},(_,i)=>({rot:`rotate(${i*30})`}));
  prevB=Array.from({length:8},(_,i)=>({rot:`rotate(${i*45+22.5})`}));
  prevDots=ring(24,44).map(p=>({x:p.x.toFixed(2),y:p.y.toFixed(2)}));
  makers=MAKERS.map((m,i)=>({name:m[0],role:m[1],color:m[2],slot:'maker-'+(i+1),ph:'Photo of '+m[0].split(' ')[0]}));
  kDots=new Map();
  blockTileRefs=Object.fromEntries(BLOCKS.map(([id])=>[id,el=>{if(!el)return;const d=2;el.width=el.height=56*d;const x=el.getContext('2d');x.scale(d,d);x.translate(28,28);x.scale(.5,.5);x.fillStyle=INK;x.strokeStyle=INK;drawBlock(x,id)}]));

  componentDidMount(){
    this.dead=false;
    this.setState({ready:true,wide:matchMedia('(min-width: 900px)').matches});
    try{const m=parseInt(localStorage.getItem(LS)||'0',10)||0;this.setState({mine:m,rowLit:Math.min(11,5+m)})}catch(e){}
    const url=this.props.diyaApiUrl;if(url)fetch(url).then(r=>r.json()).then(d=>{if(typeof d.count==='number')this.setState({apiCount:d.count})}).catch(()=>{});
    this.onScroll=()=>{if(this.sRaf)return;this.sRaf=requestAnimationFrame(()=>{this.sRaf=0;const el=this.morphEl;if(!el||this.morphPinned)return;const r=el.getBoundingClientRect(),y=(r.top+r.height/2)/innerHeight,m=y>.62?0:y>.4?1:2;if(m!==this.state.morph)this.setState({morph:m})})};
    window.addEventListener('scroll',this.onScroll,{passive:true});
    this.onKey=e=>{const t=this.state.tool;if(!t)return;
      if(e.key==='Escape'){this.closeTool();return}
      if((e.metaKey||e.ctrlKey)&&(e.key||'').toLowerCase()==='z'){e.preventDefault();if(t==='rangoli')this.rUndo();else if(t==='block')this.bUndo();return}
      if(e.key==='Tab'){const d=document.querySelector('[role="dialog"]');if(!d)return;const f=[...d.querySelectorAll('button:not([disabled]),input,[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null);if(!f.length)return;const a=f[0],b=f[f.length-1],ae=document.activeElement;if(!d.contains(ae)){e.preventDefault();a.focus()}else if(e.shiftKey&&ae===a){e.preventDefault();b.focus()}else if(!e.shiftKey&&ae===b){e.preventDefault();a.focus()}}};window.addEventListener('keydown',this.onKey);
    if('IntersectionObserver' in window){
      this.io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.style.setProperty('--rv','running');this.io.unobserve(en.target)}}),{threshold:.12});
      this.observeReveal();
      this.heroIO=new IntersectionObserver(es=>{const en=es[0];this.heroVisible=en.isIntersecting;const on=en.intersectionRatio<.12;if(on!==this.state.navOn)this.setState({navOn:on})},{threshold:[0,.12,.3]});
      this.secIO=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting&&en.target.id!==this.state.active)this.setState({active:en.target.id})}),{rootMargin:'-45% 0px -50% 0px'});
      ['about','courtyard','karkhana','nameplate','behind','diya'].forEach(id=>{const el=document.getElementById(id);el&&this.secIO.observe(el)});
      const dEl=document.getElementById('diya');
      if(dEl){if(!this.reduced)this.setState({countAnim:0});this.diyaIO=new IntersectionObserver(es=>{this.diyaVisible=es[0].isIntersecting;if(es[0].isIntersecting&&!this.counted){this.counted=true;this.countUp()}},{threshold:.25});this.diyaIO.observe(dEl)}if(this.hero)this.heroIO.observe(this.hero);
    }else document.querySelectorAll('[data-reveal]').forEach(el=>el.style.setProperty('--rv','running'));
    this.setupTilt();
    this.mq=matchMedia('(min-width: 900px)');this.onMq=e=>this.setState({wide:e.matches});this.mq.addEventListener?this.mq.addEventListener('change',this.onMq):this.mq.addListener(this.onMq);
    this.onResize=()=>{clearTimeout(this.rzT);this.rzT=setTimeout(()=>{if(this.state.tool)this.refitTool()},220)};window.addEventListener('resize',this.onResize);
    if(url)this.pollT=setInterval(()=>{if(this.diyaVisible&&!document.hidden)fetch(url).then(r=>r.json()).then(d=>{if(typeof d.count==='number'&&!this.state.pending)this.setState({apiCount:d.count})}).catch(()=>{})},20000);
    if(document.fonts){Promise.all(["400 100px 'Yatra One'","900 100px Sarpanch","800 100px Sarpanch","700 40px Mukta","800 30px Mukta"].map(f=>document.fonts.load(f).catch(()=>{}))).then(()=>this.drawPlateNow())}
  }
  componentWillUnmount(){this.dead=true;this.hero&&this.onHeroMove&&this.hero.removeEventListener('pointermove',this.onHeroMove);clearTimeout(this.tt);clearTimeout(this.sparkT);clearTimeout(this.mpT);cancelAnimationFrame(this.kRaf);cancelAnimationFrame(this.tRaf);document.documentElement.style.overflow='';document.body.style.overflow='';window.removeEventListener('resize',this.onResize);this.mq&&(this.mq.removeEventListener?this.mq.removeEventListener('change',this.onMq):this.mq.removeListener(this.onMq));this.secIO&&this.secIO.disconnect();this.diyaIO&&this.diyaIO.disconnect();clearInterval(this.pollT);clearTimeout(this.cT);window.removeEventListener('scroll',this.onScroll);window.removeEventListener('keydown',this.onKey);window.removeEventListener('deviceorientation',this.onOrient);this.io&&this.io.disconnect();this.heroIO&&this.heroIO.disconnect();cancelAnimationFrame(this.dRaf);clearTimeout(this.driftT)}
  componentDidUpdate(){
    const s=this.state,ps=this._ps||{tool:null,plateName:s.plateName,plateFmt:s.plateFmt,kColor:s.kColor,kShowDots:s.kShowDots,wide:s.wide,active:s.active};this._ps={...s};
    if(ps.tool!==s.tool){const lock=s.tool?'hidden':'';document.documentElement.style.overflow=lock;document.body.style.overflow=lock;if(s.tool)setTimeout(()=>this.closeBtn&&this.closeBtn.focus(),60);else{this.observeReveal();this.lastOpener&&this.lastOpener.focus&&this.lastOpener.focus()}}
    if(ps.plateName!==s.plateName||ps.plateFmt!==s.plateFmt)this.drawPlateNow();
    if(s.tool==='kolam'&&(ps.kColor!==s.kColor||ps.kShowDots!==s.kShowDots))this.kPaint(1);
    if((ps.wide!==s.wide||ps.trayOpen!==s.trayOpen)&&s.tool)requestAnimationFrame(()=>this.refitTool());
    if(ps.active!==s.active&&this.navRow){const a=this.navRow.querySelector('[aria-current="true"]');if(a)this.navRow.scrollTo({left:a.offsetLeft-this.navRow.clientWidth/2+a.offsetWidth/2,behavior:this.reduced?'auto':'smooth'})}
  }
  observeReveal(){if(!this.io)return;document.querySelectorAll('[data-reveal]').forEach(el=>{if(el.style.getPropertyValue('--rv')!=='running')this.io.observe(el)})}

  setHero=el=>{this.hero=el};
  setMorph=el=>{this.morphEl=el};
  setCloseBtn=el=>{this.closeBtn=el};
  setNavRow=el=>{this.navRow=el};
  setCountEl=el=>{this.countEl=el};
  buzz(p){try{if(navigator.vibrate)navigator.vibrate(p)}catch(e){}}
  ting(){if(this.props.sound==='Off')return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const a=this.ac||(this.ac=new A());if(a.state==='suspended')a.resume();const t=a.currentTime;[[880,.1],[1320,.06],[2640,.02]].forEach(([f,v])=>{const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=f*(1+Math.random()*.012);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+1.8);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+1.9)})}catch(e){}}
  copyCv(cv){const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;c.getContext('2d').drawImage(cv,0,0);return c}
  snap(cv,key){const h=this[key]=this[key]||[];h.push(this.copyCv(cv));if(h.length>10)h.shift()}
  restore(cv,key){const h=this[key];if(!h||!h.length)return false;const x=cv.getContext('2d');x.save();x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='copy';x.drawImage(h.pop(),0,0);x.restore();return true}
  rSnap(){if(!this.rc)return;this.snap(this.rc,'rHist');if(!this.state.rCanUndo)this.setState({rCanUndo:true})}
  rUndo=()=>{if(this.rc&&this.restore(this.rc,'rHist')){this.buzz(8);this.setState({rCanUndo:this.rHist.length>0})}};
  bSnap(){if(!this.bc)return;this.snap(this.bc,'bHist');if(!this.state.bCanUndo)this.setState({bCanUndo:true})}
  bUndo=()=>{if(this.bc&&this.restore(this.bc,'bHist')){this.buzz(8);this.setState({bCanUndo:this.bHist.length>0})}};
  refitTool(){const t=this.state.tool,fit=st=>Math.max(220,Math.floor(Math.min(st.width-28,st.height-28)));
    if(t==='rangoli'&&this.rc){const side=fit(this.rc.parentElement.parentElement.getBoundingClientRect());if(Math.abs(side-this.rSide)<8)return;const tmp=this.copyCv(this.rc);this.initRangoli();this.rCtx.drawImage(tmp,0,0,this.rSide,this.rSide)}
    else if(t==='kolam'&&this.kc){const side=fit(this.kc.parentElement.getBoundingClientRect());if(Math.abs(side-this.kSide)<8)return;this.initKolam()}
    else if(t==='block'&&this.bc){const st=this.bc.parentElement.getBoundingClientRect();if(Math.abs(st.width-24-this.bW)<8&&Math.abs(st.height-60-this.bH)<8)return;const tmp=this.copyCv(this.bc),ow=this.bW,oh=this.bH;this.initBlock();this.bCtx.drawImage(tmp,0,0,ow,oh)}}
  countVal(s=this.state){return s.apiCount!=null?s.apiCount+s.pending:428+s.mine}
  countUp(){if(this.reduced)return;const N=26;let i=0;const step=()=>{i++;if(i>=N||this.dead){this.cT=0;this.setState({countAnim:null});return}const e=1-Math.pow(1-i/N,3);this.setState({countAnim:Math.round(this.countVal()*e)});this.cT=setTimeout(step,55)};this.cT=setTimeout(step,55)}
  setupTilt(){
    const h=this.hero;if(!h)return;this.layers=[...h.querySelectorAll('[data-depth]')];
    this.onOrient=e=>{if(e.gamma==null)return;this.gotOrient=true;this.tiltTo(Math.max(-1,Math.min(1,e.gamma/22)),Math.max(-1,Math.min(1,((e.beta==null?45:e.beta)-45)/22)))};
    this.onHeroMove=e=>{if(e.pointerType!=='mouse')return;const r=h.getBoundingClientRect();this.tiltTo((e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height*2-1)};h.addEventListener('pointermove',this.onHeroMove);
    if(this.reduced||this.props.ambient==='Off')return;
    const DOE=window.DeviceOrientationEvent,coarse=matchMedia('(pointer: coarse)').matches;
    if(DOE&&typeof DOE.requestPermission==='function'){if(coarse)this.setState({tiltAsk:true})}
    else if(DOE)window.addEventListener('deviceorientation',this.onOrient);
    if(coarse)this.driftT=setTimeout(()=>{if(!this.gotOrient)this.startDrift()},1800);
  }
  tiltTo(tx,ty){this.tx=tx;this.ty=ty;if(this.tRaf)return;this.tRaf=requestAnimationFrame(()=>{this.tRaf=0;for(const l of this.layers){const d=+l.dataset.depth;l.style.transform=`translate3d(${(this.tx*d*12).toFixed(1)}px,${(this.ty*d*7).toFixed(1)}px,0)`}})}
  startDrift(){const loop=now=>{if(this.gotOrient||this.dead)return;if(this.heroVisible!==false)this.tiltTo(Math.sin(now/2600)*.6,Math.cos(now/3300)*.4);this.dRaf=requestAnimationFrame(loop)};this.dRaf=requestAnimationFrame(loop)}
  askTilt=()=>{const D=window.DeviceOrientationEvent;D.requestPermission().then(p=>{if(p==='granted'){window.addEventListener('deviceorientation',this.onOrient);this.flash('Tilt away!')}else{this.flash('No worries, the arches will sway on their own.');this.startDrift()}this.setState({tiltAsk:false})}).catch(()=>this.setState({tiltAsk:false}))};

  flash(msg){this.setState({toast:msg});clearTimeout(this.tt);this.tt=setTimeout(()=>this.setState({toast:''}),2600)}
  async saveCanvas(cv,filename,title){
    const text=CAPTION+' '+location.origin;try{navigator.clipboard&&navigator.clipboard.writeText(text).catch(()=>{})}catch(e){}
    const blob=await new Promise(r=>cv.toBlob(r,'image/png'));if(!blob){this.flash('Could not save, try again');return}
    try{const file=new File([blob],filename,{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title,text});this.flash('Shared! Caption copied too. Shabaash.');return}}catch(e){if(e&&e.name==='AbortError')return}
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);this.flash('Saved! Caption copied: post it with #Rangotsav');
  }
  shareCreation(cv,filename,title,sub){return this.saveCanvas(storyCard(cv,sub),filename,title)}
  shareSite=async()=>{const url=location.origin+location.pathname,text='Come play at Rangotsav: draw rangoli, weave kolam, block-print cloth and paint a truck-art name plate.';
    try{if(navigator.share){await navigator.share({title:'Rangotsav',text,url});return}}catch(e){if(e&&e.name==='AbortError')return}
    try{await navigator.clipboard.writeText(text+' '+url);this.flash('Link copied. Send it to a friend!')}catch(e){window.open('https://wa.me/?text='+encodeURIComponent(text+' '+url),'_blank','noopener')}}
  scrollToId(id){const el=document.getElementById(id);if(!el)return;window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-(id==='swagat'?0:60),behavior:this.reduced?'auto':'smooth'})}
  openTool(t,e){this.lastOpener=e&&e.currentTarget;this.setState({tool:t,trayOpen:true})}
  closeTool=()=>{cancelAnimationFrame(this.kRaf);this.setState({tool:null})};

  // Rangoli
  setRangoliCanvas=el=>{this.rc=el;if(el)requestAnimationFrame(()=>this.initRangoli())};
  initRangoli(){const el=this.rc;if(!el)return;const stage=el.parentElement.parentElement,r=stage.getBoundingClientRect();const side=Math.max(220,Math.floor(Math.min(r.width-28,r.height-28)));const d=Math.min(2,window.devicePixelRatio||1);el.style.width=el.style.height=side+'px';el.width=el.height=Math.round(side*d);const x=el.getContext('2d');x.setTransform(d,0,0,d,0,0);this.rCtx=x;this.rSide=side;this.rFloor();this.rHist=[];this.setState({rReady:true,rCanUndo:false})}
  rFloor(){const x=this.rCtx,s=this.rSide;if(!x)return;x.fillStyle=C.floor;x.fillRect(0,0,s,s);x.fillStyle='rgba(251,243,228,.035)';for(let i=0;i<s*s/220;i++){x.fillRect(Math.random()*s,Math.random()*s,1.5,1.5)}}
  rPt(e){const b=this.rc.getBoundingClientRect();return {x:e.clientX-b.left-b.width/2,y:e.clientY-b.top-b.height/2}}
  rSeg(a,b){const x=this.rCtx;if(!x)return;const n=this.state.sym,h=this.rSide/2,sz=this.state.rSize;x.save();x.translate(h,h);x.strokeStyle=this.state.rColor;x.fillStyle=this.state.rColor;x.lineWidth=sz;x.lineCap='round';x.lineJoin='round';
    const pts=[];x.beginPath();for(let k=0;k<n;k++){const t=k*TAU/n,c=Math.cos(t),si=Math.sin(t);for(const f of [1,-1]){const R=p=>({x:p.x*c-p.y*f*si,y:p.x*si+p.y*f*c});const A=R(a),B=R(b);x.moveTo(A.x,A.y);x.lineTo(B.x,B.y);pts.push(B)}}x.stroke();
    x.restore()}
  rDown=e=>{e.preventDefault();this.rSnap();this.buzz(6);if(!this.state.rTouched)this.setState({rTouched:true});try{this.rc.setPointerCapture(e.pointerId)}catch(_){}this.rLast=this.rPt(e);this.rSeg(this.rLast,this.rLast)};
  rMove=e=>{if(!this.rLast)return;e.preventDefault();const p=this.rPt(e);this.rSeg(this.rLast,p);this.rLast=p};
  rUp=()=>{this.rLast=null};
  rSave=()=>{const s=this.rc;if(!s)return;const o=document.createElement('canvas');o.width=s.width;o.height=s.height;const x=o.getContext('2d');x.drawImage(s,0,0);this.shareCreation(o,'my-rangoli.png','My Rangoli','My Rangoli')};

  // Kolam
  setKolamCanvas=el=>{this.kc=el;if(el)requestAnimationFrame(()=>this.initKolam())};
  initKolam(){const el=this.kc;if(!el)return;const stage=el.parentElement,r=stage.getBoundingClientRect();const side=Math.max(220,Math.floor(Math.min(r.width-28,r.height-28)));const d=Math.min(2,window.devicePixelRatio||1);el.style.width=el.style.height=side+'px';el.width=el.height=Math.round(side*d);const x=el.getContext('2d');x.setTransform(d,0,0,d,0,0);this.kCtx=x;this.kSide=side;if(!this.kDots.size)this.kPreset('diamond');else this.kRebuild(false)}
  kPaint(prog=1){const x=this.kCtx;if(!x)return;const S=this.kSide,s=S/7;x.fillStyle=C.floor;x.fillRect(0,0,S,S);
    x.fillStyle='rgba(251,243,228,.2)';for(let i=0;i<7;i++)for(let j=0;j<7;j++){x.beginPath();x.arc((i+.5)*s,(j+.5)*s,1.8,0,TAU);x.fill()}
    const segs=this.kSegs||[],n=Math.floor(segs.length*prog);
    if(this.kDots.size===1&&prog>0){const [[i,j]]=[...this.kDots.values()];x.strokeStyle=this.state.kColor;x.lineWidth=Math.max(3,s*.07);x.beginPath();x.arc((i+.5)*s,(j+.5)*s,s*.42,0,TAU*prog);x.stroke()}
    if(n){x.strokeStyle=this.state.kColor;x.lineWidth=Math.max(3,s*.07);x.lineCap='round';x.lineJoin='round';x.beginPath();x.moveTo(segs[0][0].x,segs[0][0].y);for(let i=0;i<n;i++){const g=segs[i];x.bezierCurveTo(g[1].x,g[1].y,g[2].x,g[2].y,g[3].x,g[3].y)}x.stroke()}
    if(this.state.kShowDots){x.fillStyle=C.ivory;this.kDots.forEach(([i,j])=>{x.beginPath();x.arc((i+.5)*s,(j+.5)*s,Math.max(3.2,s*.065),0,TAU);x.fill()})}}
  kRebuild(anim=true){if(!this.kSide)return;const s=this.kSide/7;const pts=[...this.kDots.values()].sort((a,b)=>a[1]-b[1]||a[0]-b[0]).map(([i,j])=>({x:(i+.5)*s,y:(j+.5)*s}));
    this.kSegs=pts.length>1?kBez(kLoop(kTour(pts),s*.42)):[];this.setState({kCount:pts.length});cancelAnimationFrame(this.kRaf);
    if(!anim||this.reduced){this.kPaint(1);return}const t0=performance.now(),dur=Math.min(1700,450+this.kSegs.length*6);
    const f=now=>{const p=Math.min(1,(now-t0)/dur);this.kPaint(1-(1-p)*(1-p));if(p<1)this.kRaf=requestAnimationFrame(f)};this.kRaf=requestAnimationFrame(f)}
  kTap=e=>{e.preventDefault();this.buzz(8);const b=this.kc.getBoundingClientRect(),s=b.width/7;const i=Math.max(0,Math.min(6,Math.floor((e.clientX-b.left)/s))),j=Math.max(0,Math.min(6,Math.floor((e.clientY-b.top)/s))),k=i+','+j;if(this.kDots.has(k))this.kDots.delete(k);else this.kDots.set(k,[i,j]);this.kRebuild(true)};
  kPreset(name){this.kDots=new Map();let cells=[];if(name==='diamond')cells=diamondCells([1,3,5,7,5,3,1],3);else if(name==='square'){for(let i=1;i<6;i++)for(let j=1;j<6;j++)cells.push([i,j])}else{const all=[];for(let i=0;i<7;i++)for(let j=0;j<7;j++)all.push([i,j]);for(let n=0;n<11;n++){cells.push(all.splice(Math.floor(Math.random()*all.length),1)[0])}}
    cells.forEach(([i,j])=>this.kDots.set(i+','+j,[i,j]));this.kRebuild(true)}
  kSave=()=>{this.kPaint(1);const s=this.kc;if(!s)return;const o=document.createElement('canvas');o.width=s.width;o.height=s.height;const x=o.getContext('2d');x.drawImage(s,0,0);this.shareCreation(o,'my-kolam.png','My Kolam','My Kolam')};

  // Block print
  setBlockCanvas=el=>{this.bc=el;if(el)requestAnimationFrame(()=>this.initBlock())};
  initBlock(){const el=this.bc;if(!el)return;const r=el.parentElement.getBoundingClientRect();const w=Math.max(200,Math.floor(r.width-24)),h=Math.max(200,Math.floor(r.height-60));const d=Math.min(2,window.devicePixelRatio||1);el.style.width=w+'px';el.style.height=h+'px';el.width=Math.round(w*d);el.height=Math.round(h*d);const x=el.getContext('2d');x.setTransform(d,0,0,d,0,0);this.bCtx=x;this.bW=w;this.bH=h;paintFabric(x,w,h);this.bHist=[];if(this.state.bCanUndo)this.setState({bCanUndo:false})}
  stampVar(type,color,size){this.vc=this.vc||{};const key=type+color+size;if(!this.vc[key])this.vc[key]=[0,1,2].map(()=>makeStamp(type,color,size));const a=this.vc[key];return a[Math.floor(Math.random()*a.length)]}
  stampAt(px,py){const {block,ink,bSize}=this.state,v=this.stampVar(block,ink,bSize),x=this.bCtx;if(!x)return;x.save();x.globalCompositeOperation='multiply';x.globalAlpha=.84+Math.random()*.14;x.translate(px,py);x.rotate((Math.random()-.5)*.09);x.drawImage(v,-bSize*.6,-bSize*.6,bSize*1.2,bSize*1.2);x.restore()}
  bTap=e=>{e.preventDefault();this.bSnap();this.buzz(12);const r=this.bc.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top;
    if(!this.state.bRepeat){this.stampAt(px,py);return}
    const st=this.state.bSize*1.08,ox=((px%st)+st)%st,oy=((py%st)+st)%st;let col=0;
    for(let xx=ox-st;xx<this.bW+st;xx+=st,col++){const off=col%2?st/2:0;for(let yy=oy-st-off;yy<this.bH+st;yy+=st)this.stampAt(xx,yy+(col%2?0:0))}};
  bWash=()=>{if(!this.bCtx)return;this.bSnap();paintFabric(this.bCtx,this.bW,this.bH);this.flash('Fresh cloth. Undo brings the old one back.')};
  bSave=()=>{this.shareCreation(this.bc,'my-block-print.png','My Block Print','My Block Print')};
  setBlockPreview=el=>{if(!el)return;requestAnimationFrame(()=>{const w=el.clientWidth||300,h=el.clientHeight||200,d=Math.min(2,window.devicePixelRatio||1);el.width=w*d;el.height=h*d;const x=el.getContext('2d');x.setTransform(d,0,0,d,0,0);paintFabric(x,w,h);const size=Math.max(46,w/4.6),st=size*1.12,types=['paisley','lotus','elephant'],inks=[C.magenta,C.indigo,C.green];let c=0;
    for(let i=0,xx=st*.5;xx<w+st;xx+=st,i++){for(let j=0,yy=(i%2?st:st*.5);yy<h+st;yy+=st,j++){const t=(i+j)%3;const v=makeStamp(types[t],inks[(i+j*2)%3],Math.round(size));x.save();x.globalCompositeOperation='multiply';x.globalAlpha=.9;x.translate(xx,yy);x.rotate((Math.random()-.5)*.08);x.drawImage(v,-size*.6,-size*.6,size*1.2,size*1.2);x.restore();c++}}})};

  // Truck plate
  setPlateCanvas=el=>{this.pc=el;if(el)this.drawPlateNow()};
  drawPlateNow(){if(this.pc)drawPlate(this.pc,this.state.plateFmt,this.state.plateName)}
  savePlate=()=>{if(!this.pc)return;this.drawPlateNow();const st=this.state.plateFmt==='sticker';this.saveCanvas(this.pc,st?'rangotsav-sticker.png':'rangotsav-wallpaper.png',st?'My Rangotsav sticker':'My Rangotsav wallpaper')};

  // Poster
  savePoster=()=>{const s=this.state,cv=document.createElement('canvas');const w=(s.tdWord||'').toUpperCase().slice(0,10)||'MELA';drawPoster(cv,w,s.tdTilt,s.tdOff,PALS[s.tdPal]);this.saveCanvas(cv,'rangotsav-poster.png','My Karkhana poster')};

  // Diya
  lightDiya=()=>{const now=Date.now();if(now-(this.lastLit||0)<450)return;this.lastLit=now;
    const url=this.props.diyaApiUrl;
    this.setState(s=>{const mine=s.mine+1;try{localStorage.setItem(LS,String(mine))}catch(e){}return {mine,pending:s.pending+1,lit:true,sparkOn:true,rowLit:Math.min(11,s.rowLit+1)}});
    clearTimeout(this.sparkT);this.sparkT=setTimeout(()=>this.setState({sparkOn:false}),700);
    this.buzz([12,50,22]);this.ting();if(this.cT){clearTimeout(this.cT);this.cT=0;this.setState({countAnim:null})}
    const ce=this.countEl;if(ce&&ce.animate&&!this.reduced)ce.animate([{transform:'scale(1)'},{transform:'scale(1.16) rotate(-2deg)'},{transform:'scale(1)'}],{duration:450,easing:'cubic-bezier(.3,1.5,.5,1)'});
    if(url)fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({delta:1})}).then(r=>r.json()).then(d=>{if(typeof d.count==='number')this.setState({apiCount:d.count,pending:0})}).catch(()=>{});
  };
  garlandTap=e=>{const now=Date.now();this.taps=(this.taps||[]).filter(t=>now-t<1600);this.taps.push(now);const el=e.currentTarget;if(el.animate&&!this.reduced)el.animate([{rotate:'0deg'},{rotate:'-2deg'},{rotate:'2deg'},{rotate:'0deg'}],{duration:380});if(this.taps.length>=3){this.taps=[];this.gulal()}};
  gulal(){const W=innerWidth,H=innerHeight,cv=document.createElement('canvas');cv.width=W;cv.height=H;cv.setAttribute('aria-hidden','true');Object.assign(cv.style,{position:'fixed',left:'0',top:'0',width:W+'px',height:H+'px',pointerEvents:'none',zIndex:'110',transition:'opacity .9s'});document.body.appendChild(cv);
    const x=cv.getContext('2d'),cols=['#E8457F','#FFC21A','#2FA35E','#F07A1E','#8A46B8','#2F86D6','#E0302A'],P=[],nB=this.isPhone?4:6,per=this.isPhone?50:85;
    for(let b=0;b<nB;b++){const bx=W*(.12+Math.random()*.76),by=H*(.18+Math.random()*.64),col=cols[(b*3+Math.floor(Math.random()*7))%7],t0=b*150;for(let i=0;i<per;i++){const big=i<per*.3,a=Math.random()*TAU,v=2+Math.random()*(big?3:9);P.push({x:bx,y:by,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1.5,r:big?18+Math.random()*30:2+Math.random()*5,c:col,t0,big})}}
    this.flash('Holi hai! Bura na mano.');
    if(this.reduced){for(const p of P){for(let k=0;k<26;k++){p.x+=p.vx;p.y+=p.vy;p.vx*=.95;p.vy=p.vy*.95+.06}x.globalAlpha=p.big?.2:.7;x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,p.r,0,TAU);x.fill()}setTimeout(()=>{cv.style.opacity='0';setTimeout(()=>cv.remove(),950)},1400);return}
    const start=performance.now();const step=now=>{const t=now-start;x.clearRect(0,0,W,H);for(const p of P){if(t<p.t0)continue;const life=Math.max(0,1-(t-p.t0)/2400);if(!life)continue;p.x+=p.vx;p.y+=p.vy;p.vx*=.95;p.vy=p.vy*.95+.06;if(p.big)p.r*=1.01;x.globalAlpha=(p.big?.22:.8)*life;x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,p.r,0,TAU);x.fill()}
      if(t<3200)requestAnimationFrame(step);else{cv.style.opacity='0';setTimeout(()=>cv.remove(),950)}};requestAnimationFrame(step)}

  greet(){if(!this.state.ready)return GREET['Swagat'];const g=this.props.greeting;if(g&&GREET[g])return GREET[g];const h=new Date().getHours();return GREET[h>=4&&h<12?'Shubh Prabhat':h<16&&h>=12?'Swagat':h>=16&&h<21?'Shubh Sandhya':'Shubh Ratri']}

  render(){return RangotsavView({...this.props,...this.renderVals()})}

  renderVals(){
    const s=this.state,p=this.props,g=this.greet(),pal=PALS[s.tdPal];
    const amb=p.ambient||'Festive',nPet=!s.ready||this.reduced||amb==='Off'?0:amb==='Gentle'?(this.isPhone?2:6):(this.isPhone?4:14);
    const word=(s.tdWord||'').toUpperCase().slice(0,10)||'MELA',len=word.length,t=s.tdTilt,o=s.tdOff;
    const press=on=>({bg:on?C.marigold:C.ivory,shadow:on?'0 0 0 #1B1410':'3px 3px 0 #1B1410',tf:on?'translate(3px,3px)':'none',pressed:on?'true':'false'});
    const swatch=(on)=>({shadow:on?'0 0 0 3px #F6E7C8, 0 0 0 6px #1B1410':'3px 3px 0 #1B1410',tf:on?'translateY(-3px) scale(1.06)':'none',pressed:on?'true':'false'});
    const count=s.apiCount!=null?s.apiCount+s.pending:428+s.mine;
    const mv=i=>({op:s.morph===i?1:0,tf:s.morph===i?'translateY(0) rotate(-1deg)':i<s.morph?'translateY(-28px) rotate(-3deg)':'translateY(28px) rotate(2deg)'});
    const litSet=new Set(ROW_ORDER.slice(0,s.rowLit));
    return {
      greetEn:g[0],greetHi:g[1],greetKn:g[2],heroK:this.heroK,toran:this.toran,strand:this.strand,heroDiyas:this.heroDiyas,
      petals:this.petalSeed.slice(0,nPet),showPetals:nPet>0&&!s.tool,
      setHero:this.setHero,tiltAsk:s.tiltAsk,askTilt:this.askTilt,
      bloomOn:e=>e.currentTarget.style.setProperty('--b','1'),bloomOff:e=>e.currentTarget.style.setProperty('--b','0'),
      startPlaying:()=>this.scrollToId('courtyard'),
      openRangoli:e=>this.openTool('rangoli',e),openKolam:e=>this.openTool('kolam',e),openBlock:e=>this.openTool('block',e),closeTool:this.closeTool,setCloseBtn:this.setCloseBtn,
      setMorph:this.setMorph,m0:mv(0),m1:mv(1),m2:mv(2),
      scripts:[['EN','Latin'],['ಕನ್ನಡ','Kannada'],['हिंदी','Devanagari']].map((x,i)=>({label:x[0],name:'Show '+x[1],bg:s.morph===i?C.marigold:'transparent',pressed:s.morph===i?'true':'false',pick:()=>{this.morphPinned=true;clearTimeout(this.mpT);this.mpT=setTimeout(()=>{this.morphPinned=false},2500);this.setState({morph:i})}})),
      prevA:this.prevA,prevB:this.prevB,prevDots:this.prevDots,kPrev:this.kPrev,setBlockPreview:this.setBlockPreview,
      tdWord:s.tdWord,tdWordFull:word,tdTilt:t,tdOff:o,tdPalName:pal.name,tdBg:pal.bg,tdFg:pal.fg,
      tdFs:`clamp(36px, ${Math.min(26,100/len).toFixed(1)}vw, ${Math.round(Math.min(200,640/len))}px)`,
      tdShadow:`${o}px ${(o*.8).toFixed(1)}px 0 ${pal.mis}, ${o+4}px ${(o*.8+4).toFixed(1)}px 0 #1B1410`,
      tdWordTf:`rotate(${(-t*.25).toFixed(1)}deg)`,
      tdLetters:posterGeom(word,t).map(l=>({ch:l.ch===' '?'\u00A0':l.ch,tf:`translateY(${l.ty.toFixed(1)}px) rotate(${l.rot.toFixed(1)}deg) skewX(${l.skew.toFixed(1)}deg)`})),
      onTdWord:e=>this.setState({tdWord:e.target.value.slice(0,10)}),onTdTilt:e=>this.setState({tdTilt:+e.target.value}),onTdOff:e=>this.setState({tdOff:+e.target.value}),
      swapInk:()=>this.setState(x=>({tdPal:(x.tdPal+1)%PALS.length})),savePoster:this.savePoster,
      plateName:s.plateName,onPlateName:e=>this.setState({plateName:e.target.value.slice(0,22)}),setPlateCanvas:this.setPlateCanvas,savePlate:this.savePlate,
      plateMax:s.plateFmt==='sticker'?(s.wide?'380px':'300px'):(s.wide?'340px':'280px'),saveLabel:s.plateFmt==='sticker'?'Share sticker':'Share wallpaper',
      fmtOpts:[['wallpaper','Wallpaper','9:16 phone'],['sticker','Sticker','WhatsApp 512']].map(([id,l,sub])=>({label:l,sub,...press(s.plateFmt===id),pick:()=>this.setState({plateFmt:id})})),
      makers:this.makers,
      diyaCount:(s.countAnim!=null?s.countAnim:count).toLocaleString('en-IN'),setCountEl:this.setCountEl,lit:s.lit,unlit:!s.lit,sparkOn:s.sparkOn,lightDiya:this.lightDiya,
      diyaMsg:!s.lit?'Tap the diya. One second of your time, and the courtyard gets a little brighter.':s.pending>=4||s.mine>=4?'Arre wah, you are lighting up the whole street!':'Yours is glowing. Light one more for someone you miss?',
      rowDiyas:Array.from({length:11},(_,i)=>({lit:litSet.has(i),off:!litSet.has(i),delay:this.rowDelays[i]})),
      garlandTap:this.garlandTap,shareSite:this.shareSite,clubUrl:p.clubUrl||'#',
      isRangoli:s.tool==='rangoli',isKolam:s.tool==='kolam',isBlock:s.tool==='block',
      trayOpen:s.trayOpen||s.wide,trayExpanded:s.trayOpen?'true':'false',trayLabel:s.trayOpen?'Hide controls':'Show controls',toggleTray:()=>this.setState(x=>({trayOpen:!x.trayOpen})),
      setRangoliCanvas:this.setRangoliCanvas,rDown:this.rDown,rMove:this.rMove,rUp:this.rUp,rSave:this.rSave,rClear:()=>{if(!this.rCtx)return;this.rSnap();this.rFloor();this.flash('Floor swept. Undo brings it back.')},rUndo:this.rUndo,rUndoOff:!s.rCanUndo,rUndoOp:s.rCanUndo?1:.4,rHint:!s.rTouched,
      symCopies:s.sym*2,rSize:s.rSize,onRSize:e=>this.setState({rSize:+e.target.value}),rGrid:s.rGrid,gridLabel:s.rGrid?'Guide on':'Guide off',gridPressed:s.rGrid?'true':'false',gridBg:s.rGrid?C.marigold:C.ivory,toggleGrid:()=>this.setState(x=>({rGrid:!x.rGrid})),
      symOpts:[4,6,8,12].map(n=>({label:String(n),name:n+' axes',...press(s.sym===n),pick:()=>this.setState({sym:n})})),
      swatches:RCOLS.map(([l,c])=>({label:l,color:c,...swatch(s.rColor===c),pick:()=>this.setState({rColor:c})})),
      guideLines:Array.from({length:s.sym},(_,k)=>{const a=k*Math.PI/s.sym;return {x1:(-49*Math.cos(a)).toFixed(2),y1:(-49*Math.sin(a)).toFixed(2),x2:(49*Math.cos(a)).toFixed(2),y2:(49*Math.sin(a)).toFixed(2)}}),
      setKolamCanvas:this.setKolamCanvas,kTap:this.kTap,kSave:this.kSave,kCount:s.kCount,kCountLabel:s.kCount===1?'1 dot':s.kCount+' dots',
      kClear:()=>{this.kDots=new Map();this.kRebuild(false)},kDiamond:()=>this.kPreset('diamond'),kSquare:()=>this.kPreset('square'),kSprinkle:()=>this.kPreset('sprinkle'),
      kColors:KCOLS.map(([l,c])=>({label:l,color:c,...swatch(s.kColor===c),pick:()=>this.setState({kColor:c})})),
      kDotsLabel:s.kShowDots?'Dots on':'Dots off',kDotsBg:s.kShowDots?C.marigold:C.ivory,kDotsPressed:s.kShowDots?'true':'false',toggleKDots:()=>this.setState(x=>({kShowDots:!x.kShowDots})),
      setBlockCanvas:this.setBlockCanvas,bTap:this.bTap,bWash:this.bWash,bSave:this.bSave,bSize:s.bSize,onBSize:e=>this.setState({bSize:+e.target.value}),
      repeatLabel:s.bRepeat?'Repeat on':'Repeat off',repeatBg:s.bRepeat?C.marigold:C.ivory,repeatPressed:s.bRepeat?'true':'false',toggleRepeat:()=>this.setState(x=>({bRepeat:!x.bRepeat})),
      bHint:s.bRepeat?'Tap once to fill the whole cloth':'Tap the cloth to press the block',
      blockOpts:BLOCKS.map(([id,l])=>({label:l,tileRef:this.blockTileRefs[id],...press(s.block===id),pick:()=>this.setState({block:id})})),
      inkOpts:INKS.map(([l,c])=>({label:l,color:c,...swatch(s.ink===c),pick:()=>this.setState({ink:c})})),
      toast:s.toast,hasToast:!!s.toast,
      wide:s.wide,narrow:!s.wide,
      sheetCols:s.wide?'minmax(0,1fr) 400px':'minmax(0,1fr)',sheetRows:s.wide?'60px minmax(0,1fr)':'60px minmax('+NARROW_STAGE+',1fr) auto',
      trayBT:s.wide?'0':'4px solid #1B1410',trayBL:s.wide?'4px solid #1B1410':'0',trayGap:s.wide?'20px':'12px',trayMH:s.wide?'none':'calc(100dvh - 60px - '+NARROW_STAGE+')',trayAnim:s.wide?'trayIn':'trayUp',actOrder:s.wide?1:0,
      trayPad:s.wide?'22px 24px calc(22px + env(safe-area-inset-bottom))':'0 16px calc(14px + env(safe-area-inset-bottom))',
      bUndo:this.bUndo,bUndoOff:!s.bCanUndo,bUndoOp:s.bCanUndo?1:.4,
      setNavRow:this.setNavRow,navTf:s.navOn&&!s.tool?'translateY(0)':'translateY(-115%)',
      goTop:e=>{e.preventDefault();window.scrollTo({top:0,behavior:this.reduced?'auto':'smooth'})},
      navItems:[['courtyard','Draw & Weave'],['karkhana','Karkhana'],['nameplate','Truck Art'],['behind','Recipes'],['diya','Light a Diya']].map(([id,l])=>{const on=s.active===id;return {label:l,href:'#'+id,cur:on?'true':'false',bg:on?C.marigold:'transparent',go:e=>{e.preventDefault();this.scrollToId(id)}}}),
    };
  }
}
