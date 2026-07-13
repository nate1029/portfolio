# Naiteek — portfolio (v5)

A lean four-tab portfolio positioning Naiteek for roles that blend technical
(electronics, AI/ML) with marketing/business — the bridge between people who
build and people who sell.

Plain HTML/CSS/JS, no framework, no build step.

## Run locally

```
npx serve -l 5050 .
```

## Pages

- **index.html (Home)** — the thesis ("Engineers can't sell it. Marketers can't
  build it. I do both."), three proof-point cards, paths to Work and Resume.
- **work.html (Work)** — case studies, filterable by hackathons / ai-ml /
  freelance / hardware. Every entry is structured why-it-mattered → what-I-built →
  how-it-landed → result. (This structure is deliberate; it is never attributed
  on-site — keep it that way.)
- **about.html (About)** — the story arc: electronics → AI/ML → marketing
  curiosity. Podcast, tennis, and reading appear only as one-line "color".
- **resume.html (Resume)** — clean one-pager with a print stylesheet;
  "download pdf" uses window.print() until a designed PDF replaces it.

## Interactions (js/main.js)

- Cursor-reactive background: grid lines bend smoothly away from the pointer
  (quadratic-curve smoothing, smoothstep falloff, no cursor marker). Desktop
  pointer devices only; touch/reduced-motion get the static CSS grid.
- Scroll reveals, work-page tag filter, tilt on cards, draggable home stickers.

## Content to replace (orange placeholder pills)

- [ ] Home: three proof points with real numbers
- [ ] Work: all five case studies (hackathon win, AI/ML build, two freelance, hardware)
- [ ] About: the real story (give Claude the actual arc), podcast link
- [ ] Resume: every entry — name, roles, dates, bullets, links
- [ ] Footer "currently reading" line

## Design system

paper `#f3f0e7`, ink `#191813`, ultramarine `#1f2de6`, orange `#ff4d00`,
yellow `#ffd84d`. Type: Bricolage Grotesque (display), Archivo (body),
IBM Plex Mono (labels). Grain overlay via inline SVG turbulence.

## Archive

`v1/` signal path · `v2/` particle portrait · `v3/` product catalog ·
`v4/` golden-circle single-pager
