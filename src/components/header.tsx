import {
  $,
  component$,
  useOnWindow,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import gsap from "gsap";
import {
  prefersReducedMotion,
  scrollToTarget,
  scrollToTop,
  startScroll,
  stopScroll,
} from "../lib/motion";
import { assetPath } from "../lib/assets";

const styles = `
.site-header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 100;
  height: var(--header-h);
  background: rgba(23, 23, 23, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid transparent;
  transition: top 0.35s, width 0.35s, border-radius 0.35s, border-color 0.35s;
}
.site-header.scrolled {
  top: 0.75rem;
  width: min(100% - 2rem, 72rem);
  border-radius: 999px;
  border-color: var(--line);
  padding-inline: 0.3rem;
}
@media (prefers-reduced-motion: reduce) {
  .site-header { transition: none; }
}
.header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-logo img { height: 32px; width: auto; }
.header-nav { display: none; }
.menu-btn {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  background: none;
  border: 0;
  color: var(--text);
  cursor: pointer;
  font: inherit;
  margin-right: -1rem;
}
.mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: color-mix(in srgb, var(--bg-sunken) 90%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: grid;
  place-content: center;
  gap: 2rem;
  text-align: center;
  /* Veil: circle reveal expanding from the burger's corner. */
  clip-path: circle(0% at calc(100% - 2.75rem) 2rem);
  visibility: hidden;
  transition:
    clip-path 0.55s cubic-bezier(0.23, 1, 0.32, 1),
    visibility 0s 0.55s;
}
.mobile-menu.open {
  clip-path: circle(150% at calc(100% - 2.75rem) 2rem);
  visibility: visible;
  transition: clip-path 0.55s cubic-bezier(0.23, 1, 0.32, 1);
}
.mobile-menu a {
  color: var(--text);
  font-family: var(--font-display);
  font-size: 2rem;
  opacity: 0;
  translate: 0 20px;
  transition: opacity 0.3s ease, translate 0.35s cubic-bezier(0.23, 1, 0.32, 1);
}
.mobile-menu.open a { opacity: 1; translate: 0 0; }
.mobile-menu.open a:nth-child(1) { transition-delay: 0.16s; }
.mobile-menu.open a:nth-child(2) { transition-delay: 0.22s; }
.mobile-menu.open a:nth-child(3) { transition-delay: 0.28s; }
.mobile-menu.open a:nth-child(4) { transition-delay: 0.34s; }
.burger { display: block; }
.burger line {
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.35s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.25s;
}
.menu-btn.open .bl-1 { transform: translateY(5px) rotate(45deg); }
.menu-btn.open .bl-2 { opacity: 0; }
.menu-btn.open .bl-3 { transform: translateY(-5px) rotate(-45deg); }
@media (prefers-reduced-motion: reduce) {
  .mobile-menu,
  .mobile-menu a,
  .burger line { transition: none; }
  .mobile-menu { clip-path: none; display: none; }
  .mobile-menu.open { clip-path: none; display: grid; }
  .mobile-menu a { opacity: 1; translate: none; }
}
@media (min-width: 768px) {
  .header-nav { display: flex; gap: 2.5rem; }
  .header-nav a {
    position: relative;
    color: var(--muted);
    font-size: 0.9375rem;
    transition: color 0.2s;
  }
  @media (hover: hover) {
    .header-nav a:hover { color: var(--text); }
  }
  .header-nav a::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 100%;
    height: 1px;
    background: var(--accent-bright);
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  }
  @media (hover: hover) {
    .header-nav a:hover::after { transform: scaleX(1); }
  }
  .menu-btn { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .header-nav a::after { transition: none; }
}
`;

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

export const Header = component$(() => {
  useStyles$(styles);
  const scrolled = useSignal(false);
  const menuOpen = useSignal(false);
  const menuBtnRef = useSignal<HTMLButtonElement>();
  const firstLinkRef = useSignal<HTMLAnchorElement>();
  const lastLinkRef = useSignal<HTMLAnchorElement>();

  useOnWindow(
    "scroll",
    $(() => {
      scrolled.value = window.scrollY > 32;
    }),
  );

  // While the menu is open: lock page scroll, focus the first link, and trap
  // Tab/Escape inside it with a plain (non-QRL) listener so preventDefault()
  // fires synchronously.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    const open = track(() => menuOpen.value);
    if (!open) {
      startScroll();
      return;
    }

    stopScroll();
    firstLinkRef.value?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        menuOpen.value = false;
        menuBtnRef.value?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      if (event.shiftKey) {
        if (document.activeElement === firstLinkRef.value) {
          event.preventDefault();
          lastLinkRef.value?.focus();
        }
      } else if (document.activeElement === lastLinkRef.value) {
        event.preventDefault();
        firstLinkRef.value?.focus();
      }
    };

    const menuEl = document.getElementById("mobile-menu");
    menuEl?.addEventListener("keydown", handleKeyDown);
    cleanup(() => {
      menuEl?.removeEventListener("keydown", handleKeyDown);
      // Runs on close (task re-runs before the next execution) and on
      // unmount while the menu is still open, so scrolling is never left
      // locked either way.
      startScroll();
    });
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (
      prefersReducedMotion() ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;
    const links = Array.from(
      document.querySelectorAll<HTMLElement>(".header-nav a"),
    );
    const cleanups = links.map((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        xTo(gsap.utils.clamp(-4, 4, (e.clientX - (r.x + r.width / 2)) * 0.15));
        yTo(gsap.utils.clamp(-3, 3, (e.clientY - (r.y + r.height / 2)) * 0.15));
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        gsap.set(el, { x: 0, y: 0 });
      };
    });
    cleanup(() => cleanups.forEach((fn) => fn()));
  });

  const go = $((href: string) => {
    const wasOpen = menuOpen.value;
    menuOpen.value = false;
    if (wasOpen) {
      // The menu-close scroll unlock normally happens async, via the
      // menuOpen-tracked task below. Do it synchronously here first, or
      // Lenis is still `isStopped` when scrollToTarget() runs and silently
      // no-ops instead of scrolling to the target section.
      startScroll();
    }
    scrollToTarget(href);
    if (wasOpen) {
      menuBtnRef.value?.focus();
    }
  });

  return (
    <>
      <header class={["site-header", { scrolled: scrolled.value }]}>
        <div class="container header-inner">
          <a
            href="#"
            class="header-logo"
            aria-label="Home"
            onClick$={() => scrollToTop()}
            preventdefault:click
          >
            <img
              src={assetPath("logo.png")}
              alt="DS logo"
              width="34"
              height="32"
            />
          </a>
          <nav class="header-nav" aria-label="Main">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                preventdefault:click
                onClick$={() => go(l.href)}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <button
            ref={menuBtnRef}
            class={["menu-btn", { open: menuOpen.value }]}
            aria-label={menuOpen.value ? "Close menu" : "Menu"}
            aria-expanded={menuOpen.value}
            aria-controls="mobile-menu"
            onClick$={() => (menuOpen.value = !menuOpen.value)}
          >
            <svg
              class="burger"
              viewBox="0 0 24 24"
              width="22"
              height="22"
              aria-hidden="true"
            >
              <line class="bl-1" x1="3" y1="7" x2="21" y2="7" />
              <line class="bl-2" x1="3" y1="12" x2="21" y2="12" />
              <line class="bl-3" x1="3" y1="17" x2="21" y2="17" />
            </svg>
          </button>
        </div>
      </header>
      {/* Always mounted so the veil can animate closed; visibility (in CSS)
          keeps it out of the tab order and AT tree while hidden. */}
      <nav
        id="mobile-menu"
        class={["mobile-menu", { open: menuOpen.value }]}
        aria-label="Mobile"
        aria-modal="true"
        role="dialog"
      >
        {LINKS.map((l, i) => (
          <a
            key={l.href}
            ref={
              i === 0
                ? firstLinkRef
                : i === LINKS.length - 1
                  ? lastLinkRef
                  : undefined
            }
            href={l.href}
            preventdefault:click
            onClick$={() => go(l.href)}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </>
  );
});
