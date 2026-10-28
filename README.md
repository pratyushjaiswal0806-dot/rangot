# Rangotsav

Next.js (App Router) port of the Claude Design prototype `design/Rangotsav.dc.html`.

- `design/` holds the prototype files; the HTML is the source of truth for markup, copy and tokens.
- `npm run gen` compiles its template into `components/RangotsavView.generated.tsx` and
  `app/design.generated.css`. Re-run it after the design changes. Don't edit those files by hand.
- `components/Rangotsav.tsx` is the prototype's logic class (kolam weaver, rangoli, block stamps,
  truck-plate and poster renderers, tilt, diya counter), ported as a client component.
- `data/makers.json` holds the makers (placeholders) and optional photo paths (`photo`).
- `app/api/diyas/route.ts`: `GET` returns `{count}`, `POST {delta:1}` increments (Upstash Redis,
  30 POSTs/min/IP). Copy `.env.example` to `.env.local` and fill it in.

## Sharing and coming back
- **Recipes, not PNGs** (`lib/recipe.ts`): every creation is stored as a small recipe (strokes,
  dots, stamps or settings) and validated on both sides. `POST /api/creations` returns a short,
  content-hashed id; `/r/<id>` replays the creation (`lib/art/player.ts`) with a per-creation OG
  image, "Make your own" and "Remix this" (`/?remix=<id>`). Links expire after a year.
- **Share sheet** (`components/ShareSheet.tsx`): three 9:16 story templates (`lib/art/story.ts`),
  reel export (`lib/reel.ts`, MediaRecorder, MP4 where supported), copy link, WhatsApp, and the
  Instagram Link/Add Yours sticker steps.
- **Naam Kolam** (`lib/art/naam.ts`): a name hashes to a symmetric dot cluster woven into one loop,
  plus a playful reading (`data/naam-traits.json`). Same name, same kolam.
- **Greetings** (`components/islands/GreetingMaker.tsx`, `components/Greeting.tsx`): festival
  greetings in English, Hindi, Kannada and Tamil with "light a diya back" counters.
  Festival dates live in `data/festivals.json` (IST, Nov 2026 to Dec 2027; extend it yearly).
- **Pulli** (`/pulli`, `lib/pulli.ts`): daily kolam puzzle seeded by the IST date, streaks in
  localStorage, global stats in Redis.
- **Mehendi** (`components/islands/Mehendi.tsx`), rangoli brushes, "Did you know" facts
  (`data/culture.json`) and My Courtyard (`lib/progress.ts`, localStorage only).
- New widgets are typed TSX "islands" placed from the design HTML with
  `<x-island name="X" props="{{ x }}">`; `npm run gen` imports `components/islands/X.tsx`.
- Analytics: Vercel Web Analytics custom events via `lib/track.ts`.
- OG images render with the TTFs in `assets/fonts/` (OFL); the page itself still uses the
  Google Fonts stylesheet because the canvas code names those families directly.

```
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Not done yet
- Fonts load from the Google Fonts stylesheet (as in the prototype), not self-hosted.
- Pegasus logo is still the "P" badge; `clubUrl` is `#` (pass the real URL as a prop on `<Rangotsav />`).
- No Playwright suite or Lighthouse run.
- Reels: Chrome on Linux records Opus audio inside MP4; check Instagram accepts reels from
  Android Chrome and iOS Safari on real devices.
- Kannada and Tamil greeting copy in `data/festivals.json` should be checked by a native speaker.
