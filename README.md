# Severyn Portfolio

Portfolio site for Denys Severyn, built with [Rivet](https://rivetjs.severyn.pro) as static HTML. One page, told as a scroll film.

## Commands

```shell
npm run dev       # dev server
npm run check     # Rivet diagnostics and type check
npm run build     # static site in dist/client
npm run preview   # serve dist/client (restart it after a rebuild)
npm run morph     # regenerate src/morph.css and public/threads.svg
```

Requires Node 24 or newer. Cloudflare Workers Builds deploys `main` on push: `npm run build`, then `dist/client` as static assets (`wrangler.jsonc`).

## The film

- Motion is CSS driven by the scroll position (`animation-timeline`). JavaScript adds Lenis smooth scrolling and the dust, both skipped under `prefers-reduced-motion`. Browsers without scroll timelines or WebGL, and `prefers-reduced-motion`, get a plain readable page.
- Dust drawn live in a WebGL shader (`src/mist.ts`): a faint field across the window, whose heading swings with the scroll, and a brighter cloud with haze that follows the scroll with some lag and lights up around the cursor. Threads run one unbroken line through it. The geometry comes from `scripts/morph.mjs`.
- `PAGE` in `scripts/morph.mjs` must match the scene heights in `src/styles.css`, and the `.threads img` height. Change them together, then run `npm run morph`.
- Headlines enter letter by letter with blur, opacity and a small rise (`reveal-letter`) and leave upward. Smaller text does the same as a block (`reveal`, `conceal`).
- Text blocks drift through their scene at their own speed (`drift`): `--parallax` sets the distance, `--depth` each block's multiplier.

## Social card

`public/og.jpg` is rendered from `scripts/og.html` at 1200x630 with headless Chrome.
