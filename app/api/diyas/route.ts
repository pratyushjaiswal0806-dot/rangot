import { NextResponse } from 'next/server';

// Shared diya counter. Backed by Upstash Redis (REST) via UPSTASH_REDIS_REST_URL / _TOKEN.
// Without a store it answers 503 and the client falls back to its local-only counter.
const KEY = 'rangotsav:diyas';
const BASE = 428; // the prototype's starting count, so the number never jumps backwards
const LIMIT = 30; // POSTs per IP per minute (best effort, per server instance)

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const hits = new Map<string, number[]>();

async function redis(path: string): Promise<number> {
  const r = await fetch(`${url}/${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  const { result } = await r.json();
  return Number(result ?? 0);
}

const noStore = { 'Cache-Control': 'no-store' };

export async function GET() {
  if (!url || !token) return NextResponse.json({ error: 'counter store not configured' }, { status: 503, headers: noStore });
  try {
    return NextResponse.json({ count: BASE + (await redis(`get/${KEY}`)) }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: 'store unavailable' }, { status: 502, headers: noStore });
  }
}

export async function POST(req: Request) {
  if (!url || !token) return NextResponse.json({ error: 'counter store not configured' }, { status: 503, headers: noStore });
  const body = await req.json().catch(() => null);
  if (!body || body.delta !== 1) return NextResponse.json({ error: 'delta must be 1' }, { status: 400, headers: noStore });

  const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= LIMIT) return NextResponse.json({ error: 'slow down' }, { status: 429, headers: noStore });
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();

  try {
    return NextResponse.json({ count: BASE + (await redis(`incr/${KEY}`)) }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: 'store unavailable' }, { status: 502, headers: noStore });
  }
}
