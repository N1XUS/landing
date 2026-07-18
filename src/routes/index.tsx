import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { About } from "../components/about";
import { Contact } from "../components/contact";
import { Header } from "../components/header";
import { Hero } from "../components/hero";
import { Skills } from "../components/skills";
import { Work } from "../components/work";

export default component$(() => {
  return (
    <>
      <div class="bg-grid" aria-hidden="true" />
      <div class="bg-grain" aria-hidden="true" />
      <Header />
      <main>
        <Hero />
        <About />
        <Skills />
        <Work />
        <Contact />
      </main>
    </>
  );
});

export const head: DocumentHead = {
  title: "Denys Severyn — Full-Stack Engineer",
  meta: [
    {
      name: "description",
      content:
        "Full-stack product engineer shipping production-grade web platforms, enterprise UI systems, and AI features from prototype to production.",
    },
    { property: "og:title", content: "Denys Severyn — Full-Stack Engineer" },
    {
      property: "og:description",
      content:
        "Production-grade platforms, enterprise UI systems, and AI product delivery from prototype to production.",
    },
    { property: "og:type", content: "website" },
    { property: "og:image", content: "https://severyn.pro/icon-512.png" },
  ],
};
