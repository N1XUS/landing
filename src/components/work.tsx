import {
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../lib/motion";
import { SectionHeading } from "./section-heading";
import { MotifGrid, MotifPeaks, MotifStack, MotifNet } from "./project-motifs";
import { ExternalArrow, SeparatorMark } from "./inline-icons";

const styles = `
.work-cards { display: grid; gap: 2.5rem; }
.work-card {
  position: sticky;
  top: calc(var(--header-h) + 2rem);
  background: var(--bg-sunken);
  border: 1px solid var(--line);
  border-radius: 1rem;
  padding: 2rem 1.5rem;
  transform-origin: center top;
  will-change: transform;
  overflow: hidden;
}
.wc-index {
  position: absolute;
  top: 0.5rem;
  right: 1.25rem;
  font-family: var(--font-display);
  font-size: clamp(4rem, 10vw, 7rem);
  font-weight: 700;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px rgba(250, 250, 250, 0.09);
  pointer-events: none;
  user-select: none;
}
.wc-motif {
  position: absolute;
  right: 1.5rem;
  bottom: 1.25rem;
  width: clamp(110px, 22vw, 200px);
  opacity: 0.8;
  pointer-events: none;
}
.wc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.75rem;
}
.wc-tags span {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
}
.wc-title { font-size: clamp(1.75rem, 6vw, 3rem); margin-bottom: 0.75rem; }
.wc-desc { color: var(--muted); max-width: 34rem; }
.wc-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin: 2rem 0 0;
  padding-top: 1.5rem;
  border-top: 1px solid var(--line);
  max-width: 34rem;
}
.wc-meta dt {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 0.375rem;
}
.wc-meta dd { margin: 0; font-size: 0.875rem; color: var(--text); }
.wc-stack {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
}
.wc-stack-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.wc-stack .separator-mark {
  width: 1.1rem;
  height: 0.7rem;
  fill: color-mix(in srgb, var(--accent) 18%, transparent);
  stroke: var(--accent-bright);
  stroke-width: 1.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.wc-link {
  margin-top: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  /* --accent (the global anchor default) is 4.27:1 on --bg-sunken, just
     under AA's 4.5:1. --accent-bright clears it comfortably (~8.6:1). */
  color: var(--accent-bright);
}
.wc-link .external-mark {
  width: 0.9rem;
  height: 0.9rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.wc-dim {
  position: absolute;
  inset: 0;
  background: var(--bg-sunken);
  border-radius: inherit;
  opacity: 0;
  pointer-events: none;
}
/* Accent glows centered on opposite corners so half of each is clipped
   away by the card's overflow. Top-left one is 2x the bottom-right. */
.work-card::before {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  width: clamp(280px, 42%, 520px);
  aspect-ratio: 1;
  transform: translate(50%, 50%);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--accent) 14%, transparent) 0%,
    transparent 68%
  );
  pointer-events: none;
}
.work-card::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: clamp(560px, 84%, 1040px);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--accent) 14%, transparent) 0%,
    transparent 68%
  );
  pointer-events: none;
}
@media (min-width: 768px) {
  .work-card { padding: 3rem; }
}
@media (hover: hover) {
  .work-card { transition: border-color 0.3s; }
  .work-card:hover { border-color: var(--accent-deep); }
  .wc-link:hover { color: var(--text); }
}
@media (max-width: 767px) {
  .wc-motif { display: none; }
}
`;

interface Project {
  title: string;
  desc: string;
  tags: string[];
  href: string;
  linkLabel: string;
  meta: { role: string; stack: string[]; focus: string };
  Motif: typeof MotifGrid;
}

// Chronological: earliest engagement first, current role last.
const PROJECTS: Project[] = [
  {
    title: "Freelance",
    desc: "End-to-end delivery for founders and product teams — front-end builds, back-end services, and the integrations that tie them together.",
    tags: ["Front-End", "Back-End", "Consulting"],
    href: "https://github.com/N1XUS",
    linkLabel: "github.com/N1XUS",
    meta: {
      role: "Independent",
      stack: ["Full-stack", "APIs"],
      focus: "Ship end to end",
    },
    Motif: MotifNet,
  },
  {
    title: "Apptimized",
    desc: "SaaS platform for enterprise application packaging and testing. Led the team across the stack, from .NET services to the product front end.",
    tags: ["SaaS", "Enterprise", "Full-Stack"],
    href: "https://apptimized.com",
    linkLabel: "apptimized.com",
    meta: {
      role: "Team Lead",
      stack: ["C#", "TypeScript"],
      focus: "Platform delivery",
    },
    Motif: MotifStack,
  },
  {
    title: "Enterprise UI systems",
    desc: "Open-source component-library work: components, theming, and fixes shipped into enterprise products.",
    tags: ["Open Source", "UI Systems", "Design Systems"],
    href: "https://github.com/SAP/fundamental-ngx",
    linkLabel: "View component-library work",
    meta: {
      role: "Contributor",
      stack: ["TypeScript", "SCSS"],
      focus: "Components & theming",
    },
    Motif: MotifGrid,
  },
  {
    title: "PeakVentures",
    desc: "Full-stack product engineering — building and scaling web products, from architecture to UI, with a growing focus on AI-driven features.",
    tags: ["Full-Stack", "Product", "AI"],
    href: "https://peakventures.co",
    linkLabel: "peakventures.co",
    meta: {
      role: "Engineer",
      stack: ["TS", "Vue", "Node", "AI", "C#"],
      focus: "Product platforms",
    },
    Motif: MotifPeaks,
  },
];

export const Work = component$(() => {
  useStyles$(styles);
  const root = useSignal<HTMLElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (prefersReducedMotion() || !root.value) return;
    gsap.registerPlugin(ScrollTrigger);
    // Keep the scrub end offset in sync with the CSS sticky offset
    // (`top: calc(var(--header-h) + 2rem)`) so the two never desync.
    const headerH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--header-h",
        ),
      ) || 64;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".work-card");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        // Dim via a solid overlay, not card opacity: cards are short enough
        // that several are on screen at once, and a translucent card lets
        // the one underneath bleed through the one covering it.
        const dim = card.querySelector(".wc-dim");
        gsap
          .timeline({
            scrollTrigger: {
              trigger: cards[i + 1],
              start: "top bottom",
              // 2rem = 32px at root font-size 16, matching the CSS sticky offset above.
              end: `top ${headerH + 32}px`,
              scrub: true,
            },
          })
          .to(card, { scale: 0.94, ease: "none" }, 0)
          .to(dim, { opacity: 0.7, ease: "none" }, 0);
      });
    }, root.value);
    cleanup(() => ctx.revert());
  });

  return (
    <section class="work container" ref={root}>
      <SectionHeading num="03" title="Selected Work" id="work" />
      <div class="work-cards">
        {PROJECTS.map((p, i) => (
          <article class="work-card" key={p.title}>
            <span class="wc-index" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div class="wc-motif">
              <p.Motif />
            </div>
            <div class="wc-tags">
              {p.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <h3 class="wc-title">{p.title}</h3>
            <p class="wc-desc">{p.desc}</p>
            <dl class="wc-meta">
              <div>
                <dt>Role</dt>
                <dd>{p.meta.role}</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd class="wc-stack">
                  {p.meta.stack.map((item, index) => (
                    <span class="wc-stack-item" key={item}>
                      {index > 0 && <SeparatorMark />}
                      <span>{item}</span>
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt>Focus</dt>
                <dd>{p.meta.focus}</dd>
              </div>
            </dl>
            <div class="wc-dim" aria-hidden="true" />
            <a
              class="wc-link"
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{p.linkLabel}</span>
              <ExternalArrow />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
});
