'use client';
// Truck-art selfie booth: your face, framed like the back of a lorry, with your name in truck
// lettering and stickers you drag around. The camera (or a photo you pick) never leaves the
// phone: everything is drawn on a canvas here and shared straight from the device. In the live
// view the stickers move (the nazar eye blinks, the diya flickers); a snap develops like an
// instant photo.
import { useCallback, useEffect, useRef, useState } from 'react';
import ToyShell, { ToolBtn } from './ToyShell';
import Morph from './Morph';
import ShareSheet, { type ShareRequest } from '../ShareSheet';
import { BloomIcon } from './icons';
import { useElementSize, framePad, captionH } from '../../hooks/useElementSize';
import { FRAMES, H, STICKERS, STICKER_R, W, drawCover, drawFrame, drawSticker, type Frame, type FrameId, type Sticker, type StickerId } from '../../lib/art/selfie';
import { savedName, saveName } from '../../lib/share';
import { stamp } from '../../lib/progress';
import { track } from '../../lib/track';
import { flash } from '../../lib/toast';
import { buzz, chime, ting } from '../../lib/sfx';
import { calm } from '../../lib/motion';
import { done } from '../../lib/challenges';
import s from './ToyShell.module.css';
import b from './SelfieToy.module.css';

type Mode = 'intro' | 'live' | 'shot';
const FONTS = ["400 100px 'Yatra One'", '900 100px Sarpanch', '800 100px Sarpanch', '700 40px Mukta'];

export default function SelfieToy() {
  const stage = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const photo = useRef<ImageBitmap | null>(null);
  const frameRef = useRef<Frame | null>(null);
  const raf = useRef(0);
  const drag = useRef<{ i: number; dx: number; dy: number } | null>(null);
  const fileIn = useRef<HTMLInputElement>(null);
  const { w, h } = useElementSize(stage);

  const [mode, setMode] = useState<Mode>('intro');
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [frame, setFrame] = useState<FrameId>('hornok');
  const [name, setName] = useState('');
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [err, setErr] = useState('');
  const [fontsOk, setFontsOk] = useState(false);
  const [share, setShare] = useState<ShareRequest | null>(null);
  const live = useRef({ stickers, facing, mode });
  live.current = { stickers, facing, mode };
  const frames = useRef(new Set<FrameId>());

  useEffect(() => {
    setName(savedName());
    track('tool_open', { tool: 'selfie' });
    const ready = document.fonts ? Promise.all(FONTS.map((f) => document.fonts.load(f).catch(() => null))) : Promise.resolve();
    ready.then(() => setFontsOk(true));
    return () => { cancelAnimationFrame(raf.current); stream.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  // the frame overlay only changes with the frame or the name
  useEffect(() => { frameRef.current = drawFrame(frame, name); paint(); }, [frame, name, fontsOk]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { frames.current.add(frame); if (frames.current.size >= 3) done('selfie-frames'); }, [frame]);

  const paint = useCallback(() => {
    const el = cv.current, f = frameRef.current;
    if (!el || !f) return;
    const x = el.getContext('2d')!;
    x.fillStyle = '#1B1410'; x.fillRect(0, 0, W, H);
    x.save(); x.clip(f.hole);
    const v = video.current, p = photo.current;
    if (p) drawCover(x, p, p.width, p.height, f.box, false);
    else if (v && v.readyState >= 2) drawCover(x, v, v.videoWidth, v.videoHeight, f.box, live.current.facing === 'user');
    else { x.fillStyle = '#2A1710'; x.fill(f.hole); x.fillStyle = 'rgba(251,243,228,.18)'; x.beginPath(); x.arc(W / 2, f.box.y + f.box.h * 0.42, 150, 0, Math.PI * 2); x.fill(); x.fillRect(W / 2 - 230, f.box.y + f.box.h * 0.66, 460, 400); }
    x.restore();
    x.drawImage(f.over, 0, 0);
    // stickers move while you're framing the shot, and hold still in it
    const t = live.current.mode === 'live' && !calm() ? performance.now() / 1000 : undefined;
    for (const st of live.current.stickers) drawSticker(x, st, t);
  }, []);
  useEffect(() => { paint(); }, [stickers, paint]);

  const loop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const step = () => { if (live.current.mode !== 'live') return; paint(); raf.current = requestAnimationFrame(step); };
    raf.current = requestAnimationFrame(step);
  }, [paint]);

  const startCamera = async (face = facing) => {
    setErr('');
    if (!navigator.mediaDevices?.getUserMedia) { setErr("This browser can't open the camera here. Pick a photo instead."); return; }
    try {
      stream.current?.getTracks().forEach((t) => t.stop());
      const st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: face, width: { ideal: 1280 }, height: { ideal: 1600 } }, audio: false });
      stream.current = st;
      photo.current = null;
      const v = video.current!;
      v.srcObject = st;
      await v.play().catch(() => {});
      live.current.mode = 'live';
      setMode('live');
      loop();
    } catch (e) {
      const n = e instanceof Error ? e.name : '';
      setErr(n === 'NotAllowedError' ? 'Camera permission was declined. No problem, pick a photo instead.' : n === 'NotFoundError' ? 'No camera found. Pick a photo instead.' : "Couldn't start the camera. Pick a photo instead.");
    }
  };
  const flip = () => { const f = facing === 'user' ? 'environment' : 'user'; setFacing(f); live.current.facing = f; startCamera(f); };
  const pickPhoto = async (file?: File) => {
    if (!file) return;
    try {
      photo.current = await createImageBitmap(file);
      stream.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
      live.current.mode = 'live';
      setMode('live');
      setErr('');
      paint();
      loop();
    } catch { setErr("That photo couldn't be opened. Try another one."); }
  };

  const snap = () => {
    if (live.current.mode !== 'live') return;
    paint();
    live.current.mode = 'shot';
    setMode('shot');
    cancelAnimationFrame(raf.current);
    buzz([10, 30, 10]); ting(1320, 0.8);
    stage.current?.animate?.([{ background: '#FFFFFF' }, { background: '#2A1710' }], { duration: 260 });
    stamp('selfie');
    track('selfie_taken', { frame, source: photo.current ? 'photo' : 'camera' });
    if (name.trim()) saveName(name.trim());
    // it develops like an instant photo: pale and warm, then the colour comes up
    if (!calm()) cv.current?.animate([{ filter: 'sepia(.9) brightness(1.75) contrast(.55) saturate(.4)' }, { filter: 'sepia(.25) brightness(1.1) contrast(.9)', offset: 0.6 }, { filter: 'none' }], { duration: 1800, easing: 'ease-out' });
    done('selfie-snap');
  };
  const retake = () => { live.current.mode = 'live'; setMode('live'); loop(); };
  const onShare = () => {
    if (!cv.current) return;
    if (live.current.mode === 'live') snap();
    const copy = document.createElement('canvas');
    copy.width = W; copy.height = H;
    copy.getContext('2d')!.drawImage(cv.current, 0, 0);
    setShare({
      recipe: null, art: copy, asIs: true, filename: 'truck-art-selfie', heading: 'Share your truck-art selfie', kicker: 'Truck art',
      title: (m) => `${name.trim() || m || 'My'} truck-art selfie`, cta: 'Make yours', prompt: 'Your face, truck-art style 🚚 #Rangotsav',
    });
    chime(5, 4);
  };

  const addSticker = (id: StickerId) => {
    const f = frameRef.current;
    const bx = f ? f.box : { x: 200, y: 300, w: 680, h: 700 };
    setStickers((list) => {
      const next = [...list, { id, x: bx.x + 80 + Math.random() * (bx.w - 160), y: bx.y + 80 + Math.random() * (bx.h * 0.5), s: 0.9 + Math.random() * 0.3 }].slice(-12);
      if (next.length >= 3) done('selfie-stickers');
      return next;
    });
    buzz(6);
  };
  const toCanvas = (e: React.PointerEvent) => { const r = cv.current!.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }; };
  const down = (e: React.PointerEvent) => {
    if (mode === 'shot') return;
    const p = toCanvas(e), list = live.current.stickers;
    for (let i = list.length - 1; i >= 0; i--) {
      const st = list[i];
      if (Math.hypot(p.x - st.x, p.y - st.y) < STICKER_R * st.s) {
        drag.current = { i, dx: st.x - p.x, dy: st.y - p.y };
        try { cv.current!.setPointerCapture(e.pointerId); } catch {}
        return;
      }
    }
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const p = toCanvas(e);
    setStickers((list) => list.map((st, i) => (i === d.i ? { ...st, x: Math.max(0, Math.min(W, p.x + d.dx)), y: Math.max(0, Math.min(H, p.y + d.dy)) } : st)));
  };
  const up = () => { drag.current = null; };

  // preview size: the 4:5 canvas fitted into the stage
  const avail = { w: Math.max(200, w - framePad(w, h)), h: Math.max(250, h - framePad(w, h) - captionH(w, h)) };
  const pw = Math.floor(Math.min(avail.w, (avail.h * W) / H)), ph = Math.floor((pw * H) / W);

  return (
    <>
      <ToyShell
        toy="selfie" label="Truck-art selfie booth" title="Truck-art Selfie" sub={<span lang="hi">ट्रक सेल्फ़ी</span>} stageRef={stage}
        caption={mode === 'intro' ? 'Your photo never leaves your phone' : mode === 'shot' ? 'Snapped! Share it or retake' : 'Drag the stickers around · tap Snap'}
        stage={<>
          <Morph id="selfie">
            <div className={b.wrap} style={{ width: pw, height: ph }}>
              <canvas ref={cv} width={W} height={H} className={s.canvas} style={{ width: pw, height: ph, cursor: 'grab' }} aria-label="Your truck-art selfie preview"
                onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
              {mode === 'intro' && (
                <div className={b.intro}>
                  <b>Your face, painted like the back of a lorry.</b>
                  <span>We only use the camera inside this page. Nothing is uploaded or saved anywhere unless you share it yourself.</span>
                  <button className={`${s.btn} ${s.primary}`} onClick={() => startCamera()}>📷 Start camera</button>
                  <button className={s.btn} onClick={() => fileIn.current?.click()}>🖼️ Use a photo</button>
                  {err && <em role="alert">{err}</em>}
                </div>
              )}
            </div>
          </Morph>
          <video ref={video} playsInline muted className={b.video} />
        </>}
        actions={mode === 'shot' ? <>
          <ToolBtn icon="↺" label="Retake" onClick={retake} />
          <ToolBtn icon={<BloomIcon />} label="Share" onClick={onShare} go className="rg-bloom" />
        </> : <>
          <ToolBtn icon="🔄" label="Flip" onClick={flip} disabled={mode !== 'live' || !stream.current} title="Flip camera" />
          <ToolBtn icon="🖼️" label="Photo" onClick={() => fileIn.current?.click()} title="Use a photo" />
          <ToolBtn icon="📸" label="Snap" onClick={snap} disabled={mode !== 'live'} go />
        </>}
      >
        <div className={s.field}>
          <span className={s.label}>Frame</span>
          <div role="group" aria-label="Frame" className={s.row}>
            {FRAMES.map((f) => <button key={f.id} className={s.opt} style={{ fontSize: 13 }} aria-pressed={frame === f.id} onClick={() => setFrame(f.id)}>{f.label}</button>)}
          </div>
        </div>
        <label className={s.field}>
          <span className={s.label}>Name on the plate</span>
          <input className="rg-input" value={name} maxLength={22} placeholder="Apna naam" autoComplete="given-name" onChange={(e) => setName(e.target.value.slice(0, 22))} style={{ fontFamily: "'Yatra One', serif", fontSize: 22 }} />
        </label>
        <div className={s.field}>
          <span className={s.label}>Stickers (tap to add, drag to move)</span>
          <div className={s.row}>
            {STICKERS.map((st) => <button key={st.id} className={s.opt} style={{ fontSize: 13, flex: '0 1 auto' }} onClick={() => addSticker(st.id)} disabled={mode === 'shot'}>{st.label}</button>)}
            {stickers.length > 0 && <button className={s.toggle} onClick={() => { setStickers([]); flash('Stickers cleared.'); }} disabled={mode === 'shot'}>Clear</button>}
          </div>
        </div>
        <p className={b.note}>Tip: hold the phone at arm&apos;s length and fit your face inside the arch.</p>
      </ToyShell>
      <input ref={fileIn} type="file" accept="image/*" hidden onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ''; }} />
      <ShareSheet req={share} onClose={() => setShare(null)} />
    </>
  );
}
