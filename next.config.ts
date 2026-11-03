import type { NextConfig } from 'next';
import { LEGACY_TOOLS } from './lib/toys';

// Links from the old one-page site (/?tool=kolam, /?remix=<id>, /?naam=Ananya) land on the
// toy's own page. The query string is passed through by Next.js.
const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...Object.entries(LEGACY_TOOLS).map(([tool, destination]) => ({ source: '/', has: [{ type: 'query' as const, key: 'tool', value: tool }], destination, permanent: false })),
      { source: '/', has: [{ type: 'query', key: 'remix', value: '(?<id>[0-9A-Za-z]{8})' }], destination: '/remix/:id', permanent: false },
      { source: '/', has: [{ type: 'query', key: 'naam' }], destination: '/naam', permanent: false },
    ];
  },
};

export default nextConfig;
