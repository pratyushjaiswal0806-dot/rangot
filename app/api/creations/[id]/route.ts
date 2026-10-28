import { NextResponse } from 'next/server';
import { getCreation, noStore, redis } from '../../../../lib/store';

// The recipe behind a share link, for "Remix this" on the home page.
export async function GET(_req: Request, ctx: RouteContext<'/api/creations/[id]'>) {
  if (!redis) return NextResponse.json({ error: 'share links are not configured' }, { status: 503, headers: noStore });
  const recipe = await getCreation((await ctx.params).id);
  if (!recipe) return NextResponse.json({ error: 'not found' }, { status: 404, headers: noStore });
  return NextResponse.json(recipe, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
