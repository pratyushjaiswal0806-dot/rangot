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

```
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Not done yet
- Fonts load from the Google Fonts stylesheet (as in the prototype), not self-hosted.
- Pegasus logo is still the "P" badge; `clubUrl` is `#` (pass the real URL as a prop on `<Rangotsav />`).
- No Playwright suite or Lighthouse run; no OG image.
- The rate limit is in-memory per server instance. Use Upstash Ratelimit for a strict global limit.
