// Server-only Upstash Redis access. Without UPSTASH_REDIS_REST_URL / _TOKEN every helper reports
// "no store" and callers answer 503, so the site still works locally without share links.
import { cache } from 'react';
import { Redis } from '@upstash/redis';
import { ID_RE, validateRecipe, type Recipe } from './recipe';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
export const redis = url && token ? new Redis({ url, token }) : null;

// Per-IP fixed-window limit (INCR + EXPIRE), shared by every server instance and portable to any
// Redis. Fails open: a limiter hiccup should never take share links down.
export async function limited(req: Request, name: string, perMinute: number): Promise<boolean> {
  if (!redis) return false;
  const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim().slice(0, 64);
  const key = `rangotsav:rl:${name}:${ip}:${Math.floor(Date.now() / 60_000)}`;
  try {
    const n = await redis.incr(key);
    if (n === 1) await redis.expire(key, 70);
    return n > perMinute;
  } catch (e) {
    console.error('ratelimit unavailable:', e instanceof Error ? e.message : e);
    return false;
  }
}

export const noStore = { 'Cache-Control': 'no-store' };
export const ONE_YEAR = 60 * 60 * 24 * 365;
export const creationKey = (id: string) => `rangotsav:cre:${id}`;

// Deduped per request, so generateMetadata, the page and the OG image share one fetch.
export const getCreation = cache(async (id: string): Promise<Recipe | null> => {
  if (!redis || !ID_RE.test(id)) return null;
  try {
    // @upstash/redis parses JSON values; re-validate anyway in case the stored shape is old.
    return validateRecipe(await redis.get(creationKey(id)));
  } catch {
    return null;
  }
});
