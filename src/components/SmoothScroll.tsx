import { clientEffect } from "@rivetjs/runtime/dom";

/** Lenis smooth scrolling. The film's CSS timelines read the scroll position it sets. */
export function SmoothScroll() {
  clientEffect(
    () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      let stop: (() => void) | undefined;
      void import("lenis").then(({ default: Lenis }) => {
        const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.085 });
        stop = () => lenis.destroy();
      });
      return () => stop?.();
    },
    { when: "load" },
  );
  return <span hidden />;
}
