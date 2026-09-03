import {
  $,
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { assetPath } from "../lib/assets";
import { prefersReducedMotion } from "../lib/motion";
import { ExternalArrow } from "./inline-icons";
import { SectionHeading } from "./section-heading";

const styles = `
.building-grid {
  display: grid;
  gap: 3rem;
  align-items: center;
}
.bl-eyebrow {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-bottom: 1.25rem;
}
.bl-eyebrow .idx { color: var(--accent-2-text); }
.bl-title {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  margin-bottom: 0.5rem;
}
.bl-tagline {
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 2.6vw, 1.625rem);
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--accent-bright);
  max-width: 22ch;
}
.bl-lead {
  margin-top: 1.25rem;
  color: var(--muted);
  font-size: 1.0625rem;
  max-width: 40rem;
}
.bl-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem 2rem;
  margin: 2.5rem 0 0;
  padding-top: 1.5rem;
  border-top: 1px solid var(--line);
  max-width: 34rem;
}
.bl-stats dt {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  order: 1;
}
.bl-stats dd {
  margin: 0 0 0.25rem;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.bl-stats > div { display: flex; flex-direction: column; }
.bl-stats .suffix { color: var(--accent-2-text); }
.bl-install {
  margin-top: 2.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 100%;
  padding: 0.6rem 0.5rem 0.6rem 1rem;
  border: 1px solid var(--line);
  border-radius: 0.625rem;
  background: var(--bg-raised);
  font-family: var(--font-mono);
  font-size: 0.875rem;
}
.bl-install .prompt { color: var(--accent-2-text); user-select: none; }
.bl-install code { color: var(--text); white-space: nowrap; overflow: auto; }
.bl-copy {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 5.5rem;
  justify-content: center;
  padding: 0.4rem 0.7rem;
  border: 0;
  border-radius: 0.4rem;
  background: color-mix(in srgb, var(--text) 8%, transparent);
  color: var(--text);
  font: inherit;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}
.bl-copy.copied { background: color-mix(in srgb, var(--accent) 22%, transparent); color: var(--accent-bright); }
@media (hover: hover) {
  .bl-copy:hover { background: color-mix(in srgb, var(--text) 14%, transparent); }
}
.bl-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 2rem;
}
.bl-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: var(--accent-bright);
}
.bl-links .external-mark {
  width: 0.9rem;
  height: 0.9rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
@media (hover: hover) {
  .bl-links a:hover { color: var(--text); }
}
/* Browser frame around the live-site capture. The frame tilts toward the
   copy and settles flat as it scrolls into view. */
.mf-stage {
  position: relative;
  perspective: 1600px;
}
.mf-stage::before {
  content: '';
  position: absolute;
  inset: 10% -10% -10% 0;
  border-radius: 50%;
  background: radial-gradient(ellipse at 60% 60%, var(--glow-2) 0%, var(--glow-1) 45%, transparent 72%);
  filter: blur(24px);
  pointer-events: none;
}
.mf-frame {
  position: relative;
  border-radius: 0.875rem;
  overflow: hidden;
  background: var(--bg-raised);
  box-shadow: var(--frame-shadow);
  transform-origin: left center;
  will-change: transform;
}
.mf-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.25rem;
  padding: 0 0.875rem;
  border-bottom: 1px solid var(--line);
  background: var(--bg-raised);
}
.mf-bar i {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background: var(--line);
}
.mf-url {
  flex: 1;
  margin-left: 0.5rem;
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  background: var(--bg);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  color: var(--muted);
  text-align: center;
}
.mf-shot img { width: 100%; height: auto; }
:root:not([data-theme='light']) .mf-shot-light { display: none; }
:root[data-theme='light'] .mf-shot-dark { display: none; }
@media (min-width: 900px) {
  .building-grid {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: 4rem;
  }
  .mf-stage { margin-right: -6vw; }
  .mf-frame { transform: rotateY(-10deg) rotateX(2deg); }
}
@media (prefers-reduced-motion: reduce) {
  .mf-frame { transform: none; }
}
`;

interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

// Figures from malva-ui.severyn.pro (home stats), 2026-09.
const STATS: Stat[] = [
  { value: 80, suffix: "+", label: "Components" },
  { value: 14, label: "Locales" },
  { value: 6, label: "Full showcases" },
  { value: 100, suffix: "%", label: "Reduced-motion coverage" },
];

const INSTALL = "ng add @malva-ui/core";

const shot = (theme: "dark" | "light") => ({
  avif: `${assetPath(`img/malva-${theme}-720.avif`)} 720w, ${assetPath(`img/malva-${theme}-1440.avif`)} 1440w`,
  webp: `${assetPath(`img/malva-${theme}-720.webp`)} 720w, ${assetPath(`img/malva-${theme}-1440.webp`)} 1440w`,
  src: assetPath(`img/malva-${theme}-1440.webp`),
});

export const Building = component$(() => {
  useStyles$(styles);
  const root = useSignal<HTMLElement>();
  const copied = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (prefersReducedMotion() || !root.value) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Count up from zero once; the numbers are server-rendered in their
      // final state so nothing depends on this running.
      const nums = gsap.utils.toArray<HTMLElement>(".bl-stats .num");
      nums.forEach((el) => {
        const end = Number(el.dataset.value);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end,
          duration: 1.4,
          ease: "power3.out",
          snap: { v: 1 },
          onUpdate: () => {
            el.textContent = String(obj.v);
          },
          scrollTrigger: { trigger: ".bl-stats", start: "top 85%", once: true },
        });
      });
      gsap.from(
        ".bl-eyebrow, .bl-title, .bl-tagline, .bl-lead, .bl-stats, .bl-install, .bl-links",
        {
          opacity: 0,
          y: 20,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".building-grid",
            start: "top 80%",
            once: true,
          },
        },
      );
      const mq = window.matchMedia("(min-width: 900px)");
      if (mq.matches) {
        gsap.fromTo(
          ".mf-frame",
          { rotateY: -10, rotateX: 2, y: 40 },
          {
            rotateY: -2,
            rotateX: 0,
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: ".mf-stage",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    }, root.value);
    cleanup(() => ctx.revert());
  });

  const copy = $(async () => {
    try {
      await navigator.clipboard.writeText(INSTALL);
      copied.value = true;
      setTimeout(() => (copied.value = false), 1600);
    } catch {
      // Clipboard blocked: the command is plain text, selectable by hand.
    }
  });

  const dark = shot("dark");
  const light = shot("light");

  return (
    <section class="building container" ref={root}>
      <SectionHeading num="02" title="Building" id="building" />
      <div class="building-grid">
        <div class="bl-copy-block">
          <p class="bl-eyebrow mono-label">
            <span class="idx">Open source</span>
            <span>Angular 20+</span>
            <span>WCAG AA</span>
          </p>
          <h3 class="bl-title">Malva UI</h3>
          <p class="bl-tagline">Angular components that feel finished.</p>
          <p class="bl-lead">
            A signal-first component library I design and maintain in the open:
            accessible interactions, one theme system for light and dark, and
            six full product showcases built from the real controls.
          </p>
          <dl class="bl-stats">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>
                  <span class="num" data-value={s.value}>
                    {s.value}
                  </span>
                  {s.suffix && <span class="suffix">{s.suffix}</span>}
                </dd>
              </div>
            ))}
          </dl>
          <div class="bl-install">
            <span class="prompt" aria-hidden="true">
              $
            </span>
            <code>{INSTALL}</code>
            <button
              type="button"
              class={["bl-copy", { copied: copied.value }]}
              onClick$={copy}
              aria-live="polite"
            >
              {copied.value ? "Copied" : "Copy"}
            </button>
          </div>
          <div class="bl-links">
            <a
              href="https://malva-ui.severyn.pro"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>malva-ui.severyn.pro</span>
              <ExternalArrow />
            </a>
            <a
              href="https://github.com/N1XUS/malva-ui"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>GitHub</span>
              <ExternalArrow />
            </a>
          </div>
        </div>
        <div class="mf-stage">
          <div class="mf-frame">
            <div class="mf-bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span class="mf-url">malva-ui.severyn.pro</span>
            </div>
            <picture class="mf-shot mf-shot-dark">
              <source
                type="image/avif"
                srcset={dark.avif}
                sizes="(min-width: 900px) 58vw, 100vw"
              />
              <source
                type="image/webp"
                srcset={dark.webp}
                sizes="(min-width: 900px) 58vw, 100vw"
              />
              <img
                src={dark.src}
                alt="Malva UI home page in its dark theme: headline “Build Angular products that feel…” beside a 3D collage of the library's controls"
                width="1440"
                height="795"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <picture class="mf-shot mf-shot-light">
              <source
                type="image/avif"
                srcset={light.avif}
                sizes="(min-width: 900px) 58vw, 100vw"
              />
              <source
                type="image/webp"
                srcset={light.webp}
                sizes="(min-width: 900px) 58vw, 100vw"
              />
              <img
                src={light.src}
                alt="Malva UI home page in its light theme: headline “Build Angular products that feel…” beside a 3D collage of the library's controls"
                width="1440"
                height="795"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
});
