import type { MetadataRoute } from 'next';
import { requestOrigin } from '../lib/site';

// Everything is public except the API. Personal creations (/r/, /remix/) stay out of search through
// their own noindex tag, so they are not blocked here.
export default async function robots(): Promise<MetadataRoute.Robots> {
  return { rules: { userAgent: '*', allow: '/', disallow: '/api/' }, sitemap: `${await requestOrigin()}/sitemap.xml` };
}
