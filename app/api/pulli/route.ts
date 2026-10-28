import { NextResponse } from 'next/server';
import { limited, noStore, redis } from '../../../lib/store';
import { daysBetween, istDay } from '../../../lib/festivals';

// Today's global Pulli stats: how many played, how many solved, and in how many tries.
const k = (day: string) => `rangotsav:pulli:${day}`;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  const day = new URL(req.url).searchParams.get('day') ?? istDay();
  if (!redis || !DAY.test(day)) return NextResponse.json({ error: 'unavailable' }, { status: 503, headers: noStore });
  try {
    const h = (await redis.hgetall<Record<string, number>>(k(day))) ?? {};
    const dist = Array.from({ length: 6 }, (_, i) => Number(h[String(i + 1)] ?? 0));
    return NextResponse.json({ played: Number(h.played ?? 0), solved: dist.reduce((a, b) => a + b, 0), dist }, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=30' } });
  } catch {
    return NextResponse.json({ error: 'store unavailable' }, { status: 502, headers: noStore });
  }
}

// { day, tries } where tries is 1..6, or 0 for "didn't get it"
export async function POST(req: Request) {
  if (!redis) return NextResponse.json({ error: 'unavailable' }, { status: 503, headers: noStore });
  const b = await req.json().catch(() => null);
  const today = istDay();
  // only today's (or, around midnight, yesterday's) puzzle counts
  if (!b || !DAY.test(b.day) || ![0, 1].includes(daysBetween(b.day, today)) || !Number.isInteger(b.tries) || b.tries < 0 || b.tries > 6) {
    return NextResponse.json({ error: 'bad result' }, { status: 400, headers: noStore });
  }
  try {
    if (await limited(req, 'pulli', 5)) return NextResponse.json({ error: 'slow down' }, { status: 429, headers: noStore });
    await redis.hincrby(k(b.day), 'played', 1);
    if (b.tries) await redis.hincrby(k(b.day), String(b.tries), 1);
    await redis.expire(k(b.day), 60 * 60 * 24 * 30);
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: 'store unavailable' }, { status: 502, headers: noStore });
  }
}
