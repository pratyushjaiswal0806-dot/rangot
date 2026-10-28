import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { kolamPathD } from '../lib/art/kolam';
import { naamKolam } from '../lib/art/naam';

export const alt = 'Rangotsav: weave your name into a kolam, draw rangoli, send festival greetings';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const font = (f: string) => readFile(join(process.cwd(), 'assets/fonts', f));

export default async function Image() {
  const [yatra, sarpanch, mukta] = await Promise.all([font('YatraOne-Regular.ttf'), font('Sarpanch-Black.ttf'), font('Mukta-ExtraBold.ttf')]);
  const n = naamKolam('Rangotsav'), S = 520;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><path d="${kolamPathD(n.dots, S, n.g)}" fill="none" stroke="#FFC21A" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>${n.dots.map(([i, j]) => `<circle cx="${((i + 0.5) * S) / n.g}" cy="${((j + 0.5) * S) / n.g}" r="6" fill="#FBF3E4"/>`).join('')}</svg>`;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', background: '#7A0E3A', padding: 15 }}>
        <div style={{ display: 'flex', flex: 1, height: '100%', alignItems: 'center', border: '6px solid #FFC21A', padding: '0 30px 0 50px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 14 }}>
            <div style={{ display: 'flex', fontFamily: 'Yatra One', fontSize: 120, color: '#FFC21A', textShadow: '5px 5px 0 #CC3B22, 9px 9px 0 #1B1410' }}>Rangotsav</div>
            <div style={{ display: 'flex', fontFamily: 'Mukta', fontSize: 38, color: '#FBF3E4', lineHeight: 1.25 }}>What does your name look like as a kolam?</div>
            <div style={{ display: 'flex', fontFamily: 'Sarpanch', fontSize: 24, letterSpacing: 3, color: '#FFC21A', marginTop: 10 }}>RANGOLI · KOLAM · MEHENDI · TRUCK ART · DIYAS</div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`} width={460} height={460} />
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'Yatra One', data: yatra, weight: 400 }, { name: 'Sarpanch', data: sarpanch, weight: 900 }, { name: 'Mukta', data: mukta, weight: 800 }] },
  );
}
