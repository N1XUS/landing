import { defineConfig } from 'vitest/config';

// Standalone config so vitest does not load the Qwik City vite plugins,
// which SSR-evaluate routes and race the runner's teardown (noisy
// "transport was disconnected" errors after the suite passes).
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
