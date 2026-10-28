import { NextResponse } from 'next/server';
import { limited, noStore, redis } from '../../../lib/store';

// Shared diya counter. Backed by Upstash Redis via UPSTASH_REDIS_REST_URL / _TOKEN.
// Without a store it answers 503 and the client falls back to its local-only counter.
const KEY = 'rangotsav:diyas';
const BASE = 428; // the prototype's starting count, so the number never jumps backwards

export async function GET() {
  if (!redis) return NextResponse.json({ error: 'counter store not configured' }, { status: 503, headers: noStore });
  try {
    return NextResponse.json({ count: BASE + Number((await redis.get<number>(KEY)) ?? 0) }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: 'store unavailable' }, { status: 502, headers: noStore });
  }
}

export async function POST(req: Request) {
  if (!redis) return NextResponse.json({ error: 'counter store not configured' }, { status: 503, headers: noStore });
  const body = await req.json().catch(() => null);
  if (!body || body.delta !== 1) return NextResponse.json({ error: 'delta must be 1' }, { status: 400, headers: noStore });
  try {
    if (await limited(req, 'diya', 30)) return NextResponse.json({ error: 'slow down' }, { status: 429, headers: noStore });
    return NextResponse.json({ count: BASE + (await redis.incr(KEY)) }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: 'store unavailable' }, { status: 502, headers: noStore });
  }
}
