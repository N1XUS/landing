import { component$, Slot, useVisibleTask$ } from '@builder.io/qwik';
import { initMotion } from '../lib/motion';

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    cleanup(initMotion());
  });
  return <Slot />;
});
