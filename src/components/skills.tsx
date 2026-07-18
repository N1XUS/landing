import {
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../lib/motion";
import { ListMark } from "./inline-icons";
import { SectionHeading } from "./section-heading";

const styles = `
.skills-intro {
  max-width: 44rem;
  color: var(--muted);
  font-size: 1.0625rem;
  margin: -1.5rem 0 3rem;
}
.skills-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem 3rem;
}
.sg {
  border-top: 1px solid var(--line);
  padding-top: 1.25rem;
}
.sg-label {
  margin-bottom: 1rem;
  font-weight: 400;
}
.sg-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.sg-list li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9375rem;
  color: var(--text);
}
.sg-list li::before {
  content: none;
}
.sg-list .list-mark {
  flex: 0 0 auto;
  width: 0.875rem;
  height: 0.875rem;
  fill: color-mix(in srgb, var(--accent) 14%, transparent);
  stroke: var(--accent-bright);
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
@media (min-width: 600px) {
  .skills-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 900px) {
  .skills-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
`;

interface SkillGroup {
  label: string;
  items: string[];
}

const GROUPS: SkillGroup[] = [
  { label: "Languages", items: ["TypeScript", "JavaScript", "C#"] },
  { label: "Front-End", items: ["Angular", "React", "Vue", "Qwik", "Ionic"] },
  { label: "Styling", items: ["SCSS", "Tailwind CSS"] },
  { label: "Back-End", items: ["ASP.NET Core", "Node.js", "Microservices"] },
  { label: "Data & Messaging", items: ["Redis", "Kafka"] },
  { label: "Tooling & Delivery", items: ["Nx", "Delivery Pipelines"] },
];

export const Skills = component$(() => {
  useStyles$(styles);
  const root = useSignal<HTMLElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (prefersReducedMotion() || !root.value) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".sg", {
        opacity: 0,
        y: 28,
        duration: 0.6,
        stagger: 0.09,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".skills-grid",
          start: "top 80%",
          once: true,
        },
      });
    }, root.value);
    cleanup(() => ctx.revert());
  });

  return (
    <section class="skills container" ref={root}>
      <SectionHeading num="02" title="Skills" id="skills" />
      <p class="skills-intro">
        The stack I build and ship with — refined over a decade of production
        work, from enterprise component libraries to event-driven back ends.
      </p>
      <div class="skills-grid">
        {GROUPS.map((g) => (
          <div class="sg" key={g.label}>
            <h3 class="sg-label mono-label">{g.label}</h3>
            <ul class="sg-list">
              {g.items.map((item) => (
                <li key={item}>
                  <ListMark />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
});
