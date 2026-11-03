import { NextResponse } from 'next/server';
import { ID_RE, validateRecipe } from '../../../lib/recipe';
import { creationKey, getCreation, limited, noStore, onWall, redis, WALL, WALL_HIDDEN, WALL_MAX, wallDay } from '../../../lib/store';
import { istDay } from '../../../lib/festivals';

const PAGE = 24;

// GET /api/wall?offset=0 → the newest picture-only creations (makers' names stripped) and
// today's counts per type. Cached briefly at the edge so a busy wall doesn't hammer Redis.
export async function GET(req: Request) {
  if (!redis) return NextResponse.json({ error: 'wall not configured' }, { status: 503, headers: noStore });
  const off = Math.max(0, Math.min(WALL_MAX - PAGE, parseInt(new URL(req.url).searchParams.get('offset') || '0', 10) || 0));
  try {
    const [ids, hidden, today] = await Promise.all([
      redis.lrange<string>(WALL, off, off + PAGE - 1),
      redis.smembers(WALL_HIDDEN),
      redis.hgetall<Record<string, number>>(wallDay(istDay())),
    ]);
    const hide = new Set(hidden.map(String));
    const live = ids.map(String).filter((id) => ID_RE.test(id) && !hide.has(id));
    const recs = live.length ? await redis.mget<unknown[]>(...live.map(creationKey)) : [];
    const items = live
      .map((id, i) => ({ id, recipe: validateRecipe(recs[i]) }))
      .flatMap(({ id, recipe }) => (recipe && onWall(recipe.type) ? [{ id, recipe: { ...recipe, by: undefined } }] : []));
    return NextResponse.json({ items, today: today ?? {}, more: ids.length === PAGE }, { headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60' } });
  } catch {
    return NextResponse.json({ error: 'store unavailable' }, { status: 502, headers: noStore });
  }
}

// POST {id} → put a shared creation on the wall (moves it to the top if it's already there).
export async function POST(req: Request) {
  if (!redis) return NextResponse.json({ error: 'wall not configured' }, { status: 503, headers: noStore });
  const body = await req.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id : '';
  if (!ID_RE.test(id)) return NextResponse.json({ error: 'bad id' }, { status: 400, headers: noStore });
  try {
    if (await limited(req, 'wall', 10)) return NextResponse.json({ error: 'slow down' }, { status: 429, headers: noStore });
    const r = await getCreation(id);
    if (!r || !onWall(r.type)) return NextResponse.json({ error: 'not a wall creation' }, { status: 400, headers: noStore });
    if (await redis.sismember(WALL_HIDDEN, id)) return NextResponse.json({ ok: true }, { headers: noStore });
    const day = wallDay(istDay());
    await redis.lrem(WALL, 0, id);
    await redis.lpush(WALL, id);
    await redis.ltrim(WALL, 0, WALL_MAX - 1);
    await redis.hincrby(day, r.type, 1);
    await redis.expire(day, 60 * 60 * 24 * 3);
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: 'store unavailable' }, { status: 502, headers: noStore });
  }
}

// DELETE ?id=… with "Authorization: Bearer $WALL_ADMIN_TOKEN" → take it down for good.
export async function DELETE(req: Request) {
  const token = process.env.WALL_ADMIN_TOKEN;
  if (!redis || !token || req.headers.get('authorization') !== `Bearer ${token}`) return NextResponse.json({ error: 'not allowed' }, { status: 403, headers: noStore });
  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!ID_RE.test(id)) return NextResponse.json({ error: 'bad id' }, { status: 400, headers: noStore });
  await redis.sadd(WALL_HIDDEN, id);
  await redis.lrem(WALL, 0, id);
  return NextResponse.json({ ok: true }, { headers: noStore });
}
