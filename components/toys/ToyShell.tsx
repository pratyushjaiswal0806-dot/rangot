'use client';
// Frame for every full-screen toy (drawing toys, poster, truck plate, Naam Kolam, selfie): top bar with a
// close button, the stage, and the control tray. It fills the first screen; the toy's story
// (components/kahani, id="kahani") scrolls up from below it, and "Kahani ↓" in the bar jumps there.
// Escape closes and Ctrl/Cmd+Z undoes while the toy is on screen. data-toy lets site-wide styles
// (toasts) know a toy is open. With `toy` set, the tray starts with its three Chunauti and Cheenti
// gives a one-line tip on the first visit (after any ghost-hand demo has finished).
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useRouter } from 'next/navigation';
import { cameFromSite } from '../../lib/nav';
import SoundToggle from '../site/SoundToggle';
import Desi from '../site/Desi';
import { TOYS, type ToyId } from '../../lib/toys';
import { say, tipFor } from '../../lib/cheenti';
import Challenges from './Challenges';
import RotateNudge from './RotateNudge';
import s from './ToyShell.module.css';

// One button of the action toolbar: an icon over a short label. `go` marks the main action.
export function ToolBtn({ icon, label, onClick, disabled, go, title, className }: { icon: ReactNode; label: string; onClick: () => void; disabled?: boolean; go?: boolean; title?: string; className?: string }) {
  return (
    <button type="button" className={`${s.tool} ${go ? s.go : ''} ${className ?? ''}`} onClick={onClick} disabled={disabled} title={title ?? label}>
      <i aria-hidden="true">{icon}</i>{label}
    </button>
  );
}

export function useBack() {
  const router = useRouter();
  return () => { if (cameFromSite()) router.back(); else router.push('/'); };
}

// Fullscreen + sideways where the browser allows it (Android Chrome); iOS Safari has neither, so no button there.
function FullscreenBtn({ className }: { className: string }) {
  const [can, setCan] = useState(false);
  const [on, setOn] = useState(false);
  useEffect(() => {
    setCan(!!document.fullscreenEnabled && window.matchMedia('(pointer: coarse)').matches);
    const f = () => setOn(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);
  if (!can) return null;
  const toggle = async () => {
    try {
      if (document.fullscreenElement) { await document.exitFullscreen(); (screen.orientation as ScreenOrientation & { unlock?: () => void }).unlock?.(); return; }
      await document.documentElement.requestFullscreen();
      await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape');
    } catch { /* refused or unsupported: stay as we are */ }
  };
  return (
    <button type="button" className={className} onClick={toggle} aria-pressed={on} aria-label={on ? 'Leave fullscreen' : 'Fullscreen'} title={on ? 'Leave fullscreen' : 'Fullscreen, sideways'}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        {on ? <path d="M7 3v4H3M13 3v4h4M7 17v-4H3M13 17v-4h4" /> : <path d="M3 7V3h4M17 7V3h-4M3 13v4h4M17 13v4h-4" />}
      </svg>
    </button>
  );
}

export default function ToyShell({ toy, label, title, sub, stageRef, stage, caption, actions, children, onUndo }: {
  toy?: ToyId;
  label: string;
  title: string;
  sub?: ReactNode;
  stageRef: RefObject<HTMLDivElement | null>;
  stage: ReactNode;
  caption?: ReactNode;
  actions: ReactNode;
  children?: ReactNode;
  onUndo?: () => void;
}) {
  const back = useBack();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(true);
  const undoRef = useRef(onUndo);
  undoRef.current = onUndo;
  const backRef = useRef(back);
  backRef.current = back;
  const shellRef = useRef<HTMLElement>(null);
  // the toy's keys only apply while it is on screen (not while reading or quizzing in the story below)
  const onScreen = useRef(true);
  const [story, setStory] = useState(false);

  useEffect(() => {
    setStory(!!document.getElementById('kahani'));
    const el = shellRef.current;
    const io = el && 'IntersectionObserver' in window ? new IntersectionObserver(([en]) => { onScreen.current = en.intersectionRatio > 0.5; }, { threshold: [0, 0.5, 1] }) : null;
    if (el) io?.observe(el);
    const t = setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 60);
    const onKey = (e: KeyboardEvent) => {
      if (!onScreen.current) return;
      if (e.key === 'Escape') { backRef.current(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && undoRef.current) { e.preventDefault(); undoRef.current(); }
    };
    window.addEventListener('keydown', onKey);
    const tip = toy ? setTimeout(() => { const line = tipFor(toy); if (line) say(line, { once: 'tip:' + toy, pose: 'point', ms: 6500 }); }, 2800) : undefined;
    return () => { clearTimeout(t); clearTimeout(tip); io?.disconnect(); window.removeEventListener('keydown', onKey); };
  }, [toy]);

  return (
    <section ref={shellRef} id="toy" aria-label={label} className={s.shell} data-toy="" data-craft={toy}>
      <div className={s.bar}>
        <div className={s.titles}><Desi as="h1" className={s.title} rough={false} text={TOYS.find((x) => x.title === title)?.mix ?? title} label={title} />{sub && <span className={s.sub}>{sub}</span>}</div>
        <div className={s.barBtns}>
          {story && (
            <a href="#kahani" className={s.story} aria-label="Kahani: the story of this craft">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18"><path d="M9 2v12M3.5 9 9 14.5 14.5 9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span>Kahani</span>
            </a>
          )}
          <FullscreenBtn className={s.sound} />
          <SoundToggle className={s.sound} />
          <button ref={closeRef} className={s.close} onClick={back} aria-label="Close">✕</button>
        </div>
      </div>
      <div ref={stageRef} className={s.stage} data-stage="">
        {stage}
        {caption && <span className={s.caption}>{caption}</span>}
        <RotateNudge />
      </div>
      <div className={s.tray + (open ? '' : ' ' + s.shut)}>
        <button className={s.handle} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Hide controls' : 'Show controls'}><span aria-hidden="true" /></button>
        <div className={s.actions}>{actions}</div>
        <div className={s.more}>{toy && <Challenges toy={toy} />}{children}</div>
      </div>
    </section>
  );
}
