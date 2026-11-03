import { headers } from 'next/headers';

// The public origin, for absolute URLs in metadata (OG and Twitter images). NEXT_PUBLIC_SITE_URL is read at
// build time, so set it before `next build` on any host other than Vercel (which sets VERCEL_PROJECT_PRODUCTION_URL).
const CONFIGURED = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);
export const SITE_URL = CONFIGURED ?? 'http://localhost:3000';

if (process.env.NODE_ENV === 'production' && !CONFIGURED) {
  console.warn('[rangotsav] NEXT_PUBLIC_SITE_URL is not set, so og:image and twitter:image point at http://localhost:3000. Set it before `next build`.');
}

// The origin a request came in on, for files that must name the site (robots.txt, sitemap.xml). The configured
// URL wins; without one, the request's own host is used, so these stay correct on any hosting.
export async function requestOrigin(): Promise<string> {
  if (CONFIGURED) return SITE_URL;
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (!host) return SITE_URL;
  const proto = h.get('x-forwarded-proto') ?? (/^(localhost|127\.)/.test(host) ? 'http' : 'https');
  return `${proto}://${host}`;
}
