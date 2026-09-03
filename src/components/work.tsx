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
import { ExternalArrow, SeparatorMark } from "./inline-icons";

type Cover = "strata" | "peaks" | "grid" | "net";
const COVERS: Cover[] = ["strata", "peaks", "grid", "net"];

/** image-set() for one cover render; falls back to plain WebP. */
const coverImage = (cover: Cover, theme: "dark" | "light") => {
  const base = `/img/cover-${cover}-${theme}-1024`;
  return `background-image: url(${base}.webp);
  background-image: image-set(url(${base}.avif) type("image/avif"), url(${base}.webp) type("image/webp"));`;
};

const styles = `
.work-cards { display: grid; gap: 2.5rem; }
.work-card {
  position: sticky;
  top: calc(var(--header-h) + 2rem);
  display: grid;
  gap: 1.75rem;
  background: var(--card-bg);
  border: 1px solid var(--line);
  border-radius: 1rem;
  padding: 1.5rem;
  transform-origin: center top;
  will-change: transform;
  overflow: hidden;
}
.wc-body { position: relative; z-index: 1; min-width: 0; }
.wc-index {
  position: absolute;
  top: 0.5rem;
  right: 1.25rem;
  z-index: 1;
  font-family: var(--font-display);
  font-size: clamp(4rem, 10vw, 7rem);
  font-weight: 700;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px var(--ghost-stroke);
  pointer-events: none;
  user-select: none;
}
/* Cover render: square, its ground blended away so the glass sits on the
   card's own surface. */
.wc-cover {
  position: relative;
  z-index: 1;
  aspect-ratio: 16 / 10;
  border-radius: 0.75rem;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  mix-blend-mode: var(--render-blend);
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
${COVERS.map(
  (c) => `
.work-card[data-cover='${c}'] .wc-cover { ${coverImage(c, "dark")} }
:root[data-theme='light'] .work-card[data-cover='${c}'] .wc-cover { ${coverImage(c, "light")} }`,
).join("")}
.wc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
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
  /* --accent (the global anchor default) is 4.27:1 on the dark card, just
     under AA's 4.5:1. --accent-bright clears it in both themes. */
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
  z-index: 2;
  background: var(--card-bg);
  border-radius: inherit;
  opacity: 0;
  pointer-events: none;
}
/* Glows centered on opposite corners so half of each is clipped away by
   the card's overflow: accent top-left, coral bottom-right under the
   render's light leak. */
.work-card::before,
.work-card::after {
  content: '';
  position: absolute;
  aspect-ratio: 1;
  border-radius: 50%;
  pointer-events: none;
}
.work-card::before {
  right: 0;
  bottom: 0;
  width: clamp(320px, 48%, 620px);
  transform: translate(45%, 45%);
  background: radial-gradient(circle, var(--glow-2) 0%, transparent 66%);
}
.work-card::after {
  left: 0;
  top: 0;
  width: clamp(560px, 84%, 1040px);
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, var(--glow-1) 0%, transparent 68%);
}
@media (min-width: 768px) {
  .work-card {
    grid-template-columns: minmax(0, 1fr) clamp(220px, 30vw, 360px);
    align-items: center;
    gap: 3rem;
    padding: 3rem;
  }
  .wc-cover { aspect-ratio: 1; }
}
@media (hover: hover) {
  .work-card { transition: border-color 0.3s; }
  .work-card:hover { border-color: var(--accent-deep); }
  .work-card:hover .wc-cover { transform: scale(1.04); }
  .wc-link:hover { color: var(--text); }
}
@media (prefers-reduced-motion: reduce) {
  .wc-cover { transition: none; }
  .work-card:hover .wc-cover { transform: none; }
}
`;

interface Project {
  title: string;
  desc: string;
  tags: string[];
  href: string;
  linkLabel: string;
  meta: { role: string; stack: string[]; focus: string };
  cover: Cover;
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
    cover: "net",
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
    cover: "strata",
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
    cover: "grid",
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
    cover: "peaks",
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
      <SectionHeading num="04" title="Selected Work" id="work" />
      <div class="work-cards">
        {PROJECTS.map((p, i) => (
          <article class="work-card" key={p.title} data-cover={p.cover}>
            <span class="wc-index" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div class="wc-body">
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
              <a
                class="wc-link"
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{p.linkLabel}</span>
                <ExternalArrow />
              </a>
            </div>
            <div class="wc-cover" aria-hidden="true" />
            <div class="wc-dim" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  );
});
