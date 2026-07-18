import { component$, useSignal, useStyles$, useVisibleTask$ } from '@builder.io/qwik';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../lib/motion';
import { MaskedWords } from './masked-words';

const styles = `
.section-heading {
  padding-top: 5rem;
  margin-bottom: 3rem;
}
.sh-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.sh-num {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-size: 0.8125rem;
  letter-spacing: 0.1em;
  color: var(--accent-bright);
}
.sh-rule {
  flex: 1;
  height: 1px;
  background: var(--hairline);
  transform-origin: left center;
}
.section-heading h2 {
  font-size: clamp(2.25rem, 8vw, 4.5rem);
}
@media (min-width: 768px) {
  .section-heading { padding-top: 8rem; margin-bottom: 4rem; }
}
`;

interface SectionHeadingProps {
  num: string;
  title: string;
  id: string;
}

export const SectionHeading = component$<SectionHeadingProps>((props) => {
  useStyles$(styles);
  const root = useSignal<HTMLElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (prefersReducedMotion() || !root.value) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: { trigger: root.value!, start: 'top 75%', once: true },
        })
        .from('.sh-num', { opacity: 0, duration: 0.3 })
        .from('.sh-rule', { scaleX: 0, duration: 0.5, ease: 'power2.out' }, '<0.1')
        .from('.word-inner', { yPercent: 110, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, '<0.15');
    }, root.value);
    cleanup(() => ctx.revert());
  });

  return (
    <div class="section-heading" id={props.id} ref={root}>
      <div class="sh-meta">
        <span class="sh-num">[{props.num}]</span>
        <span class="sh-rule" />
      </div>
      <h2>
        <MaskedWords text={props.title} />
      </h2>
    </div>
  );
});
