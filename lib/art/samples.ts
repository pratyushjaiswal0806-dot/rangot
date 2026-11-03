// Sample creations for the toy shelf. Each tile replays one of these, so a visitor sees what a
// toy does before opening it. Built from code (not stored), in the same recipe format a visitor's
// own drawing uses.
import { encodePts, type Recipe, type Stroke } from '../recipe';
import { diamondCells } from './kolam';
import { target } from '../pulli';
import { surprisePookalam } from './pookalam';
import { surpriseBandhani } from './bandhani';
import { edgeList, shapeDots, surpriseSikku } from './sikku';
import type { ToyId } from '../toys';
import { sampleShow, toInts } from './kathputli';
import { SAMPLE_ITEMS } from './warli';

// Points along t in [0,1], rounded to recipe units (±1000 of the half-side).
const curve = (n: number, f: (t: number) => [number, number]) =>
  Array.from({ length: n + 1 }, (_, i) => f(i / n)).flat().map((v) => Math.round(v));
const stroke = (c: string, s: number, n: number, pts: number[], b?: Stroke['b'], m?: 1): Stroke =>
  ({ c, s, n, p: encodePts(pts), ...(b ? { b } : {}), ...(m ? { m } : {}) });

// An 8-fold mandala. Strokes are drawn in one wedge along the +x axis; the renderer mirrors each
// across the axis and turns it 8 times.
export function sampleRangoli(): Recipe {
  const wedge = Math.PI / 8;
  const arc = (r: number, a0: number, a1: number, n = 10) => curve(n, (t) => [r * Math.cos(a0 + (a1 - a0) * t), r * Math.sin(a0 + (a1 - a0) * t)]);
  return {
    v: 1, type: 'rangoli', data: {
      strokes: [
        stroke('#FBF3E4', 7, 8, arc(110, 0, wedge, 6)),
        stroke('#FFC21A', 14, 8, curve(18, (t) => [150 + 520 * t, 150 * Math.sin(Math.PI * t)])),
        stroke('#C93A82', 11, 8, curve(14, (t) => [200 + 330 * t, 70 * Math.sin(Math.PI * t)])),
        stroke('#E8761E', 9, 8, arc(470, 0, wedge, 8)),
        stroke('#4F8A3C', 9, 8, curve(8, (t) => [700 + 160 * t, 0]), 'petal'),
        stroke('#E8761E', 9, 8, arc(780, 0.06, wedge - 0.02, 10), 'pookalam'),
        stroke('#FFC21A', 8, 8, [930, 0], 'diya'),
      ],
    },
  };
}

// A one-line sikku kolam on the diamond (a fixed seed that gives a pretty one).
export function sampleKolam(): Recipe {
  const k = surpriseSikku(3907);
  return { v: 1, type: 'kolam', data: { dots: k.dots, c: '#FBF3E4', d: true, m: edgeList(k.edges, k.dots) } };
}
export const samplePookalam = (): Recipe => ({ v: 1, type: 'pookalam', data: { l: 0, k: surprisePookalam(2026, 0) } });
export function sampleBandhani(): Recipe {
  const b = surpriseBandhani(1408);
  return { v: 1, type: 'bandhani', data: { z: b.z, r: b.rounds.map((r) => ({ c: r.c, p: encodePts(r.pts) })) } };
}

// The right palm sits at x 57–90 % of the square; m=1 mirrors it onto the left hand.
export function sampleMehendi(): Recipe {
  const H = '#6B2410';
  const ring = (cx: number, cy: number, r: number) => curve(24, (t) => [cx + r * Math.cos(t * Math.PI * 2), cy + r * Math.sin(t * Math.PI * 2)]);
  return {
    v: 1, type: 'mehendi', data: {
      strokes: [
        stroke(H, 10, 1, ring(470, 330, 125), undefined, 1),
        stroke(H, 18, 1, [470, 330], 'pookalam', 1),
        stroke(H, 10, 1, curve(16, (t) => [390 + 18 * Math.sin(t * 18), -40 - 560 * t]), undefined, 1),
        stroke(H, 10, 1, curve(10, (t) => [560, -60 - 480 * t]), 'petal', 1),
        stroke(H, 10, 1, curve(10, (t) => [225, -40 - 360 * t]), 'petal', 1),
        stroke(H, 10, 1, curve(16, (t) => [230 + 520 * t, 620 + 26 * Math.sin(t * 22)]), undefined, 1),
      ],
    },
  };
}

// A staggered grid of the three blocks in three inks, like the old courtyard card.
export function sampleBlock(): Recipe {
  const z = 217, step = Math.round(z * 1.12), inks = ['#B0246A', '#2D4C7C', '#2F6B3B'];
  const st = [];
  for (let i = 0, x = step / 2; x < 1000 + step; x += step, i++) {
    for (let j = 0, y = i % 2 ? step : step / 2; y < 750 + step; y += step, j++) {
      st.push({ x: Math.round(x), y: Math.round(y), t: (i + j) % 3, i: inks[(i + j * 2) % 3], z });
    }
  }
  return { v: 1, type: 'block', data: { a: 750, st } };
}

export const samplePoster = (): Recipe => ({ v: 1, type: 'poster', data: { w: 'MELA', t: 8, o: 6, p: 0 } });
export const samplePlate = (): Recipe => ({ v: 1, type: 'plate', data: { n: 'Rangotsav', f: 'sticker' } });
export const sampleNaam = (n = 'Rangotsav'): Recipe => ({ v: 1, type: 'naam', data: { n } });

// Today's Pulli: the woven line only, no dots, which is exactly the puzzle.
export const samplePulli = (day?: string): Recipe => ({ v: 1, type: 'kolam', data: { dots: target(day), c: '#FFC21A', d: false } });

// A light painting, mirrored eight ways: petals of gold, a ring of red, rays of blue-green and
// white sparks between them (n is turns, m mirrors each, see lib/art/phuljhadi.ts).
export function samplePhuljhadi(): Recipe {
  const polar = (r: number, a: number): [number, number] => [r * Math.cos(a), r * Math.sin(a)];
  return {
    v: 1, type: 'phuljhadi', data: {
      strokes: [
        // a gold petal leaning off its axis, so its mirror image makes a second petal
        stroke('#FFC94A', 12, 4, curve(30, (t) => polar(120 + 600 * Math.sin(Math.PI * t), 0.12 + 0.55 * t)), undefined, 1),
        stroke('#FF4B3E', 10, 4, curve(16, (t) => polar(300 + 60 * Math.sin(t * Math.PI), t * (Math.PI / 4))), undefined, 1),
        stroke('#C77DFF', 9, 4, curve(12, (t) => polar(760 + 70 * Math.sin(t * Math.PI * 2), t * (Math.PI / 4))), undefined, 1),
        stroke('#45D4FF', 9, 4, curve(5, (t) => polar(840 + 110 * t, Math.PI / 8)), undefined, 1),
        stroke('#FFF2D6', 8, 4, curve(1, (t) => polar(500 + t, 0)), undefined, 1),
      ],
    },
  };
}

// Anarkali dancing in front of the palace for six seconds.
export const sampleKathputli = (): Recipe => ({ v: 1, type: 'kathputli', data: { p: 1, b: 0, t: encodePts(toInts(sampleShow(6))) } });

// Two dozen dancers round the tarpa player, in a village of huts, trees and animals.
export const sampleWarli = (): Recipe => ({ v: 1, type: 'warli', data: { d: 24, i: encodePts(SAMPLE_ITEMS.flat()), s: 10 } });

// A two-tone fighter kite with an eye and a long tail, that has cut two kites today.
export const samplePatang = (): Recipe => ({ v: 1, type: 'patang', data: { a: 1, b: 0, p: 3, t: 2, k: 2 } });

// The sample a toy shows off with (shelf tiles, the story's "next toy" card), or null for the
// selfie booth, which draws its own preview (components/toys/SelfiePreview.tsx).
export function sampleFor(id: ToyId, name = 'Rangotsav', day?: string): Recipe | null {
  switch (id) {
    case 'rangoli': return sampleRangoli();
    case 'phuljhadi': return samplePhuljhadi();
    case 'kathputli': return sampleKathputli();
    case 'warli': return sampleWarli();
    case 'patang': return samplePatang();
    case 'kolam': return sampleKolam();
    case 'pookalam': return samplePookalam();
    case 'bandhani': return sampleBandhani();
    case 'block': return sampleBlock();
    case 'poster': return samplePoster();
    case 'truck': return samplePlate();
    case 'naam': return sampleNaam(name);
    case 'pulli': return samplePulli(day);
    default: return null;
  }
}

