# Rangotsav

Indian art forms as little toys: weave your name into a kolam, draw rangoli, paint with a Diwali
sparkler, twist a sikku kolam into one line, lay an Onam pookalam, tie and dye bandhani,
block-print cloth, paint truck art, take a truck-art selfie and light a diya in a shared night sky. A Pegasus · RVITM project, built with Next.js (App Router).

```
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Copy `.env.example` to `.env.local` for the shared features (Upstash Redis). Without it the site
still works: share links fall back to images, the diya counter counts this browser, and the Mela
wall hides itself.

## Map
| Route | What |
|---|---|
| `/` | Hero you can play with (petals bloom where you move or tap; type a name and the kolam re-weaves into it), the Today strip (Pulli, passport, festival), the toy shelf, the Mela wall, the diya night sky |
| `/rangoli` `/phuljhadi` `/kolam` `/pookalam` `/bandhani` `/block` `/naam` `/poster` `/truck` `/selfie` `/kathputli` `/warli` `/patang` | Full-screen toys, all in `components/toys/ToyShell.tsx` (on phones the controls are one-line rails you swipe), each with its story (Kahani) below |
| `/words` | Shabd kosh: every glossary word from the stories (`data/words.json`), A to Z, each with its own anchor |
| `/pulli` | The daily kolam puzzle (streaks in localStorage, global stats in Redis) |
| `/about` | About, Behind the Code, Meet the Makers (`data/makers.json`) |
| `/r/<id>` | A shared creation replaying itself (or an animated greeting), with its own OG image |
| `/remix/<id>`, `/sky/<n>` | Open a creation in its toy to remix it; "I lit diya #n" share page with an OG image |

Old links from the one-page site (`/?tool=`, `/?remix=`, `/?naam=`) redirect in `next.config.ts`.

## How it fits together
- **Toys** live in `lib/toys.ts` (one registry for the shelf, header, redirects and "make your
  own"). Drawing toys record **recipes, not PNGs** (`lib/recipe.ts`): strokes, dots, stamps or
  settings in a compact, validated format. Undo, resize, replays, remixes and share links all
  redraw from the recipe (`lib/art/player.ts`). Art renderers are in `lib/art/`. Kathputli's recipe
  is the control bar's path (30 samples a second); its replay runs the same Verlet string physics
  again at a fixed 60 steps a second (`lib/art/kathputli.ts`), so the puppet swings the same way.
  Warli keeps the number of dancers and the village (`lib/art/warli.ts` draws everything as
  primitives, so the canvas and the OG SVG share one geometry); Patang keeps the kite's design and
  how many kites it cut, and its share page flies a scripted loop (`lib/art/patang.ts`).
- **Sharing** (`components/ShareSheet.tsx`): 9:16 story cards, reels (`lib/reel.ts`), short
  links (`POST /api/creations`), WhatsApp, Instagram sticker steps, and an opt-in for the wall.
- **Feel**: synthesised sound in `lib/sfx.ts` (raga Bhupali notes, powder hiss, block thuds,
  bells, sparkler crackle, a keherwa dholak, the boli reed, applause, the tarpa; mute toggle, nothing plays before the first tap), celebrations in
  `lib/fx.ts` (gulal, petals, fireworks, a blooming rangoli ring), big "वाह!" moments via
  `cheer()` (`components/site/Cheer.tsx`, milestones only), finger-trail particles for toy stages
  (`lib/trail.ts`), shared spark physics (`lib/art/sparks.ts`), a ghost hand on a toy's first
  visit (`lib/ghost.ts`), and seeded "Surprise me" designs (`lib/art/generate.ts`).
- **Motion rules**: entrance animations animate *from* hidden to the element's own style, so
  with reduced motion (CSS animation is off globally) everything simply sits in place; JS motion
  asks `calm()` in `lib/motion.ts`. `[data-reveal]` waits for scroll (`--rv`), `[data-live]`
  loops only while on screen (`--live`), both set by `components/site/RevealObserver.tsx`.
- **Stories (Kahani)** under every toy (`components/kahani/Kahani.tsx`, content in
  `content/kahani/<toy>.ts`): chapter pictures in `Art.tsx` build themselves as their chapter
  scrolls in and keep a small loop going (classes in `Art.module.css`: `in*` entrances, `lp*`
  loops); a kolam thread fills along the top as you read (CSS scroll-driven animation), timeline
  cards swing from their pins, map tiles light up like diyas, and quiz cards turn over.
  "▶ Play the Kahani" (`PlayKahani.tsx` → `KahaniPlayer.tsx`, loaded on demand) plays the chapters
  as a picture book with page-turn view transitions, Cheenti narrating and optional read-aloud
  (`speechSynthesis`).
- **Sangeet (story music)**: every Kahani has its own synthesised tune (`lib/music.ts`), in a raga
  and rhythm from the craft's home: santoor and tabla for rangoli, veena and mridangam for kolam,
  chenda for pookalam, a garba for bandhani, bhangra for the truck, the tarpa for Warli and so on.
  A small sequencer schedules a bar at a time (drone, lead phrases, drum layers, fills). It plays
  while the story fills the screen (`components/kahani/KahaniMusic.tsx`), carries on into the
  picture book (softer, ducking under the read-aloud voice), waits for a first tap, obeys the
  sound toggle, and can be switched off (`lib/musicPref.ts`, kept in localStorage).
- **Cheenti** (`components/site/Cheenti.tsx`): the ant mascot, pure SVG with poses (idle, wave,
  cheer, eat, peek, point, walk, talk, sleep). `say()` in `lib/cheenti.ts` makes her peek in with a
  tip (`components/site/CheentiHost.tsx`); the footer toggle turns tips off.
- **Rewards** (`lib/progress.ts`, localStorage only): one passport stamp per toy tried, shown by
  `components/site/StampToast.tsx`; unlocks (gold powder, peacock brush, gold ink, moonlight
  line, rainbow sparks, Kalakaar certificate) are announced once and show up locked in the trays
  until earned. **Chunauti** (`lib/challenges.ts`): three goals per toy, listed at the top of its
  tray (`components/toys/Challenges.tsx`); a toy calls `done(id)` when it notices one met, and the
  star is announced with a toast and a cheer. Stars show on shelf tiles and in My Courtyard.
- **Toy feel**: each toy has its own touches (powder falling from the fingertip, a ring of diyas
  in Rangoli, a bead of light running a one-line kolam and ants for breakfast, petals dropping
  into the pookalam and Maveli walking by, dye drips, the wooden block pressing with a combo,
  a dancing poster with marquee bulbs, the truck driving off, live selfie stickers, Pulli's
  glow and napping Cheenti). Pass `toy` to `ToyShell` and it adds the challenges and Cheenti's
  first-visit tip (`tipFor` in `lib/cheenti.ts`).
- **Mela wall** (`app/api/wall`, `components/home/MelaWall.tsx`): the newest shared rangoli,
  kolam, pookalam, bandhani, block print and mehendi, without makers' names. Visitors can report a tile (3 reports
  hide it); `DELETE /api/wall?id=…` with `Authorization: Bearer $WALL_ADMIN_TOKEN` removes one.
- **Night sky** (`components/home/DiyaSky.tsx`): one light per diya ever lit, a Bengaluru-ish
  skyline and tap-for-fireworks. **Night mode** (`lib/theme.ts`) switches the site to a starry
  theme during Diwali (IST dates from `data/festivals.json`) and every evening; the footer
  toggle pins it on or off, and `?theme=night` forces it for a look.
- **Selfie booth** (`components/toys/SelfieToy.tsx`, frames in `lib/art/selfie.ts`): camera or a
  picked photo, drawn on a canvas only. Nothing is uploaded.
- **Fonts** are self-hosted from `@fontsource` packages with their real family names, which the
  canvas code uses directly. The TTFs in `assets/fonts/` are for OG images.
- **Analytics**: Vercel Web Analytics custom events in `lib/track.ts`, including `session`
  (toys opened and active seconds per visit) for "do people stay".

## Yearly chores
- Add next year's festival dates to `data/festivals.json` (it runs to Dec 2027).
- Kannada and Tamil greeting copy should be checked by a native speaker.
- Pegasus logo is still the "P" badge. The footer's "Visit the Pegasus site" button appears only when `NEXT_PUBLIC_CLUB_URL` is set (see `.env.example`).
- Makers: the six entries in `data/makers.json` are placeholders, so the About page's "Meet the makers" section is hidden. To show a real maker, put their name and role in an entry, set `"shown": true`, and add a `photo` path (`"photo": null` until then; the arch shows the maker's initial over a mandala). The footer link says "Meet the makers" only while at least one maker is shown.
- Set `NEXT_PUBLIC_SITE_URL` at build time on any host other than Vercel. The OG and Twitter image URLs use it, and the build warns when it is missing. robots.txt and the sitemap use the request host when it is unset.
