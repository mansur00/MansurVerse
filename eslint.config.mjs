import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';

// Guardrails: docs/02-engineering/code-standards.md
// Rule 1: No Tailwind arbitrary values (e.g. w-[200px], bg-[#fff]).
// Rule 2: No hardcoded visible copy, links or image paths in components.
const customPlugin = {
  rules: {
    'no-arbitrary-values': {
      meta: {
        type: 'problem',
        docs: { description: 'Disallow Tailwind CSS arbitrary values' },
      },
      create(context) {
        function checkClassString(str, node) {
          const classes = str.split(/\s+/);
          for (const cls of classes) {
            if (/\[[^\]]+\]/.test(cls)) {
              context.report({
                node,
                message: `Tailwind arbitrary value is disallowed: "${cls}". Use design tokens.`,
              });
            }
          }
        }
        return {
          JSXAttribute(node) {
            if (node.name && (node.name.name === 'class' || node.name.name === 'className')) {
              if (
                node.value &&
                node.value.type === 'Literal' &&
                typeof node.value.value === 'string'
              ) {
                checkClassString(node.value.value, node);
              }
            }
          },
        };
      },
    },
    'no-hardcoded-copy': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow hardcoded visible copy, links, or image paths in components',
        },
      },
      create(context) {
        return {
          JSXText(node) {
            const text = node.value.trim();
            // Flag text containing words (2+ alphanumeric chars)
            if (/[a-zA-Z0-9]{2,}/.test(text)) {
              context.report({
                node,
                message: `Hardcoded visible copy is disallowed in components: "${text}". Copy must come from props or content files.`,
              });
            }
          },
          JSXAttribute(node) {
            if (
              node.name &&
              node.name.name === 'href' &&
              node.value &&
              node.value.type === 'Literal' &&
              typeof node.value.value === 'string' &&
              !node.value.value.startsWith('#')
            ) {
              context.report({
                node,
                message: `Hardcoded links are disallowed in components: "${node.value.value}". Links must come from props or site config.`,
              });
            }
            if (
              node.name &&
              node.name.name === 'src' &&
              node.value &&
              node.value.type === 'Literal' &&
              typeof node.value.value === 'string'
            ) {
              context.report({
                node,
                message: `Hardcoded image paths are disallowed in components: "${node.value.value}". Images must come from props or content files.`,
              });
            }
          },
        };
      },
    },
    'no-page-styles': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Pages may not contain <style> tags per docs/01-design/layout-system.md. Layout comes only from primitives.',
        },
      },
      create(context) {
        return {
          JSXElement(node) {
            if (
              node.openingElement &&
              node.openingElement.name &&
              node.openingElement.name.name === 'style'
            ) {
              context.report({
                node,
                message:
                  'Pages may not contain <style> tags per docs/01-design/layout-system.md. Compose layout primitives instead.',
              });
            }
          },
        };
      },
    },
  },
};

export default [
  {
    ignores: [
      'dist',
      '.astro',
      'node_modules',
      'docs',
      'reference',
      'src/styles/tokens/generated',
      'tests/guardrails/fixtures/bad.astro',
    ],
  },
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs['jsx-a11y-recommended'],
  {
    plugins: {
      custom: customPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'custom/no-arbitrary-values': 'error',
    },
  },
  {
    files: ['src/components/**/*.astro', 'tests/guardrails/fixtures/**/*.astro'],
    rules: {
      'custom/no-hardcoded-copy': 'error',
    },
  },
  {
    files: ['src/pages/**/*.astro'],
    ignores: ['src/pages/styleguide.astro'],
    rules: {
      'custom/no-page-styles': 'error',
    },
  },
];
