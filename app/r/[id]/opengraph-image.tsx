import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getCreation } from '../../../lib/store';
import { LABEL, type Recipe } from '../../../lib/recipe';
import { rangoliSvg } from '../../../lib/art/rangoli';
import { kolamPathD } from '../../../lib/art/kolam';
import { naamKolam, naamReading } from '../../../lib/art/naam';
import { festivalById } from '../../../lib/festivals';
import { PALS } from '../../../lib/art/palette';

export const alt = 'A creation from Rangotsav';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const C = { ivory: '#FBF3E4', marigold: '#FFC21A', ruby: '#7A0E3A', ink: '#1B1410', vermilion: '#CC3B22', saffron: '#E8761E', green: '#2F6B3B', floor: '#3B2117', indigo: '#2D4C7C' };
const font = (f: string) => readFile(join(process.cwd(), 'assets/fonts', f));

function kolamSvg(dots: [number, number][], g: number, line: string, bg: string, S = 600) {
  const s = S / g;
  const grid = Array.from({ length: g * g }, (_, k) => `<circle cx="${((k % g) + 0.5) * s}" cy="${(Math.floor(k / g) + 0.5) * s}" r="2.4" fill="rgba(251,243,228,.2)"/>`).join('');
  const pulli = dots.map(([i, j]) => `<circle cx="${(i + 0.5) * s}" cy="${(j + 0.5) * s}" r="${Math.max(4, s * 0.065)}" fill="${C.ivory}"/>`).join('');
  const d = dots.length > 1 ? kolamPathD(dots, S, g) : '';
  const one = dots.length === 1 ? `<circle cx="${(dots[0][0] + 0.5) * s}" cy="${(dots[0][1] + 0.5) * s}" r="${s * 0.42}" fill="none" stroke="${line}" stroke-width="${Math.max(4, s * 0.07)}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><rect width="${S}" height="${S}" fill="${bg}"/>${grid}${one}<path d="${d}" fill="none" stroke="${line}" stroke-width="${Math.max(4, s * 0.07)}" stroke-linecap="round" stroke-linejoin="round"/>${pulli}</svg>`;
}
const uri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

function art(r: Recipe): string | null {
  if (r.type === 'rangoli') return uri(rangoliSvg(r.data.strokes, 600));
  if (r.type === 'kolam') return uri(kolamSvg(r.data.dots, 7, r.data.c, C.floor));
  if (r.type === 'naam') { const n = naamKolam(r.data.n); return uri(kolamSvg(n.dots, n.g, n.color.line, n.color.bg)); }
  if (r.type === 'greeting' && r.data.art) return art(r.data.art);
  if (r.type === 'greeting') { const n = naamKolam(r.by || r.data.to || 'Rangotsav'); return uri(kolamSvg(n.dots, n.g, n.color.line, n.color.bg)); }
  return null;
}

function words(r: Recipe) {
  const by = r.by;
  if (r.type === 'greeting') {
    const f = festivalById(r.data.f);
    return { kicker: r.data.to ? `For ${r.data.to}` : 'A greeting for you', title: f.greet.en, sub: by ? `From ${by}` : 'Tap to open', bg: C.ink, fg: f.accent };
  }
  if (r.type === 'naam') {
    const rd = naamReading(naamKolam(r.data.n));
    return { kicker: `${rd.stats} · ${rd.title}`, title: r.data.n, sub: 'What does your name look like?', bg: C.ruby, fg: C.marigold };
  }
  return { kicker: 'Made at Rangotsav', title: by ? `${by}'s ${LABEL[r.type]}` : `A ${LABEL[r.type]}`, sub: 'Watch it replay, then make yours', bg: C.ruby, fg: C.marigold };
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const r = await getCreation((await params).id);
  const [yatra, sarpanch, mukta] = await Promise.all([font('YatraOne-Regular.ttf'), font('Sarpanch-Black.ttf'), font('Mukta-ExtraBold.ttf')]);
  const fonts = [
    { name: 'Yatra One', data: yatra, weight: 400 as const },
    { name: 'Sarpanch', data: sarpanch, weight: 900 as const },
    { name: 'Mukta', data: mukta, weight: 800 as const },
  ];
  if (!r) {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.ruby, color: C.marigold, fontFamily: 'Yatra One', fontSize: 140 }}>Rangotsav</div>,
      { ...size, fonts },
    );
  }
  const w = words(r);
  const img = art(r);
  // Plates and posters are lettering, so the "art" is the lettering itself.
  const lettering = r.type === 'plate' || r.type === 'poster'
    ? (() => {
        const pal = r.type === 'poster' ? PALS[r.data.p] ?? PALS[0] : null;
        const text = r.type === 'poster' ? r.data.w : r.data.n;
        return (
          <div style={{ width: 600, height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', background: pal ? pal.bg : C.ivory, border: `14px solid ${pal ? C.marigold : C.green}`, padding: 30 }}>
            <div style={{ display: 'flex', textAlign: 'center', fontFamily: pal ? 'Sarpanch' : 'Yatra One', fontSize: Math.round(Math.min(170, (pal ? 600 : 760) / Math.max(3, text.length))), lineHeight: 1.05, flexWrap: "wrap", justifyContent: "center", color: pal ? pal.fg : C.vermilion, textShadow: pal ? `8px 7px 0 ${pal.mis}, 12px 11px 0 ${C.ink}` : `5px 5px 0 #4A0A26` }}>{text}</div>
          </div>
        );
      })()
    : null;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: w.bg, padding: 15 }}>
        <div style={{ display: 'flex', flex: 1, border: `6px solid ${w.fg}`, alignItems: 'center' }}>
          <div style={{ display: 'flex', width: 600, height: 600, flex: 'none', borderRight: `6px solid ${w.fg}` }}>
            {img
              // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
              ? <img src={img} width={594} height={594} style={{ width: 594, height: 594 }} />
              : lettering ?? <div style={{ display: 'flex', width: 594, height: 594, background: C.indigo }} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '0 44px', gap: 18 }}>
            <div style={{ display: 'flex', fontFamily: 'Sarpanch', fontSize: 26, letterSpacing: 3, color: C.ivory, textTransform: 'uppercase' }}>{w.kicker}</div>
            <div style={{ display: 'flex', fontFamily: 'Yatra One', fontSize: w.title.length > 18 ? 58 : 76, lineHeight: 1.05, color: w.fg }}>{w.title}</div>
            <div style={{ display: 'flex', fontFamily: 'Mukta', fontSize: 30, color: C.ivory }}>{w.sub}</div>
            <div style={{ display: 'flex', marginTop: 16, alignSelf: 'flex-start', padding: '10px 22px', background: w.fg, color: C.ink, fontFamily: 'Sarpanch', fontSize: 26, letterSpacing: 2 }}>RANGOTSAV</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
