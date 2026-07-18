import { component$, useStyles$ } from '@builder.io/qwik';
import { splitLetters } from '../lib/split';

const styles = `
.split-letters { display: inline-block; }
.sl-word { display: inline-block; white-space: nowrap; }
.sl-letter { display: inline-block; will-change: transform; }
`;

interface SplitLettersProps {
  text: string;
  class?: string;
}

/** Per-letter spans grouped by word. Wrap in an element carrying aria-label;
 *  this component's output is aria-hidden. */
export const SplitLetters = component$<SplitLettersProps>((props) => {
  useStyles$(styles);
  return (
    <span class={['split-letters', props.class]} aria-hidden="true">
      {splitLetters(props.text)
        .map((letters, wi) => (
          <span class="sl-word" key={wi}>
            {letters.map((l, li) => (
              <span class="sl-letter" key={li}>
                {l}
              </span>
            ))}
          </span>
        ))
        .reduce<any[]>((acc, el, i) => (i ? [...acc, ' ', el] : [el]), [])}
    </span>
  );
});
