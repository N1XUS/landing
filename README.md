# Severyn Portfolio

Portfolio landing site for Denys Severyn — a single-page site built with
Qwik and QwikCity, with Lenis-driven smooth scrolling and GSAP
ScrollTrigger animations for the hero, about, and work sections.

## Development

```shell
npm run dev       # start the Vite dev server (SSR)
npm test          # run the Vitest suite
npm run build     # type-check and build client + server for production
npm run preview   # build and preview the production bundle locally
npm run images    # rebuild public/img from media/ (renders, screenshots, logo)
```

## Images

- `media/` (untracked): source PNGs — codex-generated renders in
  `media/renders/`, Malva UI captures in `media/shots/`.
- `public/img/`: AVIF + WebP variants built by `scripts/images.mjs`.
  Renders get their studio ground flat-fielded to pure black / white so
  `mix-blend-mode: screen` / `multiply` hides it without a visible slab.
  A complete run prunes stale variants.
- `public/og.jpg`: social card, rendered from `scripts/og.html` at
  1200x630 in headless Chrome.

## Theme

- Dark by default, light via `[data-theme=light]` tokens in `src/global.css`.
- No stored choice = follows `prefers-color-scheme`; the header switcher
  stores `theme` in localStorage. `src/lib/theme.ts` holds the resolver
  and the pre-paint script inlined in `src/root.tsx`.

## Deployment

This site is set up for Cloudflare Pages through Git integration.

Cloudflare Pages settings:

- Repository: `N1XUS/landing`
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root
- Custom domain: `severyn.pro`

After connecting the repository in Cloudflare, add `severyn.pro` as the
Pages custom domain. For the apex domain, the domain should be managed
as a Cloudflare zone with nameservers pointed to Cloudflare.

## Tech stack

- [Qwik](https://qwik.dev/) + QwikCity — routing, resumability, SSR
- [Vite](https://vitejs.dev/) — dev server and build
- [GSAP](https://gsap.com/) (ScrollTrigger) — scroll-driven animations
- [Lenis](https://lenis.darkroom.engineering/) — smooth scrolling
- TypeScript, ESLint, Prettier, Vitest

## Accessibility

All scroll-driven motion (Lenis, GSAP ScrollTrigger, anchor scrolling)
is skipped or reduced to instant jumps when the user's OS/browser has
`prefers-reduced-motion: reduce` set.
