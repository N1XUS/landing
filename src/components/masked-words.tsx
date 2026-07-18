import { component$, useStyles$ } from '@builder.io/qwik';
import { splitWords } from '../lib/split';

const styles = `
.masked-words .word {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
}
.masked-words .word-inner {
  display: inline-block;
  will-change: transform;
}
`;

interface MaskedWordsProps {
  text: string;
  class?: string;
}

export const MaskedWords = component$<MaskedWordsProps>((props) => {
  useStyles$(styles);
  return (
    <span class={['masked-words', props.class]}>
      {splitWords(props.text)
        .map((word, i) => (
          <span class="word" key={i}>
            <span class="word-inner">{word}</span>
          </span>
        ))
        .reduce<any[]>((acc, el, i) => (i ? [...acc, ' ', el] : [el]), [])}
    </span>
  );
});
