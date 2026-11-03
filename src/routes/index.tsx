import { Icon } from "@rivetjs/kit/icon";
import { ArrowDown, ArrowUpRight } from "lucide";
import { Letters } from "../components/Letters.tsx";
import { SmoothScroll } from "../components/SmoothScroll.tsx";

const TITLE = "Denys Severyn, full-stack product engineer";
const DESCRIPTION =
  "Full-stack product engineer. Ten years of enterprise interfaces, SaaS platforms, open-source UI and AI features in production.";

export const head = {
  title: TITLE,
  meta: [
    { name: "description", content: DESCRIPTION },
    { name: "color-scheme", content: "dark" },
    { name: "theme-color", content: "#000000" },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESCRIPTION },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://severyn.pro/" },
    { property: "og:image", content: "https://severyn.pro/og.jpg" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
  links: [
    { rel: "canonical", href: "https://severyn.pro/" },
    { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
    { rel: "icon", href: "/icon-192.png", type: "image/png", sizes: "192x192" },
    { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  ],
};

const INTRO = "I care about how a product works, how it feels, and everything that connects the two.";

// Down the stack, from what people touch to the tools underneath. Each skill names the work that proves it.
const SKILLS = [
  {
    name: "Interface",
    tools: "TypeScript, Angular, React, Vue, Qwik, Ionic, SCSS, Tailwind CSS",
    proof: "Components, theming and fixes for SAP's Fundamental NGX, the Angular library behind enterprise products.",
    url: "https://github.com/SAP/fundamental-ngx",
    label: "Contributions",
  },
  {
    name: "Back end",
    tools: "C#, ASP.NET Core, Node.js, Microservices, Redis, Kafka",
    proof: "Team lead on Apptimized, an enterprise SaaS platform for application packaging and testing, from .NET services to the product front end.",
    url: "https://apptimized.com",
    label: "apptimized.com",
  },
  {
    name: "Delivery",
    tools: "Architecture, APIs, Integrations, E-commerce, Nx, Delivery pipelines",
    proof: "End to end with founders and product teams: front ends, back-end services and the integrations between them.",
    url: "https://github.com/N1XUS",
    label: "GitHub",
  },
  {
    name: "AI",
    tools: "Product AI features, AI chat interfaces, MCP servers",
    proof: "At PeakVentures: building and scaling web products from architecture to interface, and taking AI features from prototype to production.",
    url: "https://peakventures.co",
    label: "peakventures.co",
  },
  {
    name: "Frameworks",
    tools: "Rust, WebAssembly, Compilers, Signals, Streaming SSR, Resumability",
    proof: "Author of Rivet, a compiled, resumable JSX framework in alpha: a Rust compiler, 20 npm packages and benchmarks published with the losses.",
    url: "https://rivetjs.severyn.pro",
    label: "rivetjs.severyn.pro",
  },
];

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <a class="skip" href="#skills">
        Skip to skills
      </a>
      <div class="progress" aria-hidden="true" />
      <img class="threads" src="/threads.svg" alt="" />
      <div class="bead" aria-hidden="true">
        <div class="ripple-wrap">
          <div class="ripple" />
        </div>
        <div class="morph">
          <div class="flesh" />
        </div>
      </div>
      <header class="top">
        <a class="brand" href="#top">
          Denys Severyn
        </a>
        <nav aria-label="Main">
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main id="top">
        <section class="scene statement" aria-labelledby="title">
          <div class="stage">
            <h1 id="title" class="sr-only">
              {TITLE}
            </h1>
            <p class="big">
              <span class="say say-1">
                <Letters text="Any problem." />
              </span>{" "}
              <span class="say say-2">
                <Letters text="Any stack." />
              </span>{" "}
              <span class="say say-3">
                <Letters text="Shipped." />
              </span>
            </p>
            <p class="cue">
              Full-stack product engineer. Ten years.
              <Icon icon={ArrowDown} size={20} />
            </p>
          </div>
        </section>

        <section class="scene intro" aria-label="About">
          <div class="stage">
            <p class="words">
              <Letters text={INTRO} />
            </p>
          </div>
        </section>

        <section id="skills" aria-labelledby="skills-title">
          <h2 id="skills-title" class="sr-only">
            Skills
          </h2>
          {SKILLS.map((skill) => (
            <article class="scene chapter">
              <div class="stage">
                <h3 class="name">
                  <Letters text={skill.name} />
                </h3>
                <p class="tools">
                  <Letters text={skill.tools} />
                </p>
                <div class="detail">
                  <p class="text">{skill.proof}</p>
                  <a class="go" href={skill.url}>
                    {skill.label}
                    <Icon icon={ArrowUpRight} size={20} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer class="contact" id="contact">
        <p class="contact-lead">Have something to build?</p>
        <a class="mail" href="mailto:denys@severyn.pro">
          <Letters text="denys@severyn.pro" />
        </a>
        <div class="foot">
          <span>© 2026 Denys Severyn</span>
          <a href="https://github.com/N1XUS">GitHub</a>
        </div>
      </footer>
    </>
  );
}
