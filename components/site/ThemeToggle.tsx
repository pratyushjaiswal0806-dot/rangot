'use client';
// Night mode: auto (Diwali and evenings), always on, or always off.
import { useEffect, useState } from 'react';
import { applyTheme, themePref, type ThemePref } from '../../lib/theme';

const NEXT: Record<ThemePref, ThemePref> = { auto: 'night', night: 'day', day: 'auto' };
const LABEL: Record<ThemePref, string> = { auto: 'Night sky: auto', night: 'Night sky: on', day: 'Night sky: off' };

export default function ThemeToggle({ className }: { className?: string }) {
  const [p, setP] = useState<ThemePref>('auto');
  useEffect(() => setP(themePref()), []);
  return (
    <button type="button" className={className} onClick={() => { const n = NEXT[p]; setP(n); applyTheme(n); }} title="Auto turns the night sky on for Diwali and every evening">
      🌙 {LABEL[p]}
    </button>
  );
}
