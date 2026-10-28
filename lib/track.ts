// Custom analytics events (Vercel Web Analytics). Measures the share loop: how many shares,
// how many link opens and remixes they bring back. Never throws.
import { track as vaTrack } from '@vercel/analytics';

export type Event = 'tool_open' | 'share' | 'link_open' | 'remix' | 'make_own' | 'greeting_sent' | 'diya_back' | 'naam_made' | 'pulli_solved' | 'reel_saved';

export function track(name: Event, props?: Record<string, string | number | boolean>) {
  try { vaTrack(name, props); } catch {}
}
