import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.{test,spec}.ts', 'src/**/*.{test,spec}.ts'],
    exclude: ['tests/e2e/**', 'tests/a11y/**', 'node_modules/**', 'dist/**'],
    passWithNoTests: true,
  },
});
