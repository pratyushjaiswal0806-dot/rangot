// Replays a recipe onto its own canvas. seek(t) with t in [0,1] shows the creation that far
// along; the share page, the reel recorder and "Remix" all drive the same player.
import { C, PALS } from './palette';
import { decodeStrokes, MEHENDI_LOOK, RANGOLI_LOOK, rangoliFloor, strokeReplayer } from './rangoli';
import { drawKolam, kolamSegs } from './kolam';
import { drawSikku, edgeMap, SIKKU_GRID, weave } from './sikku';
import { blockPress, paintFabric } from './block';
import { drawPoster } from './poster';
import { drawPlate } from './truck';
import { naamKolam } from './naam';
import { mehendiBase } from './mehendi';
import { cells, drawPookalam } from './pookalam';
import { decodeRounds, drawBandhani } from './bandhani';
import { clearLight, composite, copies, lightLayers, lightReplayer, nightSky, sparklerTip } from './phuljhadi';
import { drawSparks, glowSprite, spray, stepSparks, type Spark } from './sparks';
import { drawKathputli, fromInts, newRig, PUPPETS, RATE, sampleAt, stepRig, type Rig } from './kathputli';
import { decodePts } from '../recipe';
import { drawWarli, sceneFrom, SPIN, WALK, wallCanvas } from './warli';
import { drawKite, drawSky, drawString, KITE_COLOURS, ME, REPLAY_SECONDS, replayFlight, rivalFlight, stringPoints, THEM } from './patang';
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
      const look = r.type === 'rangoli' ? RANGOLI_LOOK : MEHENDI_LOOK;
      let rp = strokeReplayer(x, px, ds, look), done = -1;
      return {
        canvas: cv,
        duration: Math.min(7000, Math.max(2500, rp.total * 4)),
        seek(t) {
          const to = Math.round(rp.total * Math.min(1, t));
          if (to < done || done < 0) { bg(); rp = strokeReplayer(x, px, ds, look); done = 0; }
          rp.advance(to); done = to;
        },
      };
    }
    case 'kolam':
    case 'naam': {
      const x = sq();
      if (r.type === 'kolam' && r.data.m) {
        const k = r.data, w = weave(k.dots, edgeMap(k.m!));
        const longest = Math.max(1, ...w.loops.map((l) => l.length));
        return {
          canvas: cv,
          duration: Math.min(4600, 1400 + longest * 20),
          seek: (t) => drawSikku(x, px, SIKKU_GRID, w, k.c, k.d, 1 - (1 - Math.min(1, t)) ** 2, C.floor, k.r === 1),
        };
      }
      const naam = r.type === 'naam' ? naamKolam(r.data.n) : null;
      const k = r.type === 'kolam' ? r.data : null;
      const g = naam ? naam.g : 7, dots = naam ? naam.dots : k!.dots;
      const segs = kolamSegs(dots, px, g);
      const col = naam ? naam.color.line : k!.c;
      const showDots = k ? k.d : true;
      return {
        canvas: cv,
        duration: Math.min(4200, 1400 + segs.length * 14),
        seek: (t) => {
          const p = 1 - (1 - Math.min(1, t)) ** 2;
          drawKolam(x, px, g, dots, segs, col, showDots, p, naam ? naam.color.bg : C.floor);
          // while it weaves, the tip of the line glows like a fingertip full of rice flour
          const n = Math.floor(segs.length * p);
          if (t < 1 && n > 0) {
            const q = segs[n - 1][3], rad = px / 26, gr = x.createRadialGradient(q.x, q.y, 0, q.x, q.y, rad);
            gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(0.35, 'rgba(255,214,90,.6)'); gr.addColorStop(1, 'rgba(255,194,26,0)');
            x.fillStyle = gr; x.beginPath(); x.arc(q.x, q.y, rad, 0, Math.PI * 2); x.fill();
          }
        },
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
      // a dancing poster dances through its replay (and its reel)
      if (r.type === 'poster' && r.data.n === 1) {
        const d = r.data, pal = PALS[d.p] ?? PALS[0];
        drawPoster(cv, d.w, d.t, d.o, pal, d.l ?? 0, d.b ?? 0);
        return { canvas: cv, duration: 4800, seek: (t) => drawPoster(cv, d.w, d.t, d.o, pal, d.l ?? 0, d.b ?? 0, 0, t >= 1 ? 0 : 0.01 + t * 4.8) };
      }
      let drawn = false;
      const draw = () => {
        if (r.type === 'poster') drawPoster(cv, r.data.w, r.data.t, r.data.o, PALS[r.data.p] ?? PALS[0], r.data.l ?? 0, r.data.b ?? 0);
        else drawPlate(cv, r.data.f, r.data.n, r.data.s ?? 0, r.data.k ?? 0);
      };
      draw();
      return { canvas: cv, duration: 1200, seek: () => { if (!drawn) { draw(); drawn = true; } } };
    }
    case 'pookalam': {
      // flowers go down ring by ring from the centre, the way a pookalam grows over Onam
      const x = sq(), all = cells(r.data.l), N = all.length;
      const rank = new Array<number>(N);
      all.map((c, i) => [c.ring, c.k, i] as const).sort((a, b) => a[0] - b[0] || a[1] - b[1]).forEach(([, , i], n) => { rank[i] = n; });
      const W = 10;
      return {
        canvas: cv,
        duration: Math.min(5200, 1600 + N * 14),
        seek: (t) => { const at = Math.min(1, t) * (N + W); drawPookalam(x, px, r.data.l, r.data.k, { show: (i) => Math.max(0, Math.min(1, (at - rank[i]) / W)) }); },
      };
    }
    case 'bandhani': {
      // tie, dip, tie, dip … then untie from the centre outwards
      const x = sq(), rounds = decodeRounds(r.data), R = rounds.length;
      const tie = 0.55, dip = 0.7, open = 1.1, total = R * (tie + dip) + open;
      return {
        canvas: cv,
        duration: total * 1000,
        seek(t) {
          let s = Math.min(1, t) * total;
          for (let k = 0; k < R; k++) {
            if (s < tie) {
              const n = rounds[k].pts.length / 2 || 1, f = s / tie;
              drawBandhani(x, px, rounds, r.data.z, { dips: k, tied: k + 1, show: (rr, i) => (rr < k ? 1 : Math.max(0, Math.min(1, f * 1.6 - (i / n) * 0.6))) });
              return;
            }
            s -= tie;
            if (s < dip) { drawBandhani(x, px, rounds, r.data.z, { dips: k, tied: k + 1, wave: s / dip }); return; }
            s -= dip;
          }
          drawBandhani(x, px, rounds, r.data.z, { dips: R, tied: R, open: Math.min(1, s / (open * 0.8)) });
        },
      };
    }
    case 'phuljhadi': {
      // the light is painted again stroke by stroke, sparks flying from every burning tip
      const x = sq(), L = lightLayers(px), sky = nightSky(px), sp: Spark[] = [], glow = glowSprite(), h = px / 2;
      let rp = lightReplayer(L, r.data.strokes), done = -1;
      return {
        canvas: cv,
        duration: Math.min(8000, Math.max(3000, rp.total * 5)),
        seek(t) {
          const to = Math.round(rp.total * Math.min(1, t));
          if (to < done || done < 0) { clearLight(L); rp = lightReplayer(L, r.data.strokes); done = 0; sp.length = 0; }
          const tip = rp.advance(to);
          done = to;
          if (t >= 1) sp.length = 0;
          else if (tip) for (const q of copies(tip.p, tip.n, tip.m)) spray(sp, h + q.x, h + q.y, tip.c, 8, 3, 700);
          stepSparks(sp);
          composite(x, px, sky, L);
          if (tip && t < 1) for (const q of copies(tip.p, tip.n, tip.m)) sparklerTip(x, { x: h + q.x, y: h + q.y }, tip.c, px / 160);
          drawSparks(x, sp, glow);
        },
      };
    }
    case 'kathputli': {
      // the curtains part, then the show runs again through the same string physics, 60 steps a
      // second, so the puppet swings exactly as it did; then it says its line
      const x = sq(), show = fromInts(decodePts(r.data.t) ?? []), CURTAIN = 1.2, len = show.length / RATE;
      let rig: Rig = newRig(), sim = 0;
      return {
        canvas: cv,
        duration: (CURTAIN + len + 0.9) * 1000,
        seek(t) {
          const at = Math.min(1, t) * (CURTAIN + len + 0.9);
          if (at < sim - 1e-6) { rig = newRig(); sim = 0; }
          for (; sim + 1 / 60 <= at; sim += 1 / 60) {
            const c = sim < CURTAIN ? show[0] : sampleAt(show, sim - CURTAIN);
            if (c) stepRig(rig, c.x, c.y, c.a);
          }
          const open = Math.min(1, at / CURTAIN), ease = 1 - (1 - open) ** 3;
          drawKathputli(x, px, rig, r.data.p, r.data.b, { curtain: ease, t: at, bubble: at > CURTAIN + len ? PUPPETS[r.data.p]?.line : undefined });
        },
      };
    }
    case 'patang': {
      // the kite climbs off the roof and loops over the old city; if it cut kites, it cuts one here too
      const x = sq(), d = r.data, night = d.n === 1, line = night ? '#FBF3E4' : '#1B1410';
      return {
        canvas: cv,
        duration: REPLAY_SECONDS * 1000,
        seek(t) {
          const T = Math.min(1, t) * REPLAY_SECONDS, k = replayFlight(T);
          drawSky(x, px, night, T);
          if (d.k > 0) {
            const rv = rivalFlight(T);
            if (!rv.cut) drawString(x, px, stringPoints(THEM[0].x, THEM[0].y, rv.x, rv.y, 0.2), line, night ? 1 : 0, T);
            drawKite(x, px, rv.x, rv.y, rv.ang, 0.032, { a: (d.a + 3) % 8, b: (d.b + 5) % 8, p: 1, t: 0 }, T, rv.cut);
            if (rv.cut && T < 5.2) {
              x.font = `900 ${Math.round(px * 0.07)}px Sarpanch, sans-serif`; x.textAlign = 'center';
              x.lineWidth = px * 0.012; x.strokeStyle = '#1B1410'; x.strokeText('KAI PO CHE!', px / 2, px * 0.2);
              x.fillStyle = '#FFC21A'; x.fillText('KAI PO CHE!', px / 2, px * 0.2);
            }
          }
          drawString(x, px, stringPoints(ME.x, ME.y, k.kx, k.ky, k.slack), line, night ? 3 : 0, T);
          drawKite(x, px, k.kx, k.ky, k.ang, 0.045, d, T);
          if (d.k > 0) {
            const label = `✂ ${d.k} kati`;
            x.font = `800 ${Math.round(px * 0.04)}px Mukta, sans-serif`; x.textAlign = 'left';
            x.fillStyle = 'rgba(27,20,16,.75)'; x.fillRect(px * 0.03, px * 0.03, x.measureText(label).width + px * 0.04, px * 0.065);
            x.fillStyle = KITE_COLOURS[0][1]; x.fillText(label, px * 0.05, px * 0.075);
          }
        },
      };
    }
    case 'warli': {
      // the village appears, then the dancers walk in one by one and the spiral turns
      const x = sq(), it = decodePts(r.data.i) ?? [], items: [number, number, number][] = [];
      for (let k = 0; k + 2 < it.length; k += 3) items.push([it[k], it[k + 1], it[k + 2]]);
      const sc = sceneFrom(r.data.d, items, r.data.n === 1), wall = wallCanvas(px, r.data.n === 1), sp = r.data.s / 10, dir = r.data.r ? -1 : 1;
      const total = 0.6 + 3.2 + WALK + 1.4;
      return {
        canvas: cv,
        duration: total * 1000,
        seek(t) {
          const T = Math.min(1, t) * total;
          drawWarli(x, px, sc, { t: T, phi: SPIN * sp * dir * T, beat: (T * 84 * sp) / 60, wall });
        },
      };
    }
    case 'greeting':
      // Greetings have their own full-screen component; their attached art uses a nested player.
      return r.data.art ? createPlayer(r.data.art, px, cv) : createPlayer({ v: 1, type: 'naam', data: { n: r.by || 'Rangotsav' } }, px, cv);
  }
}
