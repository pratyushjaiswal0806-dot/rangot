import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { mkRng } from '../../../lib/rng';

export const alt = 'A diya lit in the Rangotsav night sky';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const font = (f: string) => readFile(join(process.cwd(), 'assets/fonts', f));

export default async function Image({ params }: { params: Promise<{ n: string }> }) {
  const n = Math.max(1, parseInt((await params).n, 10) || 1);
  const [yatra, sarpanch, mukta] = await Promise.all([font('YatraOne-Regular.ttf'), font('Sarpanch-Black.ttf'), font('Mukta-ExtraBold.ttf')]);
  const r = mkRng(n);
  const stars = Array.from({ length: 140 }, () => ({ x: r() * 1200, y: r() ** 1.3 * 470, s: 3 + r() * 7, o: 0.4 + r() * 0.6 }));
  const city = Array.from({ length: 34 }, (_, i) => ({ x: i * 36, h: 30 + r() * 70 }));
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: 'linear-gradient(180deg, #160A24 0%, #2A0B2E 40%, #7A0E3A 100%)' }}>
        {stars.map((s, i) => <div key={i} style={{ position: 'absolute', left: s.x, top: s.y, width: s.s, height: s.s, borderRadius: 99, background: '#FFC21A', opacity: s.o, boxShadow: '0 0 12px #FFC21A' }} />)}
        {city.map((c, i) => <div key={'c' + i} style={{ position: 'absolute', left: c.x, bottom: 0, width: 34, height: c.h, background: '#1B0812' }} />)}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontFamily: 'Sarpanch', fontSize: 30, letterSpacing: 4, color: '#FFC21A' }}>RANGOTSAV · NIGHT SKY</div>
          <div style={{ display: 'flex', fontFamily: 'Yatra One', fontSize: 150, color: '#FFC21A', textShadow: '6px 6px 0 #1B1410' }}>Diya #{n.toLocaleString('en-IN')}</div>
          <div style={{ display: 'flex', fontFamily: 'Mukta', fontSize: 40, color: '#FBF3E4' }}>is lit. Light yours, it floats up to join them.</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'Yatra One', data: yatra, weight: 400 }, { name: 'Sarpanch', data: sarpanch, weight: 900 }, { name: 'Mukta', data: mukta, weight: 800 }] },
  );
}
