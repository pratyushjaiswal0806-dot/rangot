import { NextResponse } from 'next/server';
import { ID_RE } from '../../../../lib/recipe';
import { limited, noStore, redis, WALL_HIDDEN, wallReports } from '../../../../lib/store';

// POST {id} → report a wall tile. Three reports hide it until an admin looks.
export async function POST(req: Request) {
  if (!redis) return NextResponse.json({ error: 'wall not configured' }, { status: 503, headers: noStore });
  const body = await req.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id : '';
  if (!ID_RE.test(id)) return NextResponse.json({ error: 'bad id' }, { status: 400, headers: noStore });
  try {
    if (await limited(req, 'report', 6)) return NextResponse.json({ error: 'slow down' }, { status: 429, headers: noStore });
    const n = await redis.incr(wallReports(id));
    if (n === 1) await redis.expire(wallReports(id), 60 * 60 * 24 * 30);
    if (n >= 3) await redis.sadd(WALL_HIDDEN, id);
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: 'store unavailable' }, { status: 502, headers: noStore });
  }
}
