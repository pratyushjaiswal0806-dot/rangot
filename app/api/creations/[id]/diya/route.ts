import { NextResponse } from 'next/server';
import { ID_RE } from '../../../../../lib/recipe';
import { creationKey, getCreation, limited, noStore, ONE_YEAR, redis } from '../../../../../lib/store';

// "Light a diya back": a counter per share link, so the sender can come back and see who lit one.
const key = (id: string) => creationKey(id) + ':diyas';

export async function GET(_req: Request, ctx: RouteContext<'/api/creations/[id]/diya'>) {
  const { id } = await ctx.params;
  if (!redis || !ID_RE.test(id)) return NextResponse.json({ error: 'unavailable' }, { status: 503, headers: noStore });
  try {
    return NextResponse.json({ count: Number((await redis.get<number>(key(id))) ?? 0) }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: 'store unavailable' }, { status: 502, headers: noStore });
  }
}

export async function POST(req: Request, ctx: RouteContext<'/api/creations/[id]/diya'>) {
  const { id } = await ctx.params;
  if (!redis || !ID_RE.test(id)) return NextResponse.json({ error: 'unavailable' }, { status: 503, headers: noStore });
  try {
    if (await limited(req, 'diya-back', 10)) return NextResponse.json({ error: 'slow down' }, { status: 429, headers: noStore });
    if (!(await getCreation(id))) return NextResponse.json({ error: 'not found' }, { status: 404, headers: noStore });
    const count = await redis.incr(key(id));
    if (count === 1) await redis.expire(key(id), ONE_YEAR);
    return NextResponse.json({ count }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: 'store unavailable' }, { status: 502, headers: noStore });
  }
}
