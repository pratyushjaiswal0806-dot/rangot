import { NextResponse } from 'next/server';
import { MAX_BYTES, recipeId, validateRecipe } from '../../../lib/recipe';
import { creationKey, limited, noStore, ONE_YEAR, redis } from '../../../lib/store';

// POST a recipe, get back a short id for /r/<id>. Ids are content hashes, so sharing the same
// creation twice returns the same link without writing a second row.
export async function POST(req: Request) {
  if (!redis) return NextResponse.json({ error: 'share links are not configured' }, { status: 503, headers: noStore });
  const raw = await req.text().catch(() => '');
  if (raw.length > MAX_BYTES) return NextResponse.json({ error: 'too big' }, { status: 413, headers: noStore });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { body = null; }
  const recipe = validateRecipe(body);
  if (!recipe) return NextResponse.json({ error: 'bad recipe' }, { status: 400, headers: noStore });
  try {
    if (await limited(req, 'create', 12)) return NextResponse.json({ error: 'slow down' }, { status: 429, headers: noStore });
    const id = await recipeId(recipe);
    await redis.set(creationKey(id), recipe, { ex: ONE_YEAR, nx: true });
    return NextResponse.json({ id }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: 'store unavailable' }, { status: 502, headers: noStore });
  }
}
