// Night mode: on all day during Diwali (by IST date, from data/festivals.json), and every
// evening from 7pm to 5am local time. A visitor can pin it on or off (footer toggle).
import data from '../data/festivals.json';

export type ThemePref = 'auto' | 'night' | 'day';
export const THEME_KEY = 'rangotsav:theme';
const WINDOWS = (data.festivals as { key: string; date?: string; from?: string; to?: string }[])
  .filter((f) => f.key === 'diwali' && f.date)
  .map((f) => [f.from ?? f.date, f.to ?? f.date]);

// Runs inline in <head> before first paint, so there's no flash of the day theme.
export const THEME_SCRIPT = `(function(){try{var m=localStorage.getItem('${THEME_KEY}')||'auto';var q=new URLSearchParams(location.search).get('theme');if(q==='night'||q==='day')m=q;var n=m==='night';if(m==='auto'){var d=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());var W=${JSON.stringify(WINDOWS)};for(var i=0;i<W.length;i++)if(d>=W[i][0]&&d<=W[i][1])n=true;var h=new Date().getHours();if(h>=19||h<5)n=true}if(n)document.documentElement.setAttribute('data-theme','night')}catch(e){}})();`;

export function themePref(): ThemePref {
  try { const v = localStorage.getItem(THEME_KEY); return v === 'night' || v === 'day' ? v : 'auto'; } catch { return 'auto'; }
}
export function applyTheme(p: ThemePref) {
  try { if (p === 'auto') localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, p); } catch {}
  const s = document.createElement('script');
  document.documentElement.removeAttribute('data-theme');
  s.textContent = THEME_SCRIPT;
  document.head.appendChild(s);
  s.remove();
}
