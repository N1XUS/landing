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
```

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
