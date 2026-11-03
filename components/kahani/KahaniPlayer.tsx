'use client';
// "▶ Play the Kahani": a story's chapters as a picture book that plays itself. A title card, one
// page per chapter (its picture big and moving, the words appearing a sentence at a time, Cheenti
// narrating from the corner of the caption), then "now it's your turn". Pages turn with a view
// transition: React <ViewTransition> keyed by page, with a transition type for the direction.
// ← → or a swipe turn them by hand, Space pauses, Esc closes; focus stays inside while it's open.
// "Padh ke sunao" reads it aloud (speechSynthesis, an Indian English voice where the device has
// one) over the story's own music (lib/music.ts), which goes softer while the voice speaks; turning
// either on turns sound on. With reduced motion the pages and
// pictures simply appear. Loaded only when opened (components/kahani/PlayKahani.tsx).
import { addTransitionType, startTransition, useCallback, useEffect, useRef, useState, ViewTransition } from 'react';
import Art from './Art';
import Rich from './Rich';
import Desi from '../site/Desi';
import Mandala from '../site/Mandala';
import Cheenti from '../site/Cheenti';
import type { Chapter } from '../../content/kahani/types';
import { isMuted, onMute, setMuted, whoosh } from '../../lib/sfx';
import { duckTune, playTune, stopTune } from '../../lib/music';
import { musicOn, setBookOpen, setMusicOn } from '../../lib/musicPref';
import type { ToyId } from '../../lib/toys';
import { track } from '../../lib/track';
import s from './KahaniPlayer.module.css';

export type PlayerProps = { toy: string; title: string; label: string; lead: string; chapters: Chapter[]; floor: string; toyTitle: string; onClose: () => void };

// a chapter's sentences, revealed (and read) one at a time
const sentences = (t: string) => t.split(/(?<=[.!?])\s+(?=[A-Z“"*[(])/);
// what the voice says: the story markup taken out
const spoken = (t: string) => t.replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, '$1').replace(/\[\[([^\]]+)\]\]/g, '$1').replace(/\*/g, '');
const synth = () => (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null);
function voiceFor(): SpeechSynthesisVoice | null {
  const vs = synth()?.getVoices() ?? [];
  return vs.find((v) => v.lang === 'en-IN') ?? vs.find((v) => /^en[-_]IN/i.test(v.lang)) ?? vs.find((v) => v.lang.startsWith('en')) ?? null;
}

function Icon({ d }: { d: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path d={d} fill="currentColor" /></svg>;
}

export default function KahaniPlayer({ toy, title, label, lead, chapters, floor, toyTitle, onClose }: PlayerProps) {
  const N = chapters.length + 2;
  const [page, setPage] = useState(0);
  const [line, setLine] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [voice, setVoice] = useState(false);
  const [talking, setTalking] = useState(false);
  const [song, setSong] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const ch = page > 0 && page <= chapters.length ? chapters[page - 1] : null;
  const lines = ch ? sentences(ch.body) : [];
  const end = page === N - 1;

  // the page being shown or turned to: quick taps during a turn count from here, not from a page
  // that hasn't rendered yet
  const at = useRef(0);
  const go = useCallback((n: number) => {
    if (n < 0 || n >= N || n === at.current) return;
    const dir = n > at.current ? 'page-next' : 'page-prev';
    at.current = n;
    clearTimeout(timer.current);
    synth()?.cancel();
    whoosh(0.3, 1800, 5200, 0.04);
    startTransition(() => { addTransitionType(dir); setPage(n); setLine(0); });
  }, [N]);
  const goRef = useRef(go);
  goRef.current = go;
  const step = (d: number) => go(at.current + d);

  // open: hold the page still behind, focus the close button, take over the story's music, and listen for keys
  useEffect(() => {
    const html = document.documentElement, was = html.style.overflow;
    html.style.overflow = 'hidden';
    setTimeout(() => closeBtn.current?.focus(), 40);
    track('kahani_play', { toy });
    setBookOpen(true);
    setSong(musicOn());
    const start = () => { if (musicOn()) playTune(toy as ToyId, 0.75, 'book'); };
    start();
    const offMute = onMute(() => { if (isMuted()) { stopTune('book'); synth()?.cancel(); } else start(); });
    // Esc closes (a glossary card open inside catches its own Esc first); Tab stays inside
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); return; }
      if (e.key !== 'Tab' || !root.current) return;
      const f = [...root.current.querySelectorAll<HTMLElement>('button:not([disabled]):not([hidden]), a[href], [tabindex]:not([tabindex="-1"])')];
      if (!f.length) return;
      if (!root.current.contains(document.activeElement)) { e.preventDefault(); f[0].focus(); }
      else if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { html.style.overflow = was; stopTune('book'); setBookOpen(false); offMute(); synth()?.cancel(); clearTimeout(timer.current); window.removeEventListener('keydown', onKey); };
  }, [toy]);

  // page turns and pause from the keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const onButton = (e.target as HTMLElement).closest('button, a');
      if (e.key === 'ArrowRight') { e.preventDefault(); goRef.current(at.current + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goRef.current(at.current - 1); }
      else if (e.key === ' ' && !onButton) { e.preventDefault(); setPlaying((p) => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // the book plays itself: the title for a few seconds, then each sentence in turn (read aloud, or
  // timed by its length), then the next page; the last page waits
  useEffect(() => { if (end) track('kahani_done', { toy }); }, [end, toy]);
  useEffect(() => {
    clearTimeout(timer.current);
    if (!playing || end) return;
    if (page === 0) { timer.current = setTimeout(() => goRef.current(1), 4200); return; }
    // (auto-advance counts from the page on screen; a manual turn resets this effect anyway)
    const said = lines[line] ?? '';
    const after = () => {
      if (line < lines.length - 1) setLine((l) => l + 1);
      else timer.current = setTimeout(() => goRef.current(page + 1), 1600);
    };
    const sy = synth();
    if (voice && sy && !isMuted()) {
      // a sentence stays up at least as long as it would without the voice (a device with no
      // voices fails at once, and that shouldn't race through the book)
      let live = true, fired = false;
      const least = performance.now() + 1800 + said.length * 34;
      const u = new SpeechSynthesisUtterance(spoken(said));
      const v = voiceFor();
      u.lang = v?.lang ?? 'en-IN'; if (v) u.voice = v;
      u.rate = 0.95; u.pitch = 1.05;
      const next = () => { if (!live || fired) return; fired = true; clearTimeout(guard); setTalking(false); timer.current = setTimeout(after, Math.max(350, least - performance.now())); };
      u.onstart = () => live && setTalking(true);
      u.onend = u.onerror = next;
      // a moment's gap after cancel() before speaking (some browsers drop an immediate speak), and a
      // guard in case a device without voices never says it has finished
      timer.current = setTimeout(() => sy.speak(u), 120);
      const guard = setTimeout(() => { sy.cancel(); next(); }, 3000 + said.length * 110);
      return () => { live = false; clearTimeout(guard); setTalking(false); sy.cancel(); clearTimeout(timer.current); };
    }
    timer.current = setTimeout(after, 1800 + said.length * 34);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, line, playing, voice, end]);

  // softer music while the voice reads
  useEffect(() => { duckTune(talking); }, [talking]);
  const toggleSong = () => {
    const on = !song;
    if (on && isMuted()) setMuted(false);
    setSong(on);
    setMusicOn(on);
    if (on) playTune(toy as ToyId, 0.75, 'book'); else stopTune('book');
  };

  const toggleVoice = () => {
    if (!synth()) return;
    if (!voice && isMuted()) setMuted(false);
    if (voice) synth()?.cancel();
    setVoice(!voice);
    setPlaying(true);
  };
  const leave = (hash: string) => {
    closeRef.current();
    setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };
  const down = (e: React.PointerEvent) => { swipe.current = { x: e.clientX, y: e.clientY }; };
  const up = (e: React.PointerEvent) => {
    const st = swipe.current;
    swipe.current = null;
    if (!st) return;
    const dx = e.clientX - st.x, dy = e.clientY - st.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
  };

  return (
    <div ref={root} role="dialog" aria-modal="true" aria-label={`Picture book: ${label}`} className={s.player} style={{ ['--floor' as string]: floor }}>
      <div className={s.bar}>
        <span className={s.brand}>Kahani · {toyTitle}</span>
        <ol className={s.pips} aria-label="Pages">
          {Array.from({ length: N }, (_, i) => (
            <li key={i}><button type="button" aria-label={`Page ${i + 1} of ${N}`} aria-current={i === page ? 'step' : undefined} onClick={() => go(i)} /></li>
          ))}
        </ol>
        <button ref={closeBtn} type="button" className={s.x} onClick={onClose} aria-label="Close the picture book">✕</button>
      </div>

      <div className={s.stage} onPointerDown={down} onPointerUp={up} onPointerCancel={() => { swipe.current = null; }}>
        <ViewTransition key={page} enter={{ 'page-next': 'kp-in-next', 'page-prev': 'kp-in-prev', default: 'none' }} exit={{ 'page-next': 'kp-out-next', 'page-prev': 'kp-out-prev', default: 'none' }} default="none">
          <div className={s.page}>
            {page === 0 && (
              <div className={s.cover}>
                <Mandala className={s.mandala} />
                <Desi as="h2" text={title} label={label} pop reveal={false} className={s.bigTitle} />
                <p className={s.lead}>{lead}</p>
                <div className={s.hello}>
                  <span className={s.antBig}><Cheenti pose="wave" /></span>
                  <span className={s.speech}>Chalo, kahani shuru karein! <small>Come, let’s begin the story.</small></span>
                </div>
              </div>
            )}
            {ch && (
              <div className={s.spread}>
                <div className={s.frame}><div className={s.ken}><Art id={ch.art} uid="-kp" className={s.art} /></div></div>
                <div className={s.caption}>
                  <span className={s.ant}><Cheenti pose={talking ? 'talk' : 'peek'} /></span>
                  <span className={s.kicker}>{String(page).padStart(2, '0')} · {ch.kicker}</span>
                  <h2 className={s.title}>{ch.title}</h2>
                  <p className={s.body}>
                    {lines.map((l, i) => <span key={i} className={i <= line || !playing ? s.on : s.off}><Rich text={l} />{' '}</span>)}
                  </p>
                </div>
              </div>
            )}
            {end && (
              <div className={s.cover}>
                <Mandala className={s.mandala} />
                <Desi as="h2" text="अब आपकी Baari" label="Now it’s your turn" pop reveal={false} className={s.bigTitle} />
                <span className={s.antBig}><Cheenti pose="cheer" /></span>
                <div className={s.endBtns}>
                  <button type="button" className={s.go} onClick={() => leave('#toy')}>Try {toyTitle} →</button>
                  <button type="button" className={s.alt} onClick={() => leave('#sach-gappa')}>Sach ya Gappa? quiz</button>
                  <button type="button" className={s.alt} onClick={() => { go(0); setPlaying(true); }}>↺ Play it again</button>
                </div>
              </div>
            )}
          </div>
        </ViewTransition>
      </div>

      <div className={s.controls}>
        <button type="button" className={s.ctl} onClick={() => step(-1)} disabled={page === 0} aria-label="Previous page"><Icon d="M15 5 8 12l7 7" /></button>
        <button type="button" className={`${s.ctl} ${s.main}`} onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Icon d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <Icon d="M8 5v14l11-7Z" />}
        </button>
        <button type="button" className={s.ctl} onClick={() => step(1)} disabled={end} aria-label="Next page"><Icon d="m9 5 7 7-7 7" /></button>
        <div className={s.toggles}>
        <button type="button" className={s.voice} aria-pressed={song} onClick={toggleSong} aria-label="Sangeet: the story's music">
          <Icon d="M10 3v11.3A3.2 3.2 0 1 0 12 17V7h6V3Z" />
          Sangeet
        </button>
        <button type="button" className={s.voice} aria-pressed={voice} onClick={toggleVoice} hidden={!synth()}>
          <Icon d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4.5 4.5 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
          Padh ke sunao
        </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{`Page ${page + 1} of ${N}${ch ? `: ${ch.title}` : end ? ': now it’s your turn' : ''}`}</p>
    </div>
  );
}
