import type { MetadataRoute } from 'next';
import { requestOrigin } from '../lib/site';
import { TOYS } from '../lib/toys';

// The home page, the about page, the glossary, Pulli and every toy. Shared creations and sky pages are left out:
// they are personal, and their pages are generated per link.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await requestOrigin();
  const paths = [...new Set(['/', '/about', '/words', ...TOYS.map((t) => t.href)])];
  return paths.map((p) => ({ url: origin + (p === '/' ? '' : p), changeFrequency: 'monthly', priority: p === '/' ? 1 : 0.7 }));
}
