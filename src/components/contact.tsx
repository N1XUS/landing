import {
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion, scrollToTop } from "../lib/motion";
import { ExternalArrow, SeparatorMark, UpArrow } from "./inline-icons";
import { MaskedWords } from "./masked-words";
import { SectionHeading } from "./section-heading";

const styles = `
.contact-heading {
  font-size: clamp(2.5rem, 9vw, 6.5rem);
  letter-spacing: -0.03em;
  margin-bottom: 3rem;
  max-width: 12ch;
}
.contact-email-big {
  position: relative;
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.6rem, 6vw, 4.75rem);
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: transparent;
  -webkit-text-stroke: 1px var(--accent-bright);
  text-decoration: none;
  word-break: break-all;
}
/* The global a:hover rule (0,1,1) outranks the class (0,1,0) and would
   instantly paint the base text solid on hover, hiding the sweep. */
.contact-email-big:hover {
  color: transparent;
}
/* Stroke-only text is invisible in browsers that don't support
   -webkit-text-stroke (its accessible contrast depends entirely on the
   stroke). Fall back to solid fill so the email stays legible there. */
@supports not (-webkit-text-stroke: 1px black) {
  .contact-email-big,
  .contact-email-big:hover { color: var(--accent-bright); }
}
/* Gradient text fill that sweeps in from the left: the overlay's gradient
   is twice the element width, with the colored half parked off to the left;
   animating background-position slides it across the glyphs. */
.contact-email-big .ce-fill {
  position: absolute;
  inset: 0;
  color: transparent;
  -webkit-text-stroke: 0;
  background: linear-gradient(
    90deg,
    var(--accent-hover) 0% 45%,
    transparent 55% 100%
  );
  background-size: 220% 100%;
  background-position: 100% 0;
  -webkit-background-clip: text;
  background-clip: text;
  transition: background-position 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  user-select: none;
  pointer-events: none;
}
@media (hover: hover) {
  .contact-email-big:hover .ce-fill { background-position: 0% 0; }
}
.contact-email-big:focus-visible { outline: 2px solid var(--accent-bright); outline-offset: 6px; }
.contact-email-big:focus-visible .ce-fill { background-position: 0% 0; }
@media (prefers-reduced-motion: reduce) {
  .contact-email-big .ce-fill { transition: none; }
}
.contact-links {
  display: flex;
  gap: 2rem;
  margin-top: 2.5rem;
}
.contact-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
@media (hover: hover) {
  .contact-links a:hover { color: var(--text); }
}
.site-footer {
  margin-top: 7rem;
  padding: 2rem 0;
  border-top: 1px solid var(--line);
  display: grid;
  gap: 1rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--muted);
}
.site-footer a { color: var(--muted); }
.built-with {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.built-with .separator-mark {
  width: 1rem;
  height: 0.625rem;
  fill: color-mix(in srgb, var(--accent) 18%, transparent);
  stroke: var(--accent-bright);
  stroke-width: 1.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.contact-links .external-mark,
.back-top .up-mark {
  width: 0.875rem;
  height: 0.875rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.back-top {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 0;
  color: var(--muted);
  cursor: pointer;
  font: inherit;
  letter-spacing: inherit;
  padding: 0;
  text-align: left;
}
@media (hover: hover) {
  .site-footer a:hover, .back-top:hover { color: var(--text); }
}
@media (min-width: 768px) {
  .site-footer {
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 2.5rem;
  }
}
.contact-bottom { padding-bottom: 0; }
`;

export const Contact = component$(() => {
  useStyles$(styles);
  const root = useSignal<HTMLElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (prefersReducedMotion() || !root.value) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".contact-heading",
            start: "top 80%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        })
        .from(".contact-heading .word-inner", {
          yPercent: 110,
          duration: 0.8,
          stagger: 0.08,
        })
        .from(
          ".contact-email-big",
          { y: 28, opacity: 0, duration: 0.6 },
          "-=0.4",
        )
        .from(".contact-links", { y: 16, opacity: 0, duration: 0.5 }, "-=0.35")
        .from(".site-footer", { opacity: 0, duration: 0.6 }, "-=0.2");
    }, root.value);
    cleanup(() => ctx.revert());
  });

  return (
    <section class="contact container contact-bottom" ref={root}>
      <SectionHeading num="04" title="Contact" id="contact" />
      <h2 class="contact-heading">
        <MaskedWords text={"Let’s build something."} />
      </h2>
      <a class="contact-email-big" href="mailto:denys@severyn.pro">
        denys@severyn.pro
        <span class="ce-fill" aria-hidden="true">
          denys@severyn.pro
        </span>
      </a>
      <div class="contact-links">
        <a
          href="https://github.com/N1XUS"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>GitHub</span>
          <ExternalArrow />
        </a>
      </div>
      <footer class="site-footer">
        <span>© 2026 Denys Severyn</span>
        <span class="built-with">
          <span>Built with Qwik</span>
          <SeparatorMark />
          <span>GSAP</span>
          <SeparatorMark />
          <span>Lenis</span>
        </span>
        <button class="back-top" onClick$={() => scrollToTop()}>
          <span>Back to top</span>
          <UpArrow />
        </button>
      </footer>
    </section>
  );
});
