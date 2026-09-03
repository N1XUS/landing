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
/* Accent wash on the top-left corner, half clipped by the section, and a
   coral counterpart bottom-right where the render's light leak lands. */
.hero::before,
.hero::after {
  content: '';
  position: absolute;
  aspect-ratio: 1;
  border-radius: 50%;
  pointer-events: none;
}
.hero::before {
  left: 0;
  top: 0;
  width: clamp(700px, 90vw, 1600px);
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, var(--glow-1) 0%, transparent 68%);
}
.hero::after {
  right: 0;
  bottom: 0;
  width: clamp(500px, 60vw, 1100px);
  transform: translate(35%, 45%);
  background: radial-gradient(circle, var(--glow-2) 0%, transparent 66%);
}
/* The blueprint-to-glass render. Its ground is flattened to pure black /
   white by the image pipeline and blended away (--render-blend), so only
   the structure floats over the page. The element is the image's own 3:2
   box, masked on all four edges, so the frame can't show on any viewport
   proportion; on phones the fade also clears the left where the name sits. */
.hero-render {
  position: absolute;
  top: 3%;
  right: -22vw;
  height: 42%;
  aspect-ratio: 3 / 2;
  z-index: 0;
  pointer-events: none;
  mix-blend-mode: var(--render-blend);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url(/img/hero-dark-960.webp);
  background-image: image-set(
    url(/img/hero-dark-960.avif) type("image/avif"),
    url(/img/hero-dark-960.webp) type("image/webp")
  );
  /* Phones: keep the glass at the top right and let the wireframe half
     dissolve before it reaches the name. */
  mask-image: radial-gradient(74% 76% at 72% 30%, #000 22%, transparent 66%);
  mask-composite: intersect;
  -webkit-mask-composite: source-in;
  will-change: transform;
}
:root[data-theme='light'] .hero-render {
  background-image: url(/img/hero-light-960.webp);
  background-image: image-set(
    url(/img/hero-light-960.avif) type("image/avif"),
    url(/img/hero-light-960.webp) type("image/webp")
  );
}
@media (min-width: 768px) {
  .hero-render {
    top: 6%;
    right: -6vw;
    height: 88%;
    background-image: url(/img/hero-dark-1536.webp);
    background-image: image-set(
      url(/img/hero-dark-1536.avif) type("image/avif"),
      url(/img/hero-dark-1536.webp) type("image/webp")
    );
    mask-image:
      linear-gradient(90deg, transparent 4%, #000 26%, #000 90%, transparent 100%),
      linear-gradient(180deg, transparent 0%, #000 8%, #000 82%, transparent 100%);
  }
  :root[data-theme='light'] .hero-render {
    background-image: url(/img/hero-light-1536.webp);
    background-image: image-set(
      url(/img/hero-light-1536.avif) type("image/avif"),
      url(/img/hero-light-1536.webp) type("image/webp")
    );
  }
}
.hero-content { position: relative; z-index: 1; }
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
  z-index: 1;
}
/* Stage the entrance before hydration so nothing flashes fully rendered
   and then re-animates. Gated on html.js (set pre-paint in root) and
   motion preference, so no-JS visitors and reduced-motion users always
   see everything. The GSAP timeline tweens these to their final values. */
@media (prefers-reduced-motion: no-preference) {
  html.js .hero:not(.is-in) .sl-letter {
    opacity: 0;
    filter: blur(6px);
    transform: translateY(0.4em);
  }
  html.js .hero:not(.is-in) .hero-render {
    clip-path: inset(0 100% 0 0);
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
            gsap.set(".hero-render", { clearProps: "clipPath" });
          },
        })
        // The render resolves left-to-right, wireframe first, then glass —
        // the same direction the image itself reads.
        .fromTo(
          ".hero-render",
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 1.6,
            ease: "power3.inOut",
          },
        )
        .from(".hero-eyebrow", { opacity: 0, y: 12, duration: 0.4 }, "-=1.2")
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
      gsap.to(".hero-render", {
        yPercent: 22,
        ease: "none",
        scrollTrigger: scrub,
      });
      gsap.to(".hero-hint", {
        opacity: 0,
        ease: "none",
        scrollTrigger: { ...scrub, end: "30% top" },
      });
    }, root.value);

    const fine = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    // Cursor-proximity variable weight on the name (desktop fine-pointer only).
    let removeWeightFx: (() => void) | undefined;
    if (fine) {
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

    // The render drifts a few pixels against the cursor: enough depth to
    // read as an object in the room, not a sticker on the page.
    let removeTilt: (() => void) | undefined;
    if (fine) {
      const render = root.value.querySelector<HTMLElement>(".hero-render");
      if (render) {
        const xTo = gsap.quickTo(render, "x", {
          duration: 0.9,
          ease: "power3.out",
        });
        const yTo = gsap.quickTo(render, "y", {
          duration: 0.9,
          ease: "power3.out",
        });
        const onMove = (e: MouseEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          xTo(nx * -18);
          yTo(ny * -12);
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
        };
        root.value.addEventListener("mousemove", onMove);
        root.value.addEventListener("mouseleave", onLeave);
        removeTilt = () => {
          root.value?.removeEventListener("mousemove", onMove);
          root.value?.removeEventListener("mouseleave", onLeave);
        };
      }
    }

    cleanup(() => {
      removeWeightFx?.();
      removeTilt?.();
      ctx.revert();
    });
  });

  return (
    <section class="hero" ref={root}>
      <div class="hero-render" aria-hidden="true" />
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
