# TARA — Website

Static website for **TARA (TIET Aerospace & Rocketry Association)**, a student-led
aerospace society at TIET, Patiala building toward high-powered student rocketry.

No build step. Plain HTML + CSS + JS — open it or serve it statically.

## Pages

| File | Route | Contents |
|---|---|---|
| `index.html` | Overview | Hero, spec strip, stats, pinned scrolly rocket flight, why-TARA, departments, CTA |
| `about.html` | About | Story, culture principles, TARA effect timeline, leadership (HOD grid) |
| `mission-control.html` | Mission control | Programme readiness board, constraints, phase timeline, operating principles |
| `careers.html` | Join TARA | Six departments, open HOD roles, FAQ, application form (submits via `mailto:` to both team leads) |
| `404.html` | 404 | Signal-lost error page |
| `agent-c.html` | — | Meta-refresh redirect to `index.html` (crawler/legacy alias) |

## Assets

- `styles.css` — full design system ("Flight Test" v6): tokens, type, header,
  hero, cards, dept grid, HOD grid, boards, timeline, forms, footer, loader,
  the scroll-FX layer (progress beam, marquee, tall flight scene, ghost
  words, timeline fill) plus the upgrade layer (skip link, hero entrance,
  photo reveals, back-to-top, magnetic buttons).
- `site.js` — loader, mobile nav, reveals, counters, form handler, single-rAF
  scroll engine (progress, hero drift, velocity marquee, tall flight, ghost
  drift, timeline fill, card tilt), scrollspy, back-to-top, magnetic buttons.
  Reduced-motion safe.
- `images/` — responsive team covers (`*-640.jpg` + `*-640.webp`, served via
  `<picture>`), `tara-logo-256.jpg` brand mark. Regenerate with PIL if source
  photos change (resize to 640px, JPEG q72 + WebP q78).
- `tara.jpeg` / `tara-1400.webp` — hero background (CSS `image-set`), 1400px.
- `robots.txt`, `sitemap.xml`, `site.webmanifest`, `favicon.png`,
  `apple-touch-icon.png` — SEO/PWA basics. Set the production domain in
  `robots.txt` / `sitemap.xml` (marked TODO) before launch.

## Preview locally

```powershell
# any static server works, e.g.
npx serve .
# or
python -m http.server 8000
```

Then open http://localhost:8000 (or :3000 for `serve`).

## Editing guide

- **Leadership (HODs)** — `about.html`, `#hods` → `.hod-grid`. Each card is an
  `article.hod-card` with `.hod-photo` (img or initials) + `.hod-body`.
  Vacant roles use `.hod-card.is-open` with a `?` mark.
- **Departments copy** — mirrored in `index.html` (`#departments`) and
  `careers.html` (`#departments`); keep the six entries in sync.
- **Readiness / phases** — `mission-control.html` (`.mission-board`, `.timeline`).
- **Cache busting** — stylesheet and script are pinned with `?v=6`.
  Bump the version in every HTML file when shipping CSS/JS changes.
- **Images** — covers are pre-sized (640px) with WebP + JPEG twins; the hero
  has a WebP twin via CSS `image-set`. HOD photos lazy-load with explicit
  dimensions. Keep new source photos under ~200 KB.

## Conventions

- One accent only (`--accent: #ff4d00`); hairline borders; mono labels.
- Scroll effects must be transform/opacity-only, skip when offscreen, and
  no-op under `prefers-reduced-motion` (see the v5–v8 layers in both files).
- Mobile: tall flight unpins, marquee slows, tilt disabled.

## Contact

TIET Aerospace & Rocketry Association — Patiala, Punjab, India.
`tara@thapar.edu`
