// Client-side sharing: short links, files via the Web Share API, downloads and the clipboard.
import type { Recipe } from './recipe';

const links = new Map<string, Promise<string | null>>();

// POSTs the recipe once per distinct content; resolves to the full /r/<id> URL, or null when
// share links are off (no store configured, rate limited, offline).
export function makeLink(r: Recipe): Promise<string | null> {
  const key = JSON.stringify(r);
  let p = links.get(key);
  if (!p) {
    p = fetch('/api/creations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: key })
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => (d && typeof d.id === 'string' ? `${location.origin}/r/${d.id}` : null))
      .catch(() => null);
    p.then((v) => { if (!v) links.delete(key); });
    links.set(key, p);
  }
  return p;
}

export const siteUrl = () => location.origin;
export const prettyUrl = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

export function toBlob(cv: HTMLCanvasElement, type = 'image/png', q?: number): Promise<Blob | null> {
  return new Promise((r) => cv.toBlob(r, type, q));
}

export async function copy(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

export function download(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

// 'shared' | 'saved' (downloaded instead) | 'cancelled'
export async function shareFile(blob: Blob, filename: string, text: string, title: string): Promise<'shared' | 'saved' | 'cancelled'> {
  try {
    const file = new File([blob], filename, { type: blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title, text });
      return 'shared';
    }
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') return 'cancelled';
  }
  download(blob, filename);
  return 'saved';
}

export function whatsapp(text: string) {
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
}

const NAME = 'rangotsav:name';
export function savedName(): string {
  try { return localStorage.getItem(NAME) || ''; } catch { return ''; }
}
export function saveName(n: string) {
  try { localStorage.setItem(NAME, n); } catch {}
}
