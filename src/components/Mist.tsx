import { clientEffect } from "@rivetjs/runtime/dom";

/** The canvas the mist is drawn on. Its shader loads after the page, and only where the film runs. */
export function Mist() {
  clientEffect(
    () => {
      let stop: (() => void) | undefined;
      void import("../mist.ts").then(({ startMist }) => {
        const canvas = document.querySelector<HTMLCanvasElement>(".mist");
        if (canvas) stop = startMist(canvas);
      });
      return () => stop?.();
    },
    { when: "load" },
  );
  return <canvas class="mist" aria-hidden="true" />;
}
