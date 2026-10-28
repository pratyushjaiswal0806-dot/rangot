// Reel export: replays the creation inside a story template on a 1080×1920 canvas, with a
// tanpura drone and a diya "ting", recorded with MediaRecorder. MP4 where the browser can
// (Safari, recent Chrome), WebM otherwise.
import { createPlayer } from './art/player';
import { artBox, H, storyBackground, storyFrame, storyText, W, type StoryTemplate, type StoryText } from './art/story';
import { INK } from './art/palette';
import type { Recipe } from './recipe';

const TYPES = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
export function reelType(): string | null {
  if (typeof MediaRecorder === 'undefined' || typeof HTMLCanvasElement.prototype.captureStream !== 'function') return null;
  return TYPES.find((t) => MediaRecorder.isTypeSupported(t)) ?? null;
}

function drone(a: AudioContext, out: AudioNode, dur: number) {
  const t0 = a.currentTime;
  const master = a.createGain();
  master.gain.setValueAtTime(0, t0);
  master.gain.linearRampToValueAtTime(0.16, t0 + 1.2);
  master.gain.setValueAtTime(0.16, t0 + dur - 1.2);
  master.gain.linearRampToValueAtTime(0, t0 + dur);
  master.connect(out);
  // Pa, Sa, Sa, low Sa: the four tanpura strings, plucked in a slow cycle.
  const notes = [220, 293.66, 293.66, 146.83];
  for (let k = 0; k * 0.9 < dur; k++) {
    const f = notes[k % 4], t = t0 + k * 0.9;
    for (const [m, v] of [[1, 0.5], [2, 0.18], [3, 0.1], [4, 0.06]] as const) {
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'sine';
      o.frequency.value = f * m * (1 + (m - 1) * 0.0015);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + 3.2);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 3.3);
    }
  }
}
function ting(a: AudioContext, out: AudioNode, at: number) {
  for (const [f, v] of [[880, 0.12], [1320, 0.07], [2640, 0.025]]) {
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + at;
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 1.9);
  }
}

export async function recordReel(recipe: Recipe, t: StoryTemplate, text: StoryText, onProgress?: (p: number) => void): Promise<{ blob: Blob; ext: string } | null> {
  const type = reelType();
  if (!type) return null;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  Object.assign(cv.style, { position: 'fixed', left: '0', top: '0', width: '2px', height: '2px', opacity: '0', pointerEvents: 'none' });
  document.body.appendChild(cv);
  const x = cv.getContext('2d')!;
  const bg = document.createElement('canvas');
  bg.width = W; bg.height = H;
  storyBackground(bg.getContext('2d')!, t);

  const player = createPlayer(recipe, 900);
  const box = artBox(t, player.canvas.width, player.canvas.height);
  const intro = 500, play = Math.min(5500, Math.max(2500, player.duration)), hold = 2600;
  const total = intro + play + hold;

  const ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const dest = ac.createMediaStreamDestination();
  drone(ac, dest, total / 1000);
  ting(ac, dest, (intro + play) / 1000);
  const stream = new MediaStream([...cv.captureStream(30).getVideoTracks(), ...dest.stream.getAudioTracks()]);
  const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  const done = new Promise<void>((r) => { rec.onstop = () => r(); });

  const frame = (ms: number) => {
    x.drawImage(bg, 0, 0);
    storyFrame(x, t, box);
    player.seek(Math.max(0, (ms - intro) / play));
    x.drawImage(player.canvas, box.x, box.y, box.w, box.h);
    if (t !== 'midnight') { x.lineWidth = 6; x.strokeStyle = INK; x.strokeRect(box.x - 8, box.y - 8, box.w + 16, box.h + 16); }
    const a = Math.min(1, Math.max(0, (ms - intro - play * 0.6) / 700));
    if (a > 0) { x.save(); x.globalAlpha = a; storyText(x, t, text); x.restore(); }
  };
  frame(0);
  rec.start(250);
  const start = performance.now();
  await new Promise<void>((resolve) => {
    const step = () => {
      const ms = performance.now() - start;
      frame(Math.min(ms, total));
      onProgress?.(Math.min(1, ms / total));
      if (ms < total) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
  rec.stop();
  await done;
  stream.getTracks().forEach((tr) => tr.stop());
  ac.close().catch(() => {});
  cv.remove();
  const mime = type.split(';')[0];
  return { blob: new Blob(chunks, { type: mime }), ext: mime === 'video/mp4' ? 'mp4' : 'webm' };
}
