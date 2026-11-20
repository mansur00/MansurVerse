import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';

// Guardrails: docs/02-engineering/code-standards.md
// TODO (Phase 3): custom rule for hardcoded visible copy; Tailwind arbitrary-value rule (check the plugin supports Tailwind 4).
export default [
  {
    ignores: ['dist', '.astro', 'node_modules', 'docs', 'reference', 'src/styles/tokens/generated'],
  },
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs['jsx-a11y-recommended'],
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
