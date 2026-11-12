# Naiteek — portfolio

Five static pages. Plain HTML/CSS/JS, no framework, no build step.

## Run locally

```
npx serve -l 5050 .
```

## Pages

- **index.html** — hero, one-line proof strip, three project cards deep-linked into Projects.
- **projects.html** — project cards, filterable by software / hardware / freelance / ventures.
- **experience.html** — community roles, hackathons and recognition.
- **about.html** — the story.
- **resume.html** — one-pager with print stylesheet; "download pdf" uses `window.print()`.
  Phone number is injected only at print time (see end of `js/main.js`), never shown on the web page.

## Interactions (js/main.js)

- Cursor-reactive grid: lines bend away from the pointer. In dark theme they also
  light up near the cursor (`--grid-glow` in `css/style.css`). Desktop pointers only;
  touch and reduced-motion get the static CSS grid.
- Scroll reveals, work filter, card tilt, theme toggle.

## Design system

paper `#f3f0e7`, ink `#191813`, ultramarine `#1f2de6`, orange `#ff4d00`,
yellow `#ffd84d`. Type: Bricolage Grotesque (display), Archivo (body),
IBM Plex Mono (labels). Grain overlay via inline SVG turbulence.

## Archive

`v1/` signal path · `v2/` particle portrait · `v3/` product catalog ·
`v4/` golden-circle single-pager
