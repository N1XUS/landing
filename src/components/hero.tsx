import {
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../lib/motion";
import { EyebrowMark, ProofMark } from "./inline-icons";
import { SplitLetters } from "./split-letters";

const styles = `
.hero {
  position: relative;
  min-height: 100svh;
  display: grid;
  align-content: center;
  overflow: hidden;
}
/* Subtle accent wash centered on the top-left corner, half clipped by
   the section — mirrors the work cards' corner glows. */
.hero::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: clamp(700px, 90vw, 1600px);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--accent) 13%, transparent) 0%,
    transparent 68%
  );
  pointer-events: none;
}
.hero-beam {
  position: absolute;
  top: 0;
  /* Mobile: stay inside the container's side gutter (percentage of the
     viewport, capped at the gutter width) so the line never crosses the
     text column. */
  right: min(4%, 1.25rem);
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, transparent, var(--accent) 35%, var(--accent-bright) 55%, transparent 85%);
  opacity: 0.7;
  pointer-events: none;
}
@media (min-width: 768px) {
  .hero-beam { right: clamp(1rem, 12vw, 14rem); }
}
.hero-beam::after {
  content: '';
  position: absolute;
  top: 42%;
  left: -3px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent-bright);
  box-shadow: 0 0 24px 4px color-mix(in srgb, var(--accent-hover) 65%, transparent);
}
.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  letter-spacing: 0.12em;
  color: var(--accent-bright);
  margin-bottom: 1.5rem;
}
.hero-eyebrow .eyebrow-mark {
  width: 1.5rem;
  height: 1.5rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.hero-name {
  font-size: clamp(3.25rem, 14vw, 10.5rem);
  line-height: 0.94;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  font-weight: 700;
}
.hn-line { display: block; }
.hn-line-2 {
  position: relative;
  z-index: 0;
  margin-left: clamp(1.5rem, 11vw, 9rem);
  color: var(--accent-hover);
}
.hn-ghost {
  position: absolute;
  top: 0.12em;
  left: 0.1em;
  z-index: -1;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--accent) 40%, transparent);
  user-select: none;
}
.hero-sub {
  margin-top: 2rem;
  font-size: clamp(1.0625rem, 2.2vw, 1.25rem);
  color: var(--muted);
  max-width: 46ch;
}
.hero-stats {
  list-style: none;
  padding: 0;
  margin: 2.5rem 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2.5rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.hero-stats li::before {
  content: none;
}
.hero-stats li {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.55rem;
  max-width: 20rem;
}
.hero-stats .proof-mark {
  flex: 0 0 auto;
  width: 1rem;
  height: 1rem;
  margin-top: 0.05rem;
  fill: color-mix(in srgb, var(--accent) 16%, transparent);
  stroke: var(--accent-bright);
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.hero-hint {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  translate: -50% 0;
  font-family: var(--font-mono);
  color: var(--muted);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
/* Stage the name's entrance before hydration so it never flashes fully
   rendered and then re-animates. Gated on html.js (set pre-paint in root)
   and motion preference, so no-JS visitors and reduced-motion users always
   see the name. The GSAP timeline tweens these to their final values. */
@media (prefers-reduced-motion: no-preference) {
  html.js .hero:not(.is-in) .sl-letter {
    opacity: 0;
    filter: blur(6px);
    transform: translateY(0.4em);
  }
  html.js .hero:not(.is-in) .hero-beam {
    opacity: 0;
  }
}
`;

export const Hero = component$(() => {
  useStyles$(styles);
  const root = useSignal<HTMLElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (prefersReducedMotion() || !root.value) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const tl = gsap
        .timeline({
          defaults: { ease: "power3.out" },
          // Once the sequence finishes, mark the section so the CSS staging
          // rules stop matching, then drop the inline tween styles — letters
          // must not carry a live filter/transform while the hover weight
          // effect runs.
          onComplete: () => {
            root.value?.classList.add("is-in");
            gsap.set(".sl-letter", { clearProps: "opacity,filter,transform" });
          },
        })
        // fromTo with explicit end values: the CSS-staged initial states
        // (html.js rules above) would corrupt plain .from() targets.
        .fromTo(
          ".hero-beam",
          { opacity: 0, scaleY: 0.6, transformOrigin: "top" },
          { opacity: 0.7, scaleY: 1, duration: 1 },
        )
        .from(".hero-eyebrow", { opacity: 0, y: 12, duration: 0.4 }, "-=0.6")
        .fromTo(
          ".sl-letter",
          { opacity: 0, y: "0.4em", filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            stagger: 0.03,
          },
          "-=0.3",
        )
        .from(
          ".hn-ghost",
          { opacity: 0, x: -10, y: -8, duration: 0.5 },
          "-=0.3",
        )
        .from(".hero-sub", { y: 24, opacity: 0, duration: 0.6 }, "-=0.35")
        .from(
          ".hero-stats li",
          { y: 16, opacity: 0, duration: 0.4, stagger: 0.08 },
          "-=0.4",
        );
      const header = document.querySelector(".site-header");
      if (header) {
        tl.from(header, { opacity: 0, duration: 0.5 }, "-=0.3");
      }

      const scrub = {
        trigger: root.value!,
        start: "top top",
        end: "bottom top",
        scrub: true,
      } as const;
      gsap.to(".hero-content", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: scrub,
      });
      gsap.to(".hero-beam", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: scrub,
      });
      gsap.to(".hero-hint", {
        opacity: 0,
        ease: "none",
        scrollTrigger: { ...scrub, end: "30% top" },
      });
    }, root.value);

    // Cursor-proximity variable weight on the name (desktop fine-pointer only).
    let removeWeightFx: (() => void) | undefined;
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const name = root.value.querySelector<HTMLElement>(".hero-name");
      const letters = Array.from(
        root.value.querySelectorAll<HTMLElement>(".hn-line .sl-letter"),
      );
      if (name && letters.length) {
        let mx = 0;
        let my = 0;
        let leaving = false;
        let active = false;
        // Weights ease toward their target each frame instead of being set
        // directly, so entering the container ramps in smoothly rather than
        // snapping to the computed dent on the first frame.
        const weights = letters.map(() => 700);
        const stop = () => {
          gsap.ticker.remove(update);
          active = false;
          for (const el of letters) {
            el.style.fontVariationSettings = "";
          }
        };
        const update = () => {
          // Read all layout first, then write all styles — interleaving the
          // two per letter forces a synchronous reflow on every iteration.
          const rects = letters.map((el) => el.getBoundingClientRect());
          let settled = true;
          letters.forEach((el, i) => {
            const r = rects[i];
            const d = Math.hypot(
              mx - (r.x + r.width / 2),
              my - (r.y + r.height / 2),
            );
            const target = leaving ? 700 : 300 + Math.min(1, d / 240) * 400; // 300 near cursor -> 700 far
            weights[i] += (target - weights[i]) * 0.16;
            if (Math.abs(weights[i] - target) > 0.5) settled = false;
            el.style.fontVariationSettings = `'wght' ${Math.round(weights[i])}`;
          });
          // After a leave, keep easing back to 700 and only then release.
          if (leaving && settled) stop();
        };
        const onMove = (e: MouseEvent) => {
          mx = e.clientX;
          my = e.clientY;
        };
        const onEnter = (e: MouseEvent) => {
          onMove(e);
          leaving = false;
          if (!active) {
            active = true;
            gsap.ticker.add(update);
          }
        };
        const onLeave = () => {
          leaving = true;
        };
        name.addEventListener("mouseenter", onEnter);
        name.addEventListener("mousemove", onMove);
        name.addEventListener("mouseleave", onLeave);
        removeWeightFx = () => {
          name.removeEventListener("mouseenter", onEnter);
          name.removeEventListener("mousemove", onMove);
          name.removeEventListener("mouseleave", onLeave);
          stop();
        };
      }
    }

    cleanup(() => {
      removeWeightFx?.();
      ctx.revert();
    });
  });

  return (
    <section class="hero" ref={root}>
      <div class="hero-beam" aria-hidden="true" />
      <div class="container hero-content">
        <p class="hero-eyebrow">
          <EyebrowMark />
          <span>full-stack product engineer</span>
        </p>
        <h1 class="hero-name" aria-label="Denys Severyn">
          <span class="hn-line">
            <SplitLetters text="DENYS" />
          </span>
          <span class="hn-line hn-line-2">
            <span class="hn-ghost" aria-hidden="true">
              SEVERYN
            </span>
            <SplitLetters text="SEVERYN" />
          </span>
        </h1>
        <p class="hero-sub">
          I turn complex front ends, resilient platforms, and AI ideas into
          software product teams can actually ship.
        </p>
        <ul class="hero-stats">
          <li>
            <ProofMark />
            <span>A decade shipping production-grade platforms</span>
          </li>
          <li>
            <ProofMark />
            <span>Open-source UI systems for enterprise products</span>
          </li>
          <li>
            <ProofMark />
            <span>AI features moved from prototype to production</span>
          </li>
        </ul>
      </div>
      <span class="hero-hint">scroll</span>
    </section>
  );
});
