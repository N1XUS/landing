# Severyn Portfolio

Portfolio site for Denys Severyn, built with [Rivet](https://rivetjs.severyn.pro) as static HTML. One page, told as a scroll film.

## Commands

```shell
npm run dev       # dev server
npm run check     # Rivet diagnostics and type check
npm run build     # static site in dist/client
npm run preview   # serve dist/client (restart it after a rebuild)
npm run morph     # regenerate src/morph.css, src/intro-threads.ts and public/threads.svg
```

Requires Node 24 or newer. Cloudflare Workers Builds deploys `main` on push: `npm run build`, then `dist/client` as static assets (`wrangler.jsonc`).

## The film

- Motion is CSS driven by the scroll position (`animation-timeline`). The only JavaScript is Lenis smooth scrolling, skipped under `prefers-reduced-motion`. Browsers without scroll timelines, and `prefers-reduced-motion`, get a plain readable page with no line or shape.
- A living shape rides a line down the page: it melts between stops and gathers into a new form for each skill, and never quite holds still. Threads gather at each stop and part in curves between them. The geometry comes from `scripts/morph.mjs`.
- `PAGE` and the stops in `scripts/morph.mjs` must match the scene heights in `src/styles.css`, and the `.threads` height. Change them together, then run `npm run morph`.
- Headlines enter letter by letter with blur, opacity and a small rise (`reveal-letter`) and leave upward. Smaller text does the same as a block (`reveal`, `conceal`).

## Social card

`public/og.jpg` is rendered from `scripts/og.html` at 1200x630 with headless Chrome.
