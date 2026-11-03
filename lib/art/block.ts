// @ts-nocheck
// Ported from design/Rangotsav.dc.html. Untyped on purpose, like components/Rangotsav.tsx.
import { INK, TAU } from './palette';

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
  }else if(type==='butta'){
    // a flower sprig: five-petal bloom, curving stem, two leaves
    for(let k=0;k<5;k++){const a=-Math.PI/2+k*TAU/5;dot(Math.cos(a)*11,-18+Math.sin(a)*11,10)}
    out();dot(0,-18,5);for(let k=0;k<5;k++){const a=-Math.PI/2+k*TAU/5;x.lineWidth=2;x.beginPath();x.moveTo(Math.cos(a)*6,-18+Math.sin(a)*6);x.lineTo(Math.cos(a)*17,-18+Math.sin(a)*17);x.stroke()}
    ins();dot(0,-18,2.4);
    x.lineWidth=4.5;x.beginPath();x.moveTo(0,-4);x.quadraticCurveTo(9,20,0,46);x.stroke();
    x.beginPath();x.ellipse(-13,18,14,6,-.55,0,TAU);x.fill();x.beginPath();x.ellipse(15,30,14,6,.55,0,TAU);x.fill();
    out();x.lineWidth=1.8;x.beginPath();x.moveTo(-24,24);x.lineTo(-3,13);x.moveTo(26,36);x.lineTo(5,25);x.stroke();
    ins();[[-30,-36],[30,-36],[-34,40],[34,8]].forEach(([a,b])=>dot(a,b,3));
  }else if(type==='mor'){
    // a peacock: fanned tail with eyes, body, neck and crest
    for(let k=0;k<5;k++){const a=Math.PI*(.62+k*.17);x.save();x.translate(-6,18);x.rotate(a);x.beginPath();x.ellipse(28,0,24,8.5,0,0,TAU);x.fill();x.restore()}
    out();for(let k=0;k<5;k++){const a=Math.PI*(.62+k*.17);const ex=-6+Math.cos(a)*40,ey=18+Math.sin(a)*40;dot(ex,ey,5)}
    ins();for(let k=0;k<5;k++){const a=Math.PI*(.62+k*.17);dot(-6+Math.cos(a)*40,18+Math.sin(a)*40,2.4)}
    x.beginPath();x.ellipse(8,18,17,13,-.3,0,TAU);x.fill();
    x.lineWidth=8;x.beginPath();x.moveTo(16,8);x.quadraticCurveTo(26,-6,20,-24);x.stroke();
    dot(20,-27,7);x.beginPath();x.moveTo(26,-29);x.lineTo(36,-25);x.lineTo(26,-23);x.closePath();x.fill();
    x.lineWidth=2;[[-6,-14],[0,-16],[6,-15]].forEach(([a,b])=>{x.beginPath();x.moveTo(18,-33);x.lineTo(18+a*.6,-33+b*.6);x.stroke();dot(18+a*.6,-33+b*.6,2.2)});
    out();dot(22,-28,1.8);x.lineWidth=2;x.beginPath();x.ellipse(8,18,10,7,-.3,0,TAU);x.stroke();
    ins();x.lineWidth=3;x.beginPath();x.moveTo(4,30);x.lineTo(1,46);x.moveTo(13,30);x.lineTo(15,46);x.stroke();
  }else if(type==='chakra'){
    // a sun wheel: ring, twelve petals, carved hub
    x.lineWidth=6;x.beginPath();x.arc(0,0,43,0,TAU);x.stroke();
    for(let k=0;k<12;k++){x.save();x.rotate(k*TAU/12);x.beginPath();x.moveTo(0,-15);x.quadraticCurveTo(8,-27,0,-38);x.quadraticCurveTo(-8,-27,0,-15);x.fill();x.restore()}
    out();for(let k=0;k<12;k++){x.save();x.rotate(k*TAU/12);x.lineWidth=1.6;x.beginPath();x.moveTo(0,-19);x.lineTo(0,-33);x.stroke();x.restore()}
    ins();dot(0,0,13);out();dot(0,0,8);ins();dot(0,0,3.5);
    for(let k=0;k<12;k++){const a=(k+.5)*TAU/12;dot(Math.cos(a)*34,Math.sin(a)*34,2.6)}
  }else if(type==='bel'){
    // a border tile: a vine running edge to edge between two rules, so a row of presses joins up
    x.fillRect(-50,-44,100,5);x.fillRect(-50,39,100,5);
    x.lineWidth=4.5;x.beginPath();x.moveTo(-50,0);x.bezierCurveTo(-25,-26,-25,26,0,0);x.bezierCurveTo(25,-26,25,26,50,0);x.stroke();
    [[-25,-14,-.7],[25,14,2.4],[-12,12,2.6],[12,-12,-.5]].forEach(([a,b,r])=>{x.save();x.translate(a,b);x.rotate(r);x.beginPath();x.ellipse(0,0,11,4.6,0,0,TAU);x.fill();x.restore()});
    dot(-37,22,5);dot(37,-22,5);out();dot(-37,22,2);dot(37,-22,2);
    ins();for(let i=-45;i<=45;i+=10){dot(i,-31,1.8);dot(i,31,1.8)}
  }else if(type==='jaal'){
    // a lattice tile: a diamond trellis with a little flower in each diamond; repeats seamlessly
    x.lineWidth=4;x.beginPath();x.moveTo(-50,0);x.lineTo(0,-50);x.lineTo(50,0);x.lineTo(0,50);x.closePath();x.stroke();
    for(let k=0;k<4;k++){const a=k*TAU/4;dot(Math.cos(a)*7,Math.sin(a)*7,6.5)}
    out();dot(0,0,3.2);ins();dot(0,0,1.5);
    [[-50,-50],[50,-50],[-50,50],[50,50]].forEach(([a,b])=>{for(let k=0;k<4;k++){const g=k*TAU/4+TAU/8;dot(a+Math.cos(g)*8,b+Math.sin(g)*8,5)}});
    [[-25,-25],[25,-25],[-25,25],[25,25]].forEach(([a,b])=>dot(a,b,2.6));
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

export const BLOCK_TYPES=['paisley','lotus','elephant','butta','mor','chakra','bel','jaal'];
// Presses one recipe stamp ({x,y,z} per-mille of the cloth width; r = fill the whole cloth) onto
// a W×H cloth. Same layout maths as the live tool, so replays land where the taps did.
export function blockPress(x,W,H,st,cache={}){const size=st.z*W/1000,type=BLOCK_TYPES[st.t]||'paisley',key=type+st.i+Math.round(size);
  if(!cache[key])cache[key]=[0,1,2].map(()=>makeStamp(type,st.i,Math.round(size)));
  const one=(px,py)=>{const v=cache[key][Math.floor(Math.random()*3)];x.save();x.globalCompositeOperation='multiply';x.globalAlpha=.84+Math.random()*.14;x.translate(px,py);x.rotate((Math.random()-.5)*.09);x.drawImage(v,-size*.6,-size*.6,size*1.2,size*1.2);x.restore()};
  const px=st.x*W/1000,py=st.y*W/1000;if(!st.r){one(px,py);return}
  const step=size*1.08,ox=((px%step)+step)%step,oy=((py%step)+step)%step;let col=0;
  for(let xx=ox-step;xx<W+step;xx+=step,col++){const off=col%2?step/2:0;for(let yy=oy-step-off;yy<H+step;yy+=step)one(xx,yy)}}

// Try it on: the printed cloth cut into a kurta or a tote bag, with folds and shading. The cloth
// canvas is used as a pattern at about half scale, like cloth sewn into something smaller.
export function drawGarment(x,W,H,cloth,kind){
  x.fillStyle='#2A1710';x.fillRect(0,0,W,H);
  const s=Math.min(W/100,H/120),cx=W/2,top=(H-s*112)/2+s*4;
  const P=new Path2D();
  if(kind==='kurta'){
    const p=(a,b)=>[cx+a*s,top+b*s];
    P.moveTo(...p(-10,0));P.quadraticCurveTo(...p(0,10),...p(10,0));
    P.lineTo(...p(24,4));P.lineTo(...p(44,30));P.lineTo(...p(36,36));P.lineTo(...p(25,22));
    P.lineTo(...p(27,62));P.quadraticCurveTo(...p(30,90),...p(36,106));P.lineTo(...p(-36,106));P.quadraticCurveTo(...p(-30,90),...p(-27,62));
    P.lineTo(...p(-25,22));P.lineTo(...p(-36,36));P.lineTo(...p(-44,30));P.lineTo(...p(-24,4));P.closePath();
  }else{
    const p=(a,b)=>[cx+a*s,top+b*s];
    P.moveTo(...p(-36,30));P.lineTo(...p(36,30));P.lineTo(...p(40,104));P.lineTo(...p(-40,104));P.closePath();
  }
  x.save();x.fillStyle='rgba(0,0,0,.35)';x.translate(s*2.4,s*2.4);x.fill(P);x.restore();
  x.save();x.clip(P);
  // the cloth canvas is at device resolution; draw it at half its on-screen size
  const k=.5*W/cloth.width;x.save();x.scale(k,k);x.fillStyle=x.createPattern(cloth,'repeat');x.fillRect(0,0,W/k,H/k);x.restore();
  // shading: darker at the sides and in a few folds, a little light down the middle
  const g=x.createLinearGradient(cx-s*44,0,cx+s*44,0);g.addColorStop(0,'rgba(40,20,10,.38)');g.addColorStop(.32,'rgba(40,20,10,0)');g.addColorStop(.5,'rgba(255,250,235,.10)');g.addColorStop(.68,'rgba(40,20,10,0)');g.addColorStop(1,'rgba(40,20,10,.38)');
  x.fillStyle=g;x.fillRect(0,0,W,H);
  x.strokeStyle='rgba(40,20,10,.18)';x.lineWidth=s*2.2;x.lineCap='round';
  if(kind==='kurta'){[[-14,60,-18,104],[12,64,16,104],[0,70,1,104]].forEach(([a,b,c,d])=>{x.beginPath();x.moveTo(cx+a*s,top+b*s);x.quadraticCurveTo(cx+(a+c)/2*s+s*3,top+(b+d)/2*s,cx+c*s,top+d*s);x.stroke()})}
  else{x.beginPath();x.moveTo(cx-20*s,top+34*s);x.quadraticCurveTo(cx-24*s,top+70*s,cx-18*s,top+102*s);x.stroke()}
  x.restore();
  x.lineJoin='round';x.lineWidth=Math.max(2,s*1.1);x.strokeStyle=INK;x.stroke(P);
  if(kind==='kurta'){
    // placket and collar trim
    x.lineWidth=Math.max(2,s*1.6);x.beginPath();x.moveTo(cx-10*s,top);x.quadraticCurveTo(cx,top+10*s,cx+10*s,top);x.stroke();
    x.beginPath();x.moveTo(cx,top+5*s);x.lineTo(cx,top+30*s);x.stroke();
    x.fillStyle=INK;[12,19,26].forEach(b=>{x.beginPath();x.arc(cx+2.2*s,top+b*s,s*1.1,0,TAU);x.fill()});
  }else{
    x.lineWidth=Math.max(3,s*2.6);x.strokeStyle=INK;x.beginPath();x.moveTo(cx-20*s,top+30*s);x.bezierCurveTo(cx-20*s,top+2*s,cx+20*s,top+2*s,cx+20*s,top+30*s);x.stroke();
    x.lineWidth=Math.max(2,s*1.4);x.strokeStyle='#B4542A';x.beginPath();x.moveTo(cx-20*s,top+30*s);x.bezierCurveTo(cx-20*s,top+2*s,cx+20*s,top+2*s,cx+20*s,top+30*s);x.stroke();
  }
}
