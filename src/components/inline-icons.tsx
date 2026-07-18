import { component$ } from "@builder.io/qwik";

export const EyebrowMark = component$(() => (
  <svg
    class="eyebrow-mark"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M4 12h7" />
    <path d="M13 5l7 7-7 7" />
  </svg>
));

export const ProofMark = component$(() => (
  <svg
    class="proof-mark"
    viewBox="0 0 18 18"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M9 2.4 14 5v3.8c0 3.1-1.9 5.1-5 6.4-3.1-1.3-5-3.3-5-6.4V5l5-2.6Z" />
    <path d="m6.5 8.9 1.7 1.7 3.6-4" />
  </svg>
));

export const ListMark = component$(() => (
  <svg
    class="list-mark"
    viewBox="0 0 14 14"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M7 1.8 12.2 7 7 12.2 1.8 7 7 1.8Z" />
    <path d="m4.9 7.1 1.3 1.3 3-3.2" />
  </svg>
));

export const SeparatorMark = component$(() => (
  <svg
    class="separator-mark"
    viewBox="0 0 18 10"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M2 5h5" />
    <path d="M11 5h5" />
    <path d="M9 2.5 11.5 5 9 7.5 6.5 5 9 2.5Z" />
  </svg>
));

export const ExternalArrow = component$(() => (
  <svg
    class="external-mark"
    viewBox="0 0 14 14"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M5 3h6v6" />
    <path d="m11 3-8 8" />
  </svg>
));

export const UpArrow = component$(() => (
  <svg class="up-mark" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
    <path d="M7 12V2" />
    <path d="M3 6l4-4 4 4" />
  </svg>
));
