// Festival calendar: what's on today, what's next, and greeting copy. Dates are IST days.
import data from '../data/festivals.json';
import type { Lang } from './recipe';

export type Festival = {
  id: string; key: string; name: string; date?: string; from?: string; to?: string; approx?: boolean;
  tool: string; accent: string; story: string; greet: Partial<Record<Lang, string>> & { en: string };
};
export const FESTIVALS = data.festivals as Festival[];
export const ANYDAY = data.anyday as Festival;
export const MESSAGES = data.messages as Record<Lang, string>[];
export const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' }, { id: 'hi', label: 'हिंदी' }, { id: 'kn', label: 'ಕನ್ನಡ' }, { id: 'ta', label: 'தமிழ்' },
];

// YYYY-MM-DD for "now" in India, whatever the device timezone.
export function istDay(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
const dayNum = (d: string) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 86_400_000;
export const daysBetween = (a: string, b: string) => Math.round(dayNum(b) - dayNum(a));

export function festivalById(id: string): Festival {
  return FESTIVALS.find((f) => f.id === id) ?? ANYDAY;
}

// The festival happening today (inside its from..to window), if any. When windows overlap
// (Diwali's five days and Bhai Dooj), the one whose main day is today wins.
export function currentFestival(today = istDay()): Festival | null {
  const on = FESTIVALS.filter((f) => f.date && (f.from ?? f.date) <= today && today <= (f.to ?? f.date));
  return on.find((f) => f.date === today) ?? on.sort((a, b) => ((b.from ?? b.date!) < (a.from ?? a.date!) ? -1 : 1))[0] ?? null;
}

// Next festivals whose main day is today or later.
export function upcoming(today = istDay(), n = 4): Festival[] {
  return FESTIVALS.filter((f) => f.date && (f.to ?? f.date) >= today).slice(0, n);
}

// "Diwali in 11 days", "Diwali is tomorrow", "Happy Diwali!"
export function countdown(f: Festival, today = istDay()): { label: string; days: number; on: boolean } {
  const on = (f.from ?? f.date!) <= today && today <= (f.to ?? f.date!);
  const days = daysBetween(today, f.date!);
  if (on && days <= 0) return { label: `${f.greet.en}!`, days: 0, on };
  if (days === 1) return { label: `${f.name} is tomorrow`, days, on };
  return { label: days <= 0 ? `${f.greet.en}!` : `${f.name} in ${f.approx ? 'about ' : ''}${days} days`, days, on };
}

export function greetingText(f: Festival, l: Lang) {
  return f.greet[l] ?? f.greet.en;
}
export function messageText(m: number, l: Lang) {
  const msg = MESSAGES[m] ?? MESSAGES[0];
  return msg[l] ?? msg.en;
}

export function prettyDate(d: string) {
  return new Date(d + 'T12:00:00+05:30').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' });
}
