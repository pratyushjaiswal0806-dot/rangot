'use client';
// Truck Art name plate: your name, and your name in Hindi, painted in one of four loud styles
// (desi film poster, matchbox label, postage stamp, mandala poster) with a painted saying.
// A 9:16 phone wallpaper or a 512px WhatsApp sticker. "Chalo!" revs the engine and sends the
// lorry off in a cloud of dust, then it rolls back in; tap the ghungroo chain to jingle it.
import { useCallback, useEffect, useRef, useState } from 'react';
import ToyShell, { ToolBtn } from './ToyShell';
import Morph from './Morph';
import CultureStrip from './CultureStrip';
import ShareSheet, { type ShareRequest } from '../ShareSheet';
import { BloomIcon } from './icons';
import { useElementSize, framePad, captionH } from '../../hooks/useElementSize';
import { drawPlate, PLATE_STYLES, SLOGANS } from '../../lib/art/truck';
import { toDevanagari } from '../../lib/translit';
import { readRemix } from '../../lib/remix';
import { savedName } from '../../lib/share';
import { stamp } from '../../lib/progress';
import { track } from '../../lib/track';
import { flash } from '../../lib/toast';
import { buzz, engine, horn, jingle } from '../../lib/sfx';
import { calm } from '../../lib/motion';
import { trail, type Trail } from '../../lib/trail';
import { done } from '../../lib/challenges';
import s from './ToyShell.module.css';

type Fmt = 'wallpaper' | 'sticker';
const FMTS: [Fmt, string][] = [['wallpaper', 'Wallpaper 9:16'], ['sticker', 'Sticker']];
const FONTS = ["400 100px 'Yatra One'", '900 100px Sarpanch', '800 100px Sarpanch', '700 40px Mukta', '800 30px Mukta', "700 100px 'Palanquin Dark'"];

export default function TruckToy() {
  const stage = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const { w, h } = useElementSize(stage);
  const [name, setName] = useState('');
  const [fmt, setFmt] = useState<Fmt>('wallpaper');
  const [slogan, setSlogan] = useState(0);
  const [theme, setTheme] = useState(0);
  const [ready, setReady] = useState(false);
  const [share, setShare] = useState<ShareRequest | null>(null);
  const [ring, setRing] = useState(0); // bumps to swing the ghungroo
  const plate = useRef<HTMLDivElement>(null);
  const dust = useRef<Trail | null>(null);
  const honks = useRef(0);
  const styles = useRef(new Set<number>());
  const driving = useRef(false);

  const draw = useCallback(() => { if (cv.current) drawPlate(cv.current, fmt, name, slogan, theme); }, [fmt, name, slogan, theme]);
  useEffect(() => {
    track('tool_open', { tool: 'plate' });
    setName(savedName());
    const fonts = document.fonts ? Promise.all(FONTS.map((f) => document.fonts.load(f, 'Aअ').catch(() => null))) : Promise.resolve();
    fonts.then(() => setReady(true));
    readRemix('plate').then((r) => {
      if (r?.type !== 'plate') return;
      setFmt(r.data.f); setSlogan(r.data.s ?? 0); setTheme(r.data.k ?? 0);
      flash('Type your own name on the plate!');
    });
  }, []);
  useEffect(() => { draw(); }, [draw, ready]);
  useEffect(() => { if (stage.current) dust.current = trail(stage.current, 'dust'); return () => dust.current?.stop(); }, []);
  useEffect(() => { styles.current.add(theme); if (styles.current.size >= PLATE_STYLES.length) done('truck-styles'); }, [theme]);

  const shuffle = () => {
    setSlogan((v) => (v + 1 + Math.floor(Math.random() * (SLOGANS.length - 1))) % SLOGANS.length);
    setTheme((v) => (v + 1 + Math.floor(Math.random() * (PLATE_STYLES.length - 1))) % PLATE_STYLES.length);
    buzz(8);
    stamp('plate');
  };
  const honk = () => {
    horn(true); buzz([30, 60, 30]);
    stage.current?.animate?.([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 260 });
    if (++honks.current >= 5) done('truck-horn');
  };
  const ghungroo = () => { jingle(); buzz(8); setRing((r) => r + 1); };

  // Chalo! The engine turns over and the plate shudders, then it pulls away in a cloud of dust,
  // honks from down the road, and rolls back in.
  const chalo = () => {
    const el = plate.current;
    if (!el || driving.current) return;
    done('truck-chalo');
    track('surprise', { tool: 'truck-chalo' });
    if (calm()) { horn(true); ghungroo(); return; }
    driving.current = true;
    engine(2.2);
    setRing((r) => r + 1);
    const r = el.getBoundingClientRect();
    const puff = () => { for (let k = 0; k < 3; k++) dust.current?.burst(r.left + r.width * (0.15 + Math.random() * 0.2), r.bottom - 6, '#E6D3B3', 5); };
    const a = el.animate([
      { transform: 'none' },
      { transform: 'translate(1px, -1px)', offset: 0.04 }, { transform: 'translate(-1px, 1px)', offset: 0.08 }, { transform: 'translate(1px, 0)', offset: 0.12 }, { transform: 'translate(-1px, -1px)', offset: 0.16 }, { transform: 'none', offset: 0.2 },
      { transform: 'translateX(140%) rotate(2deg)', offset: 0.46, easing: 'ease-in' },
      { transform: 'translateX(-140%) rotate(-2deg)', offset: 0.47 },
      { transform: 'translateX(6%) rotate(1deg)', offset: 0.82, easing: 'ease-out' },
      { transform: 'none' },
    ], { duration: 2800 });
    setTimeout(puff, 450); setTimeout(puff, 700); setTimeout(puff, 950);
    setTimeout(() => horn(false), 1350);
    setTimeout(() => { buzz([20, 40, 20]); setRing((n) => n + 1); }, 2300);
    a.finished.then(() => { driving.current = false; }, () => { driving.current = false; });
  };

  const onShare = () => {
    if (!cv.current) return;
    draw();
    stamp('plate');
    const n = name.trim(), st = fmt === 'sticker';
    const copy = document.createElement('canvas');
    copy.width = cv.current.width; copy.height = cv.current.height;
    copy.getContext('2d')!.drawImage(cv.current, 0, 0);
    setShare({
      recipe: n ? { v: 1, type: 'plate', data: { n, f: fmt, ...(slogan ? { s: slogan } : {}), ...(theme ? { k: theme } : {}) } } : null, art: copy, asIs: true, filename: st ? 'rangotsav-sticker' : 'rangotsav-wallpaper',
      heading: st ? 'Share your sticker' : 'Share your wallpaper', kicker: 'Truck art', title: (m) => `${n || m || 'My'} truck-art plate`, cta: 'Paint yours', prompt: 'Paint your name in truck art 🚚 #Rangotsav',
    });
  };

  // the plate fitted into the stage
  const ar = fmt === 'sticker' ? 1 : 1920 / 1080;
  const aw = Math.max(160, w - framePad(w, h)), ah = Math.max(200, h - framePad(w, h) - captionH(w, h));
  const pw = Math.floor(Math.min(aw, ah / ar)), ph = Math.floor(pw * ar);

  return (
    <>
      <ToyShell
        toy="truck" label="Truck art name plate" title="Truck Art" sub={<span lang="hi">ट्रक कला</span>} stageRef={stage}
        caption={name.trim() ? 'Horn OK Please' : 'Type your name below'}
        stage={
          <Morph id="truck">
            <div ref={plate} style={{ position: 'relative', lineHeight: 0 }}>
              <canvas ref={cv} role="img" aria-label="Your truck-art name plate" width={1080} height={1920} className={s.canvas} style={{ width: pw, height: ph, background: fmt === 'sticker' ? 'transparent' : '#1B1410' }} />
              <button type="button" className={s.ghungroo} onClick={ghungroo} aria-label="Jingle the ghungroo">
                {Array.from({ length: 9 }, (_, i) => <i key={`${ring}-${i}`} style={{ ['--bi' as string]: i }} />)}
              </button>
            </div>
          </Morph>
        }
        actions={<>
          <ToolBtn icon="📯" label="Horn" onClick={honk} title="Honk!" />
          <ToolBtn icon="🚚" label="Chalo!" onClick={chalo} title="Send the truck off" />
          <ToolBtn icon="🎲" label="Shuffle" onClick={shuffle} title="Another saying and style" />
          <ToolBtn icon={<BloomIcon />} label="Share" onClick={onShare} go className="rg-bloom" />
        </>}
      >
        <label className={s.field}>
          <span className={s.label}>Your name</span>
          <input className="rg-input" value={name} maxLength={22} autoComplete="given-name" placeholder="Apna naam" enterKeyHint="done"
            onChange={(e) => { stamp('plate'); setName(e.target.value.slice(0, 22)); }} style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22 }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Painted in Hindi as <b lang="hi" style={{ fontFamily: 'var(--display)', fontSize: 18 }}>{name.trim() ? toDevanagari(name.trim()) : 'अपना नाम'}</b></span>
        </label>
        <div className={s.seg} role="group" aria-label="Format">
          {FMTS.map(([id, l]) => <button key={id} aria-pressed={fmt === id} onClick={() => setFmt(id)}>{l}</button>)}
        </div>
        <div className={s.field}>
          <span className={s.label}>Painted saying</span>
          <div role="group" aria-label="Painted saying" className={s.row}>
            {SLOGANS.map(([l], i) => <button key={l} className={s.opt} style={{ fontSize: 11, flex: 'none', padding: '4px 12px', whiteSpace: 'nowrap' }} aria-pressed={slogan === i} onClick={() => setSlogan(i)}>{l}</button>)}
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Style · {PLATE_STYLES[theme].label}</span>
          <div role="group" aria-label="Style" className={s.swatches}>
            {PLATE_STYLES.map((t, i) => (
              <button key={t.label} className={s.swatch} aria-pressed={theme === i} aria-label={t.label} title={t.label} onClick={() => setTheme(i)}
                style={{ background: `conic-gradient(${t.swatch[0]} 0 25%, ${t.swatch[1]} 0 50%, ${t.swatch[2]} 0 75%, ${t.swatch[3]} 0)` }} />
            ))}
          </div>
        </div>
        <p className={s.label} style={{ margin: 0, textTransform: 'none', letterSpacing: 0, fontFamily: 'Mukta, sans-serif', fontWeight: 600, fontSize: 14 }}>
          Share opens your phone&apos;s share sheet, so it goes straight to WhatsApp, Instagram or Photos. On a laptop it downloads.
        </p>
        <CultureStrip art="plate" />
      </ToyShell>
      <ShareSheet req={share} onClose={() => setShare(null)} />
    </>
  );
}
