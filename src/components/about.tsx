import {
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../lib/motion";
import { splitWords } from "../lib/split";

const styles = `
.about {
  padding-top: 6rem;
  padding-bottom: 4rem;
}
.about-grid { display: block; }
.about-label {
  margin-bottom: 2.5rem;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0.12em;
}
.about-text {
  font-family: var(--font-display);
  font-size: clamp(1.375rem, 3.4vw, 2.125rem);
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: -0.01em;
  max-width: 26em;
}
.about-text .aw { display: inline-block; }
.about-detail {
  margin-top: 2.5rem;
  max-width: 44rem;
  color: var(--muted);
  font-size: 1.0625rem;
}
.about-now {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--line);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  align-items: baseline;
}
.about-now .now-value {
  font-size: 0.9375rem;
  color: var(--text);
}
@media (min-width: 900px) {
  .about { padding-top: 9rem; padding-bottom: 6rem; }
  .about-grid {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 4rem;
  }
  .about-label {
    position: sticky;
    top: calc(var(--header-h) + 3rem);
    align-self: start;
    margin-bottom: 0;
  }
}
`;

const LEAD =
  "I design the system and ship the product — component libraries for enterprises, platforms that scale, and AI features that earn their place.";

const DETAIL =
  "A decade across the stack: enterprise front ends at scale, open-source UI systems, SaaS platform architecture at Apptimized, and freelance builds for e-commerce.";

export const About = component$(() => {
  useStyles$(styles);
  const root = useSignal<HTMLElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (prefersReducedMotion() || !root.value) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".about-text .aw", {
        // 0.5 floor keeps >=4.5:1 contrast at the mobile clamp size
        opacity: 0.5,
        stagger: 0.02,
        ease: "none",
        scrollTrigger: {
          trigger: ".about-text",
          start: "top 80%",
          end: "bottom 45%",
          scrub: true,
        },
      });
      gsap.from(".about-detail, .about-now", {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".about-detail",
          start: "top 85%",
          once: true,
        },
      });
    }, root.value);
    cleanup(() => ctx.revert());
  });

  return (
    <section class="about container" id="about" ref={root}>
      <div class="about-grid">
        <h2 class="about-label mono-label">
          <span class="idx">[01]</span> — About
        </h2>
        <div>
          <p class="about-text">
            {splitWords(LEAD)
              .map((w, i) => (
                <span class="aw" key={i}>
                  {w}
                </span>
              ))
              .reduce<any[]>(
                (acc, el, i) => (i ? [...acc, " ", el] : [el]),
                [],
              )}
          </p>
          <p class="about-detail">{DETAIL}</p>
          <p class="about-now">
            <span class="mono-label">Currently</span>
            <span class="now-value">
              Engineering AI-driven products at PeakVentures.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
});
