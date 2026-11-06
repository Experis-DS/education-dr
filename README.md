# Experis for CollegeBuys

Spinoff of the CollegeBuys Highspot digital room as a self-contained Experis microsite.
Static HTML — no build step, no external requests (GSAP and the Inter variable font are vendored).

```
index.html            the page
assets/css/site.css   tokens (Experis brand refresh) + layout
assets/js/site.js     motion: load sequence, scroll-spy, reading-path progress, count-ups, tilt
assets/vendor/        gsap.min.js, ScrollTrigger.min.js (3.12.5, from excelerate/node_modules)
assets/fonts/         inter-latin-opsz-normal.woff2 (fontsource, OFL)
assets/brand/         Experis logos + favicons
assets/covers/        page-1 renders of each PDF (pdftoppm, 110 dpi)
assets/img/           one candid (people-b2b.png, from excelerate/public/brand)
downloads/            the 7 PDFs, clean names, plus CollegeBuys-Experis-Collateral.zip
```

## Preview

```sh
python3 -m http.server 3000   # then open http://localhost:3000
```
Open over http, not file:// — the preloaded font is blocked cross-origin from file://.

## Deploy

GitHub Pages from the repo root works as-is (relative paths throughout). Add `.nojekyll` if any
folder starts with `_`.

## Open items

- `data-placeholder-logo` in the header: the CollegeBuys wordmark is a hand-drawn SVG stand-in.
  Swap for the official logo file and delete the `<svg class="cb">` block.
- `data-todo` links in Contacts: Linda's phone and both LinkedIn URLs. Her email follows the
  `first.last@experis.com` pattern — confirm.
- Headshots: `.avatar` renders initials; drop an `<img>` inside to replace.
- No analytics, no passphrase (both off by request). Page is `noindex`.

## Editing

Each document is one `<li class="doc">` (Start here) or `<li class="report">` (Research).
Cover thumbnails: `pdftoppm -f 1 -l 1 -r 110 -jpeg file.pdf assets/covers/name`.
