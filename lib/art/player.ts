// Replays a recipe onto its own canvas. seek(t) with t in [0,1] shows the creation that far
// along; the share page, the reel recorder and "Remix" all drive the same player.
import { C, PALS } from './palette';
import { decodeStrokes, rangoliFloor, strokeReplayer } from './rangoli';
import { drawKolam, kolamSegs } from './kolam';
import { blockPress, paintFabric } from './block';
import { drawPoster } from './poster';
import { drawPlate } from './plate';
import { naamKolam } from './naam';
import { mehendiBase } from './mehendi';
import type { Recipe } from '../recipe';

export type Player = { canvas: HTMLCanvasElement; duration: number; seek: (t: number) => void };

export function createPlayer(r: Recipe, px = 1080, canvas = document.createElement('canvas')): Player {
  const cv = canvas;
  const sq = () => { cv.width = cv.height = px; return cv.getContext('2d')!; };
  switch (r.type) {
    case 'rangoli':
    case 'mehendi': {
      const x = sq();
      const ds = decodeStrokes(r.data.strokes);
      const bg = () => (r.type === 'rangoli' ? rangoliFloor(x, px) : mehendiBase(x, px));
      let rp = strokeReplayer(x, px, ds), done = -1;
      return {
        canvas: cv,
        duration: Math.min(7000, Math.max(2500, rp.total * 4)),
        seek(t) {
          const to = Math.round(rp.total * Math.min(1, t));
          if (to < done || done < 0) { bg(); rp = strokeReplayer(x, px, ds); done = 0; }
          rp.advance(to); done = to;
        },
      };
    }
    case 'kolam':
    case 'naam': {
      const x = sq();
      const naam = r.type === 'naam' ? naamKolam(r.data.n) : null;
      const k = r.type === 'kolam' ? r.data : null;
      const g = naam ? naam.g : 7, dots = naam ? naam.dots : k!.dots;
      const segs = kolamSegs(dots, px, g);
      const col = naam ? naam.color.line : k!.c;
      const showDots = k ? k.d : true;
      return {
        canvas: cv,
        duration: Math.min(4200, 1400 + segs.length * 14),
        seek: (t) => drawKolam(x, px, g, dots, segs, col, showDots, 1 - (1 - Math.min(1, t)) ** 2, naam ? naam.color.bg : C.floor),
      };
    }
    case 'block': {
      cv.width = px; cv.height = Math.round((px * r.data.a) / 1000);
      const x = cv.getContext('2d')!, cache = {};
      let done = -1;
      return {
        canvas: cv,
        duration: Math.min(6000, Math.max(1800, r.data.st.length * 140)),
        seek(t) {
          const to = Math.round(r.data.st.length * Math.min(1, t));
          if (to < done || done < 0) { paintFabric(x, cv.width, cv.height); done = 0; }
          for (; done < to; done++) blockPress(x, cv.width, cv.height, r.data.st[done], cache);
        },
      };
    }
    case 'poster':
    case 'plate': {
      let drawn = false;
      const draw = () => {
        if (r.type === 'poster') drawPoster(cv, r.data.w, r.data.t, r.data.o, PALS[r.data.p] ?? PALS[0]);
        else drawPlate(cv, r.data.f, r.data.n);
      };
      draw();
      return { canvas: cv, duration: 1200, seek: () => { if (!drawn) { draw(); drawn = true; } } };
    }
    case 'greeting':
      // Greetings have their own full-screen component; their attached art uses a nested player.
      return r.data.art ? createPlayer(r.data.art, px, cv) : createPlayer({ v: 1, type: 'naam', data: { n: r.by || 'Rangotsav' } }, px, cv);
  }
}
