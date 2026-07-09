import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/astro/lib/**/*.ts',
      ],
      exclude: [
        'src/astro/lib/unicode/**',  // data loaders use node:fs; not unit-tested
        'src/astro/lib/ssr.ts',      // build-time only
        'src/astro/lib/stats.ts',    // build-time only
        'src/astro/lib/donors.ts',   // build-time only
      ],
    },
  },
});
