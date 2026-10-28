// @ts-nocheck
// Ported from design/Rangotsav.dc.html. Untyped on purpose, like components/Rangotsav.tsx.
import { C, TAU } from './palette';

export function kTour(d){
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
export function kLoop(t,r,g=.6){
  const n=t.length,pts=[]; if(!n) return pts;
  if(n===1){for(let k=0;k<12;k++){const a=k/12*TAU;pts.push({x:t[0].x+r*Math.cos(a),y:t[0].y+r*Math.sin(a)})}return pts}
  for(let i=0;i<n;i++){const c=t[i],p=t[(i-1+n)%n],q=t[(i+1)%n];
    const ti=Math.atan2(p.y-c.y,p.x-c.x),to=Math.atan2(q.y-c.y,q.x-c.x);
    const a0=ti+g;let sw=(to-ti)%TAU;if(sw<0)sw+=TAU;if(sw<.35*Math.PI)sw+=TAU;
    const st=Math.max(3,Math.round(sw/.34));
    for(let k=0;k<=st;k++){const a=a0+sw*k/st;pts.push({x:c.x+r*Math.cos(a),y:c.y+r*Math.sin(a)})}}
  return pts;
}
export function kBez(pts){const n=pts.length,s=[];if(n<3)return s;for(let i=0;i<n;i++){const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];s.push([p1,{x:p1.x+(p2.x-p0.x)/6,y:p1.y+(p2.y-p0.y)/6},{x:p2.x-(p3.x-p1.x)/6,y:p2.y-(p3.y-p1.y)/6},p2])}return s}
export function kD(segs){if(!segs.length)return '';const f=v=>v.toFixed(2);let d=`M${f(segs[0][0].x)} ${f(segs[0][0].y)}`;for(const s of segs)d+=`C${f(s[1].x)} ${f(s[1].y)} ${f(s[2].x)} ${f(s[2].y)} ${f(s[3].x)} ${f(s[3].y)}`;return d+'Z'}
export function ring(n,R,off=0){return Array.from({length:n},(_,i)=>{const a=off+i/n*TAU;return {x:R*Math.cos(a),y:R*Math.sin(a)}})}
export function diamondCells(rows,c){const o=[];rows.forEach((w,j)=>{for(let k=0;k<w;k++)o.push([c-(w-1)/2+k,j])});return o}

// One woven line through all dots on a g×g grid of side S. Dots sort row-major first so the
// tour (and the loop) is the same for the same set of dots.
export function kolamSegs(dots,S,g){const s=S/g;const pts=[...dots].sort((a,b)=>a[1]-b[1]||a[0]-b[0]).map(([i,j])=>({x:(i+.5)*s,y:(j+.5)*s}));return pts.length>1?kBez(kLoop(bestTour(pts),s*.42)):[]}
// kTour from a few different starting dots, keeping the shortest loop (fewer long jumps).
export function bestTour(pts){if(pts.length<4)return kTour(pts);const len=t=>t.reduce((a,p,i)=>a+Math.hypot(p.x-t[(i+1)%t.length].x,p.y-t[(i+1)%t.length].y),0);
  let best=null,bl=Infinity;const tries=Math.min(pts.length,10);for(let k=0;k<tries;k++){const i=Math.floor(k*pts.length/tries);const t=kTour([...pts.slice(i),...pts.slice(0,i)]),l=len(t);if(l<bl-1e-6){bl=l;best=t}}return best}
export function kolamPathD(dots,S,g){return kD(kolamSegs(dots,S,g))}
// prog in [0,1] draws that fraction of the loop (used for the weave animation and replays).
export function drawKolam(x,S,g,dots,segs,color,showDots,prog=1,floor=C.floor){const s=S/g;x.fillStyle=floor;x.fillRect(0,0,S,S);
  x.fillStyle='rgba(251,243,228,.2)';for(let i=0;i<g;i++)for(let j=0;j<g;j++){x.beginPath();x.arc((i+.5)*s,(j+.5)*s,1.8*Math.max(1,S/600),0,TAU);x.fill()}
  const n=Math.floor(segs.length*prog);
  if(dots.length===1&&prog>0){const [[i,j]]=dots;x.strokeStyle=color;x.lineWidth=Math.max(3,s*.07);x.beginPath();x.arc((i+.5)*s,(j+.5)*s,s*.42,0,TAU*prog);x.stroke()}
  if(n){x.strokeStyle=color;x.lineWidth=Math.max(3,s*.07);x.lineCap='round';x.lineJoin='round';x.beginPath();x.moveTo(segs[0][0].x,segs[0][0].y);for(let i=0;i<n;i++){const q=segs[i];x.bezierCurveTo(q[1].x,q[1].y,q[2].x,q[2].y,q[3].x,q[3].y)}x.stroke()}
  if(showDots){x.fillStyle=C.ivory;dots.forEach(([i,j])=>{x.beginPath();x.arc((i+.5)*s,(j+.5)*s,Math.max(3.2,s*.065),0,TAU);x.fill()})}}
