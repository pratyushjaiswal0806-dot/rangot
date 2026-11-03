// Mandala geometry, in a 200×200 box centred on 0,0: the line work, the filled inner petals and
// the dot rings. Drawn as SVG by components/site/Mandala.tsx and on canvas by the truck-art plates.
type P = [number, number];
const pt = (r: number, a: number): string => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
const TAU = Math.PI * 2;

// one petal from radius r0 out to a tip at r1, w radians wide at its base
function petal(a: number, r0: number, r1: number, w: number, belly = 1.25) {
  const m = r0 + (r1 - r0) * 0.55;
  return `M${pt(r0, a - w)}C${pt(m, a - w * belly)} ${pt(r1 - (r1 - r0) * 0.12, a - w * 0.35)} ${pt(r1, a)}C${pt(r1 - (r1 - r0) * 0.12, a + w * 0.35)} ${pt(m, a + w * belly)} ${pt(r0, a + w)}`;
}
const ring = (n: number, off: number, f: (a: number) => string) => Array.from({ length: n }, (_, i) => f(off + (i / n) * TAU)).join('');
const scallops = (n: number, r0: number, r1: number) =>
  ring(n, 0, (a) => { const h = TAU / n / 2; return `M${pt(r0, a - h)}Q${pt(r1 * 1.04, a)} ${pt(r0, a + h)}`; });
const circle = (r: number) => `M${r} 0A${r} ${r} 0 1 1 ${-r} 0A${r} ${r} 0 1 1 ${r} 0Z`;
const dots = (n: number, r: number, off = 0): P[] => Array.from({ length: n }, (_, i) => { const a = off + (i / n) * TAU; return [r * Math.cos(a), r * Math.sin(a)]; });

export const LINES = [
  circle(6), circle(24), circle(50), circle(56), circle(83), circle(89), circle(97),
  ring(8, 0, (a) => petal(a, 6, 22, 0.32)), ring(8, 0, (a) => petal(a, 6, 15, 0.16)),
  ring(8, Math.PI / 8, (a) => petal(a, 8, 19, 0.22)),
  ring(16, 0, (a) => petal(a, 24, 48, 0.17)), ring(16, 0, (a) => petal(a, 24, 40, 0.09)),
  scallops(32, 50, 55),
  ring(24, 0, (a) => petal(a, 56, 81, 0.12, 1.4)), ring(24, 0, (a) => petal(a, 56, 72, 0.06)),
  ring(24, Math.PI / 24, (a) => petal(a, 56, 66, 0.05)),
  scallops(48, 83, 88.5),
  ring(64, 0, (a) => `M${pt(89, a)}L${pt(97, a)}`),
].join('');
export const SOLID = [ring(8, 0, (a) => petal(a, 6, 15, 0.16)), ring(16, 0, (a) => petal(a, 24, 40, 0.09)), ring(24, 0, (a) => petal(a, 56, 72, 0.06))].join('');
export const DOTS = [...dots(16, 26.5, TAU / 32), ...dots(24, 78, TAU / 48), ...dots(64, 93, TAU / 128)];

