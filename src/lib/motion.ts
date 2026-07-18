import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;

/** Initialize Lenis smooth scroll synced with GSAP ScrollTrigger. Returns cleanup. */
export function initMotion(): () => void {
  gsap.registerPlugin(ScrollTrigger);
  if (prefersReducedMotion()) {
    return () => {};
  }
  lenis = new Lenis({ syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  // Web fonts loading late can shift layout (line wraps, section heights)
  // after ScrollTrigger has already measured start/end positions.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  return () => {
    gsap.ticker.remove(raf);
    lenis?.destroy();
    lenis = null;
    ScrollTrigger.getAll().forEach((st) => st.kill());
  };
}

export function scrollToTarget(selector: string): void {
  if (lenis) {
    // No manual offset: Lenis reads the target's CSS `scroll-margin-top`
    // itself (see `[id] { scroll-margin-top: var(--header-h) }` in
    // global.css) and subtracts it internally. Passing an offset here too
    // would double-count the header clearance on top of that.
    lenis.scrollTo(selector);
  } else {
    // No 'smooth' here: CSS `scroll-behavior` already governs this (smooth
    // pre-init, auto under prefers-reduced-motion), so this fallback would
    // otherwise override the reduced-motion guard.
    document.querySelector(selector)?.scrollIntoView({ behavior: 'auto' });
  }
}

/** Lock page scroll (e.g. while a full-screen mobile menu is open). */
export function stopScroll(): void {
  lenis?.stop();
  // Covers the reduced-motion/no-Lenis case, and wheel/touch scroll on the
  // underlying document that Lenis.stop() alone doesn't block everywhere.
  document.documentElement.style.overflow = 'hidden';
}

/** Restore page scroll after stopScroll(). */
export function startScroll(): void {
  lenis?.start();
  document.documentElement.style.overflow = '';
}

export function scrollToTop(): void {
  if (lenis) {
    lenis.scrollTo(0);
  } else {
    // See note above: leave 'behavior' to CSS scroll-behavior.
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
}

