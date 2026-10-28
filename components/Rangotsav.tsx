// @ts-nocheck
"use client";
// Ported from design/Rangotsav.dc.html (logic class). Untyped on purpose: it is a faithful port of
// the prototype's imperative canvas / DOM code. Markup lives in RangotsavView.generated.tsx.
import React from 'react';
import RangotsavView from './RangotsavView.generated';
import makersData from '../data/makers.json';

import { C, INK, TAU, RCOLS, KCOLS, INKS, BLOCKS, PALS } from '../lib/art/palette';
import { kTour, kLoop, kBez, kD, ring, diamondCells, kolamSegs, drawKolam } from '../lib/art/kolam';
import { drawBlock, makeStamp, paintFabric } from '../lib/art/block';
import { drawPlate } from '../lib/art/plate';
import { posterGeom, drawPoster } from '../lib/art/poster';
import { strokePainter, pxToUnit, decodeStrokes, paintStrokes } from '../lib/art/rangoli';
import { blockPress, BLOCK_TYPES } from '../lib/art/block';
import { encodePts, decodePts, validateRecipe, MAX_POINTS, ID_RE } from '../lib/recipe';
import { track } from '../lib/track';
import ShareSheet from './ShareSheet';
import MyCourtyard from './MyCourtyard';
import { stamp, load as loadProgress, onProgress, STAMPS } from '../lib/progress';
import { mkRng } from '../lib/rng';

// Phone tool sheets: the drawing stage is at least as tall as the screen is wide (+28px fit
// padding) so square canvases fill the width; capped so the control tray keeps room.
const NARROW_STAGE='min(100vw + 28px, 62dvh)';
const GREET={'Shubh Prabhat':['Shubh Prabhat','शुभ प्रभात','ಶುಭೋದಯ'],'Swagat':['Swagat!','स्वागत है','ಸುಸ್ವಾಗತ'],'Shubh Sandhya':['Shubh Sandhya','शुभ संध्या','ಶುಭ ಸಂಜೆ'],'Shubh Ratri':['Shubh Ratri','शुभ रात्रि','ಶುಭ ರಾತ್ರಿ']};
const MAKERS=makersData.map(m=>[m.name,m.role,m.color]);
const ROW_ORDER=[5,4,6,3,7,2,8,1,9,0,10];
const LS='rangotsav:diyas-mine';

export default class Rangotsav extends React.Component {
  static defaultProps={ambient:'Festive',sound:'On',greeting:'Auto',diyaApiUrl:'/api/diyas',clubUrl:'#'};
  state={tool:null,trayOpen:true,sym:8,rColor:C.ivory,rSize:6,rGrid:true,kColor:C.ivory,kShowDots:true,kCount:0,block:'paisley',ink:C.indigo,bSize:96,bRepeat:false,tdWord:'MELA',tdTilt:8,tdOff:6,tdPal:0,plateName:'',plateFmt:'wallpaper',mine:0,apiCount:null,pending:0,lit:false,sparkOn:false,rowLit:5,morph:0,tiltAsk:false,toast:'',wide:false,ready:false,navOn:false,active:'',rCanUndo:false,bCanUndo:false,rTouched:false,countAnim:null,rBrush:'powder',share:null,naamInit:'',meOpen:false,meCount:0,mehRemix:null,mehOpen:0,greetPreset:null};
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
  rRec=[];rRecH=[];rN=0;bRec=[];bRecH=[];
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
      ['about','naam','courtyard','karkhana','nameplate','behind','greet','diya'].forEach(id=>{const el=document.getElementById(id);el&&this.secIO.observe(el)});
      const dEl=document.getElementById('diya');
      if(dEl){if(!this.reduced)this.setState({countAnim:0});this.diyaIO=new IntersectionObserver(es=>{this.diyaVisible=es[0].isIntersecting;if(es[0].isIntersecting&&!this.counted){this.counted=true;this.countUp()}},{threshold:.25});this.diyaIO.observe(dEl)}if(this.hero)this.heroIO.observe(this.hero);
    }else document.querySelectorAll('[data-reveal]').forEach(el=>el.style.setProperty('--rv','running'));
    this.setupTilt();
    this.readLink();
    const pc=()=>this.setState({meCount:Object.keys(loadProgress().stamps).length});pc();this.offProgress=onProgress(pc);
    this.mq=matchMedia('(min-width: 900px)');this.onMq=e=>this.setState({wide:e.matches});this.mq.addEventListener?this.mq.addEventListener('change',this.onMq):this.mq.addListener(this.onMq);
    this.onResize=()=>{clearTimeout(this.rzT);this.rzT=setTimeout(()=>{if(this.state.tool)this.refitTool()},220)};window.addEventListener('resize',this.onResize);
    if(url)this.pollT=setInterval(()=>{if(this.diyaVisible&&!document.hidden)fetch(url).then(r=>r.json()).then(d=>{if(typeof d.count==='number'&&!this.state.pending)this.setState({apiCount:d.count})}).catch(()=>{})},20000);
    if(document.fonts){Promise.all(["400 100px 'Yatra One'","900 100px Sarpanch","800 100px Sarpanch","700 40px Mukta","800 30px Mukta"].map(f=>document.fonts.load(f).catch(()=>{}))).then(()=>this.drawPlateNow())}
  }
  componentWillUnmount(){this.dead=true;this.offProgress&&this.offProgress();this.hero&&this.onHeroMove&&this.hero.removeEventListener('pointermove',this.onHeroMove);clearTimeout(this.tt);clearTimeout(this.sparkT);clearTimeout(this.mpT);cancelAnimationFrame(this.kRaf);cancelAnimationFrame(this.tRaf);document.documentElement.style.overflow='';document.body.style.overflow='';window.removeEventListener('resize',this.onResize);this.mq&&(this.mq.removeEventListener?this.mq.removeEventListener('change',this.onMq):this.mq.removeListener(this.onMq));this.secIO&&this.secIO.disconnect();this.diyaIO&&this.diyaIO.disconnect();clearInterval(this.pollT);clearTimeout(this.cT);window.removeEventListener('scroll',this.onScroll);window.removeEventListener('keydown',this.onKey);window.removeEventListener('deviceorientation',this.onOrient);this.io&&this.io.disconnect();this.heroIO&&this.heroIO.disconnect();cancelAnimationFrame(this.dRaf);clearTimeout(this.driftT)}
  componentDidUpdate(){
    const s=this.state,ps=this._ps||{tool:null,plateName:s.plateName,plateFmt:s.plateFmt,kColor:s.kColor,kShowDots:s.kShowDots,wide:s.wide,active:s.active};this._ps={...s};
    if(ps.tool!==s.tool){const lock=s.tool?'hidden':'';document.documentElement.style.overflow=lock;document.body.style.overflow=lock;if(s.tool)setTimeout(()=>this.closeBtn&&this.closeBtn.focus(),60);else{this.observeReveal();this.lastOpener&&this.lastOpener.focus&&this.lastOpener.focus()}}
    if(ps.plateName!==s.plateName||ps.plateFmt!==s.plateFmt)this.drawPlateNow();
    if(s.tool==='kolam'&&(ps.kColor!==s.kColor||ps.kShowDots!==s.kShowDots))this.kPaint(1);
    if((ps.wide!==s.wide||ps.trayOpen!==s.trayOpen)&&s.tool)requestAnimationFrame(()=>this.refitTool());
    if(ps.active!==s.active&&this.navRow){const a=this.navRow.querySelector('[aria-current="true"]');if(a)this.navRow.scrollTo({left:a.offsetLeft-this.navRow.clientWidth/2+a.offsetWidth/2,behavior:this.reduced?'auto':'smooth'})}
  }
  readLink(){let q;try{q=new URLSearchParams(location.search)}catch(e){return}const tool=q.get('tool'),rid=q.get('remix'),naam=q.get('naam');if(!tool&&!rid&&!naam)return;
    try{history.replaceState(null,'',location.pathname+location.hash)}catch(e){}
    if(naam){this.setState({naamInit:naam.slice(0,24)});setTimeout(()=>this.scrollToId('naam'),350);return}
    if(rid&&ID_RE.test(rid)){fetch('/api/creations/'+rid).then(r=>r.ok?r.json():null).then(r=>{const v=validateRecipe(r);if(v){track('remix',{kind:v.type});this.applyRemix(v)}else this.flash('That creation could not be found.')}).catch(()=>{});return}
    track('make_own',{tool});const open=t=>setTimeout(()=>this.openTool(t),350),go=id=>setTimeout(()=>this.scrollToId(id),350);
    if(['rangoli','kolam','block','mehendi'].includes(tool)){if(tool==='mehendi')go('courtyard');open(tool)}else{const id={poster:'karkhana',plate:'nameplate',naam:'naam',greeting:'greet'}[tool];if(id)go(id)}}
  applyRemix(r){const open=t=>setTimeout(()=>this.openTool(t),350),go=id=>setTimeout(()=>this.scrollToId(id),350);
    switch(r.type){
      case 'rangoli':case 'block':this.pendingRemix=r;open(r.type);this.flash('Remixing! Add your own strokes.');break;
      case 'mehendi':this.setState({mehRemix:r});go('courtyard');break;
      case 'kolam':this.kDots=new Map(r.data.dots.map(([i,j])=>[i+','+j,[i,j]]));this.setState({kColor:r.data.c,kShowDots:r.data.d});open('kolam');break;
      case 'poster':this.setState({tdWord:r.data.w,tdTilt:r.data.t,tdOff:r.data.o,tdPal:r.data.p});go('karkhana');break;
      case 'plate':this.setState({plateName:'',plateFmt:r.data.f});go('nameplate');this.flash('Type your own name on the plate!');break;
      case 'naam':this.setState({naamInit:''});go('naam');break;
      default:go('greet')}}
  lastArt=()=>{const r=this.rRecipe&&this.rRecipe();if(r)return r;if(this.kc&&this.kDots.size)return {v:1,type:'kolam',data:{dots:[...this.kDots.values()],c:this.state.kColor,d:this.state.kShowDots}};return null};
  openShareFn=req=>this.openShare(req);
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
  rSnap(){if(!this.rc)return;this.snap(this.rc,'rHist');this.rRecH.push(this.rRec.slice());if(this.rRecH.length>10)this.rRecH.shift();if(!this.state.rCanUndo)this.setState({rCanUndo:true})}
  rUndo=()=>{if(this.rc&&this.restore(this.rc,'rHist')){this.rRec=this.rRecH.pop()||[];this.rN=this.rRec.reduce((a,t)=>a+t.pts.length/2,0);this.buzz(8);this.setState({rCanUndo:this.rHist.length>0})}};
  bSnap(){if(!this.bc)return;this.snap(this.bc,'bHist');this.bRecH.push(this.bRec.slice());if(this.bRecH.length>10)this.bRecH.shift();if(!this.state.bCanUndo)this.setState({bCanUndo:true})}
  bUndo=()=>{if(this.bc&&this.restore(this.bc,'bHist')){this.bRec=this.bRecH.pop()||[];this.buzz(8);this.setState({bCanUndo:this.bHist.length>0})}};
  refitTool(){const t=this.state.tool,fit=st=>Math.max(220,Math.floor(Math.min(st.width-28,st.height-28)));
    if(t==='rangoli'&&this.rc){const side=fit(this.rc.parentElement.parentElement.getBoundingClientRect());if(Math.abs(side-this.rSide)<8)return;const tmp=this.copyCv(this.rc);this.initRangoli(true);this.rCtx.drawImage(tmp,0,0,this.rSide,this.rSide)}
    else if(t==='kolam'&&this.kc){const side=fit(this.kc.parentElement.getBoundingClientRect());if(Math.abs(side-this.kSide)<8)return;this.initKolam()}
    else if(t==='block'&&this.bc){const st=this.bc.parentElement.getBoundingClientRect();if(Math.abs(st.width-24-this.bW)<8&&Math.abs(st.height-60-this.bH)<8)return;const tmp=this.copyCv(this.bc),ow=this.bW,oh=this.bH;this.initBlock(true);this.bCtx.drawImage(tmp,0,0,ow,oh)}}
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
  openShare(req){this.setState({share:req})}
  closeShare=()=>this.setState({share:null});

  shareSite=async()=>{const url=location.origin+location.pathname,text='Come play at Rangotsav: draw rangoli, weave kolam, block-print cloth and paint a truck-art name plate.';
    try{if(navigator.share){await navigator.share({title:'Rangotsav',text,url});return}}catch(e){if(e&&e.name==='AbortError')return}
    try{await navigator.clipboard.writeText(text+' '+url);this.flash('Link copied. Send it to a friend!')}catch(e){window.open('https://wa.me/?text='+encodeURIComponent(text+' '+url),'_blank','noopener')}}
  scrollToId(id){const el=document.getElementById(id);if(!el)return;window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-(id==='swagat'?0:60),behavior:this.reduced?'auto':'smooth'})}
  openTool(t,e){if(t==='mehendi'){this.setState(x=>({mehOpen:x.mehOpen+1}));return}this.lastOpener=e&&e.currentTarget;this.setState({tool:t,trayOpen:true});stamp(t);track('tool_open',{tool:t})}
  closeTool=()=>{cancelAnimationFrame(this.kRaf);this.setState({tool:null})};

  // Rangoli
  setRangoliCanvas=el=>{this.rc=el;if(el)requestAnimationFrame(()=>this.initRangoli())};
  initRangoli(keep){const el=this.rc;if(!el)return;const stage=el.parentElement.parentElement,r=stage.getBoundingClientRect();const side=Math.max(220,Math.floor(Math.min(r.width-28,r.height-28)));const d=Math.min(2,window.devicePixelRatio||1);el.style.width=el.style.height=side+'px';el.width=el.height=Math.round(side*d);const x=el.getContext('2d');x.setTransform(d,0,0,d,0,0);this.rCtx=x;this.rSide=side;this.rFloor();this.rHist=[];this.rRecH=[];if(!keep){this.rRec=[];this.rN=0}this.setState({rReady:true,rCanUndo:false});
    const rm=this.pendingRemix;if(rm&&rm.type==='rangoli'){this.pendingRemix=null;paintStrokes(x,side,decodeStrokes(rm.data.strokes));this.rRec=rm.data.strokes.map(t=>({c:t.c,s:t.s,n:t.n,b:t.b,pts:decodePts(t.p)||[]}));this.rN=this.rRec.reduce((a,t)=>a+t.pts.length/2,0);this.setState({rTouched:true})}}
  rFloor(){const x=this.rCtx,s=this.rSide;if(!x)return;x.fillStyle=C.floor;x.fillRect(0,0,s,s);x.fillStyle='rgba(251,243,228,.035)';for(let i=0;i<s*s/220;i++){x.fillRect(Math.random()*s,Math.random()*s,1.5,1.5)}}
  rPt(e){const b=this.rc.getBoundingClientRect();return {x:e.clientX-b.left-b.width/2,y:e.clientY-b.top-b.height/2}}
  rSeg(a,b){if(this.rPen)this.rPen.seg(a,b)}
  rDown=e=>{e.preventDefault();this.rSnap();this.buzz(6);if(!this.state.rTouched)this.setState({rTouched:true});try{this.rc.setPointerCapture(e.pointerId)}catch(_){}this.rLast=this.rPt(e);
    const s=this.state,b=s.rBrush==='powder'?undefined:s.rBrush;this.rPen=strokePainter(this.rCtx,this.rSide,{c:s.rColor,sizePx:s.rSize,n:s.sym,b});
    this.rCur={c:s.rColor,s:Math.max(1,Math.min(200,Math.round(s.rSize/this.rSide*1000))),n:s.sym,b,pts:[]};this.rRec.push(this.rCur);this.rAdd(this.rLast);this.rSeg(this.rLast,this.rLast)};
  // Records the stroke in recipe units (±1000 of the half-side) for share links and replays.
  rAdd(p){const c=this.rCur;if(!c)return;const q=v=>Math.max(-1000,Math.min(1000,pxToUnit(v,this.rSide))),ux=q(p.x),uy=q(p.y),n=c.pts.length;if(n&&c.pts[n-2]===ux&&c.pts[n-1]===uy)return;c.pts.push(ux,uy);this.rN=(this.rN||0)+1}
  rRecipe(){if(!this.rRec||this.rN>MAX_POINTS)return null;const strokes=this.rRec.filter(t=>t.pts.length).map(t=>({c:t.c,s:t.s,n:t.n,...(t.b?{b:t.b}:{}),p:encodePts(t.pts)}));return strokes.length?{v:1,type:'rangoli',data:{strokes}}:null}
  rMove=e=>{if(!this.rLast)return;e.preventDefault();const p=this.rPt(e);this.rSeg(this.rLast,p);this.rAdd(p);this.rLast=p};
  rUp=()=>{this.rLast=null;this.rCur=null;this.rPen=null};
  rSave=()=>{if(!this.rc)return;const n=this.state.sym,rec=this.rRecipe();if(this.rN>MAX_POINTS)this.flash('So detailed! This one shares as an image, no replay link.');
    this.openShare({recipe:rec,art:this.copyCv(this.rc),filename:'my-rangoli',heading:'Share your rangoli',kicker:`My Rangoli · ${n}-fold`,title:m=>m?`${m}'s rangoli`:'Made by me',body:`Every stroke mirrored ${n*2} ways, like rice flour on a doorstep.`,cta:'Now you draw one',prompt:'Show your rangoli 🪔 #Rangotsav'})};

  // Kolam
  setKolamCanvas=el=>{this.kc=el;if(el)requestAnimationFrame(()=>this.initKolam())};
  initKolam(){const el=this.kc;if(!el)return;const stage=el.parentElement,r=stage.getBoundingClientRect();const side=Math.max(220,Math.floor(Math.min(r.width-28,r.height-28)));const d=Math.min(2,window.devicePixelRatio||1);el.style.width=el.style.height=side+'px';el.width=el.height=Math.round(side*d);const x=el.getContext('2d');x.setTransform(d,0,0,d,0,0);this.kCtx=x;this.kSide=side;if(!this.kDots.size)this.kPreset('diamond');else this.kRebuild(false)}
  kPaint(prog=1){if(this.kCtx)drawKolam(this.kCtx,this.kSide,7,[...this.kDots.values()],this.kSegs||[],this.state.kColor,this.state.kShowDots,prog)}
  kRebuild(anim=true){if(!this.kSide)return;this.kSegs=kolamSegs([...this.kDots.values()],this.kSide,7);this.setState({kCount:this.kDots.size});cancelAnimationFrame(this.kRaf);
    if(!anim||this.reduced){this.kPaint(1);return}const t0=performance.now(),dur=Math.min(1700,450+this.kSegs.length*6);
    const f=now=>{const p=Math.min(1,(now-t0)/dur);this.kPaint(1-(1-p)*(1-p));if(p<1)this.kRaf=requestAnimationFrame(f)};this.kRaf=requestAnimationFrame(f)}
  kTap=e=>{e.preventDefault();this.buzz(8);const b=this.kc.getBoundingClientRect(),s=b.width/7;const i=Math.max(0,Math.min(6,Math.floor((e.clientX-b.left)/s))),j=Math.max(0,Math.min(6,Math.floor((e.clientY-b.top)/s))),k=i+','+j;if(this.kDots.has(k))this.kDots.delete(k);else this.kDots.set(k,[i,j]);this.kRebuild(true)};
  kPreset(name){this.kDots=new Map();let cells=[];if(name==='diamond')cells=diamondCells([1,3,5,7,5,3,1],3);else if(name==='square'){for(let i=1;i<6;i++)for(let j=1;j<6;j++)cells.push([i,j])}else{const all=[];for(let i=0;i<7;i++)for(let j=0;j<7;j++)all.push([i,j]);for(let n=0;n<11;n++){cells.push(all.splice(Math.floor(Math.random()*all.length),1)[0])}}
    cells.forEach(([i,j])=>this.kDots.set(i+','+j,[i,j]));this.kRebuild(true)}
  kSave=()=>{this.kPaint(1);if(!this.kc)return;const dots=[...this.kDots.values()];const rec=dots.length?{v:1,type:'kolam',data:{dots,c:this.state.kColor,d:this.state.kShowDots}}:null;
    this.openShare({recipe:rec,art:this.copyCv(this.kc),filename:'my-kolam',heading:'Share your kolam',kicker:`My Kolam · ${dots.length} pulli`,title:m=>m?`${m}'s kolam`:'Woven by me',body:'One unbroken line, looping around every dot.',cta:'Now you weave one',prompt:'Weave a kolam ✨ #Rangotsav'})};

  // Block print
  setBlockCanvas=el=>{this.bc=el;if(el)requestAnimationFrame(()=>this.initBlock())};
  initBlock(keep){const el=this.bc;if(!el)return;const r=el.parentElement.getBoundingClientRect();const w=Math.max(200,Math.floor(r.width-24)),h=Math.max(200,Math.floor(r.height-60));const d=Math.min(2,window.devicePixelRatio||1);el.style.width=w+'px';el.style.height=h+'px';el.width=Math.round(w*d);el.height=Math.round(h*d);const x=el.getContext('2d');x.setTransform(d,0,0,d,0,0);this.bCtx=x;this.bW=w;this.bH=h;paintFabric(x,w,h);this.bHist=[];this.bRecH=[];if(!keep)this.bRec=[];if(this.state.bCanUndo)this.setState({bCanUndo:false});
    const rm=this.pendingRemix;if(rm&&rm.type==='block'){this.pendingRemix=null;const cache={};rm.data.st.forEach(st=>blockPress(x,w,h,st,cache));this.bRec=rm.data.st.slice()}}
  stampVar(type,color,size){this.vc=this.vc||{};const key=type+color+size;if(!this.vc[key])this.vc[key]=[0,1,2].map(()=>makeStamp(type,color,size));const a=this.vc[key];return a[Math.floor(Math.random()*a.length)]}
  stampAt(px,py){const {block,ink,bSize}=this.state,v=this.stampVar(block,ink,bSize),x=this.bCtx;if(!x)return;x.save();x.globalCompositeOperation='multiply';x.globalAlpha=.84+Math.random()*.14;x.translate(px,py);x.rotate((Math.random()-.5)*.09);x.drawImage(v,-bSize*.6,-bSize*.6,bSize*1.2,bSize*1.2);x.restore()}
  bTap=e=>{e.preventDefault();this.bSnap();this.buzz(12);const r=this.bc.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top;
    const u=v=>Math.round(v/this.bW*1000);if(this.bRec.length<600)this.bRec.push({x:Math.max(-200,Math.min(1200,u(px))),y:Math.max(-200,Math.min(5200,u(py))),t:Math.max(0,BLOCK_TYPES.indexOf(this.state.block)),i:this.state.ink,z:Math.max(20,Math.min(800,u(this.state.bSize))),...(this.state.bRepeat?{r:1}:{})});
    if(!this.state.bRepeat){this.stampAt(px,py);return}
    const st=this.state.bSize*1.08,ox=((px%st)+st)%st,oy=((py%st)+st)%st;let col=0;
    for(let xx=ox-st;xx<this.bW+st;xx+=st,col++){const off=col%2?st/2:0;for(let yy=oy-st-off;yy<this.bH+st;yy+=st)this.stampAt(xx,yy+(col%2?0:0))}};
  bWash=()=>{if(!this.bCtx)return;this.bSnap();this.bRec=[];paintFabric(this.bCtx,this.bW,this.bH);this.flash('Fresh cloth. Undo brings the old one back.')};
  bSave=()=>{if(!this.bc)return;const a=Math.round(this.bH/this.bW*1000),rec=this.bRec.length&&a>=200&&a<=5000?{v:1,type:'block',data:{a,st:this.bRec}}:null;
    this.openShare({recipe:rec,art:this.copyCv(this.bc),filename:'my-block-print',heading:'Share your cloth',kicker:'My Block Print',title:m=>m?`${m}'s block print`:'Printed by me',body:'Hand-pressed, so no two stamps are ever alike.',cta:'Now you print one',prompt:'Print your own cloth 🌸 #Rangotsav'})};
  setBlockPreview=el=>{if(!el)return;requestAnimationFrame(()=>{const w=el.clientWidth||300,h=el.clientHeight||200,d=Math.min(2,window.devicePixelRatio||1);el.width=w*d;el.height=h*d;const x=el.getContext('2d');x.setTransform(d,0,0,d,0,0);paintFabric(x,w,h);const size=Math.max(46,w/4.6),st=size*1.12,types=['paisley','lotus','elephant'],inks=[C.magenta,C.indigo,C.green];let c=0;
    for(let i=0,xx=st*.5;xx<w+st;xx+=st,i++){for(let j=0,yy=(i%2?st:st*.5);yy<h+st;yy+=st,j++){const t=(i+j)%3;const v=makeStamp(types[t],inks[(i+j*2)%3],Math.round(size));x.save();x.globalCompositeOperation='multiply';x.globalAlpha=.9;x.translate(xx,yy);x.rotate((Math.random()-.5)*.08);x.drawImage(v,-size*.6,-size*.6,size*1.2,size*1.2);x.restore();c++}}})};

  // Truck plate
  setPlateCanvas=el=>{this.pc=el;if(el)this.drawPlateNow()};
  drawPlateNow(){if(this.pc)drawPlate(this.pc,this.state.plateFmt,this.state.plateName)}
  savePlate=()=>{if(!this.pc)return;this.drawPlateNow();const s=this.state,st=s.plateFmt==='sticker',n=(s.plateName||'').trim();
    this.openShare({recipe:n?{v:1,type:'plate',data:{n,f:s.plateFmt}}:null,art:this.copyCv(this.pc),asIs:true,filename:st?'rangotsav-sticker':'rangotsav-wallpaper',heading:st?'Share your sticker':'Share your wallpaper',kicker:'Truck art',title:m=>`${n||m||'My'} truck-art plate`,cta:'Paint yours',prompt:'Paint your name in truck art 🚚 #Rangotsav'})};

  // Poster
  savePoster=()=>{const s=this.state,cv=document.createElement('canvas');const w=(s.tdWord||'').toUpperCase().slice(0,10)||'MELA';drawPoster(cv,w,s.tdTilt,s.tdOff,PALS[s.tdPal]);
    this.openShare({recipe:{v:1,type:'poster',data:{w,t:s.tdTilt,o:s.tdOff,p:s.tdPal}},art:cv,asIs:true,filename:'rangotsav-poster',heading:'Share your poster',kicker:'Karkhana',title:m=>m?`${m}'s ${w} poster`:`My ${w} poster`,cta:'Print yours',prompt:'Make your mela poster 🎪 #Rangotsav'})};

  // Diya
  lightDiya=()=>{const now=Date.now();if(now-(this.lastLit||0)<450)return;this.lastLit=now;
    const url=this.props.diyaApiUrl;
    this.setState(s=>{const mine=s.mine+1;try{localStorage.setItem(LS,String(mine))}catch(e){}return {mine,pending:s.pending+1,lit:true,sparkOn:true,rowLit:Math.min(11,s.rowLit+1)}});
    clearTimeout(this.sparkT);this.sparkT=setTimeout(()=>this.setState({sparkOn:false}),700);
    this.buzz([12,50,22]);this.ting();stamp('diya');if(this.cT){clearTimeout(this.cT);this.cT=0;this.setState({countAnim:null})}
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

  render(){return <>{RangotsavView({...this.props,...this.renderVals()})}<ShareSheet req={this.state.share} onClose={this.closeShare}/><MyCourtyard open={this.state.meOpen} onClose={()=>this.setState({meOpen:false})}/></>}

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
      startPlaying:()=>this.scrollToId('naam'),
      festBadge:{go:id=>this.scrollToId(id)},cultR:{art:'rangoli'},cultK:{art:'kolam'},cultB:{art:'block'},naam:{initial:s.naamInit,share:this.openShareFn},
      mehendi:{share:this.openShareFn,remix:s.mehRemix,openSignal:s.mehOpen},greet:{lastArt:this.lastArt,preset:s.greetPreset},diyaFor:{},
      rBrushes:[['powder','Powder'],['petal','Petals'],['diya','Diyas'],['pookalam','Flowers']].map(([id,l])=>({label:l,...press(s.rBrush===id),pick:()=>this.setState({rBrush:id})})),
      openRangoli:e=>this.openTool('rangoli',e),openKolam:e=>this.openTool('kolam',e),openBlock:e=>this.openTool('block',e),closeTool:this.closeTool,setCloseBtn:this.setCloseBtn,
      setMorph:this.setMorph,m0:mv(0),m1:mv(1),m2:mv(2),
      scripts:[['EN','Latin'],['ಕನ್ನಡ','Kannada'],['हिंदी','Devanagari']].map((x,i)=>({label:x[0],name:'Show '+x[1],bg:s.morph===i?C.marigold:'transparent',pressed:s.morph===i?'true':'false',pick:()=>{this.morphPinned=true;clearTimeout(this.mpT);this.mpT=setTimeout(()=>{this.morphPinned=false},2500);this.setState({morph:i})}})),
      prevA:this.prevA,prevB:this.prevB,prevDots:this.prevDots,kPrev:this.kPrev,setBlockPreview:this.setBlockPreview,
      tdWord:s.tdWord,tdWordFull:word,tdTilt:t,tdOff:o,tdPalName:pal.name,tdBg:pal.bg,tdFg:pal.fg,
      tdFs:`clamp(36px, ${Math.min(26,100/len).toFixed(1)}vw, ${Math.round(Math.min(200,640/len))}px)`,
      tdShadow:`${o}px ${(o*.8).toFixed(1)}px 0 ${pal.mis}, ${o+4}px ${(o*.8+4).toFixed(1)}px 0 #1B1410`,
      tdWordTf:`rotate(${(-t*.25).toFixed(1)}deg)`,
      tdLetters:posterGeom(word,t).map(l=>({ch:l.ch===' '?'\u00A0':l.ch,tf:`translateY(${l.ty.toFixed(1)}px) rotate(${l.rot.toFixed(1)}deg) skewX(${l.skew.toFixed(1)}deg)`})),
      onTdWord:e=>{stamp('poster');this.setState({tdWord:e.target.value.slice(0,10)})},onTdTilt:e=>this.setState({tdTilt:+e.target.value}),onTdOff:e=>this.setState({tdOff:+e.target.value}),
      swapInk:()=>this.setState(x=>({tdPal:(x.tdPal+1)%PALS.length})),savePoster:this.savePoster,
      plateName:s.plateName,onPlateName:e=>{stamp('plate');this.setState({plateName:e.target.value.slice(0,22)})},setPlateCanvas:this.setPlateCanvas,savePlate:this.savePlate,
      plateMax:s.plateFmt==='sticker'?(s.wide?'380px':'300px'):(s.wide?'340px':'280px'),saveLabel:s.plateFmt==='sticker'?'Share sticker':'Share wallpaper',
      fmtOpts:[['wallpaper','Wallpaper','9:16 phone'],['sticker','Sticker','WhatsApp 512']].map(([id,l,sub])=>({label:l,sub,...press(s.plateFmt===id),pick:()=>this.setState({plateFmt:id})})),
      makers:this.makers,
      diyaCount:(s.countAnim!=null?s.countAnim:count).toLocaleString('en-IN'),setCountEl:this.setCountEl,lit:s.lit,unlit:!s.lit,sparkOn:s.sparkOn,lightDiya:this.lightDiya,
      diyaMsg:!s.lit?'Tap the diya. One second of your time, and the courtyard gets a little brighter.':s.pending>=4||s.mine>=4?'Arre wah, you are lighting up the whole street!':'Yours is glowing. Light one more for someone you miss?',
      rowDiyas:Array.from({length:11},(_,i)=>({lit:litSet.has(i),off:!litSet.has(i),delay:this.rowDelays[i]})),
      garlandTap:this.garlandTap,shareSite:this.shareSite,clubUrl:p.clubUrl||'#',
      isRangoli:s.tool==='rangoli',isKolam:s.tool==='kolam',isBlock:s.tool==='block',
      trayOpen:s.trayOpen||s.wide,trayExpanded:s.trayOpen?'true':'false',trayLabel:s.trayOpen?'Hide controls':'Show controls',toggleTray:()=>this.setState(x=>({trayOpen:!x.trayOpen})),
      setRangoliCanvas:this.setRangoliCanvas,rDown:this.rDown,rMove:this.rMove,rUp:this.rUp,rSave:this.rSave,rClear:()=>{if(!this.rCtx)return;this.rSnap();this.rRec=[];this.rN=0;this.rFloor();this.flash('Floor swept. Undo brings it back.')},rUndo:this.rUndo,rUndoOff:!s.rCanUndo,rUndoOp:s.rCanUndo?1:.4,rHint:!s.rTouched,
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
      navItems:[...[['naam','Naam Kolam'],['courtyard','Draw & Weave'],['karkhana','Karkhana'],['nameplate','Truck Art'],['greet','Greetings'],['diya','Light a Diya']].map(([id,l])=>{const on=s.active===id;return {label:l,href:'#'+id,cur:on?'true':'false',bg:on?C.marigold:'transparent',go:e=>{e.preventDefault();this.scrollToId(id)}}}),
        {label:'Pulli puzzle',href:'/pulli',cur:'false',bg:'transparent',go:()=>{}},
        {label:`My Courtyard ${s.meCount}/${STAMPS.length}`,href:'#me',cur:'false',bg:C.ivory,go:e=>{e.preventDefault();this.setState({meOpen:true})}}],
    };
  }
}
