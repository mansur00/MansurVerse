// Guardrails: AGENTS.md rules 1 and 2, docs/01-design/spacing-radius-shadow.md
const strokeProps = [
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-width',
  'border-style',
  'border-color',
  'outline',
  'outline-width',
  'outline-style',
  'outline-color',
];
const shadowProps = ['box-shadow', 'text-shadow'];

export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: [
    'dist/**',
    '.astro/**',
    'node_modules/**',
    'docs/**',
    'reference/**',
    'src/styles/tokens/generated/**',
  ],
  overrides: [
    { files: ['**/*.astro'], customSyntax: 'postcss-html' },
    {
      // Allowed strokes: hairline divider, outlined chip or button, focus ring, compare-slider handle.
      files: [
        'src/components/primitives/Divider.astro',
        'src/components/primitives/Chip.astro',
        'src/components/primitives/Button.astro',
        'src/components/motion/CompareSlider.astro',
        'src/styles/base.css',
      ],
      rules: { 'property-disallowed-list': shadowProps },
    },
    {
      // Container primitive is the ONLY element allowed to use auto margins for layout centering.
      files: ['src/components/layout-primitives/Container.astro'],
      rules: {
        'declaration-property-value-disallowed-list': {
          '/^(font-family|font-size)$/': ['/^(?!var\\()/'],
          '/^(filter|backdrop-filter)$/': ['/drop-shadow/'],
        },
      },
    },
  ],
  rules: {
    // Tailwind 4 at-rules and string-style imports are valid in this project.
    'import-notation': 'string',
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'theme',
          'utility',
          'variant',
          'custom-variant',
          'apply',
          'source',
          'plugin',
          'config',
          'reference',
        ],
      },
    ],
    // Rule 1: no raw colours; colours come from tokens (var(--...)).
    'color-no-hex': true,
    'function-disallowed-list': [
      'rgb',
      'rgba',
      'hsl',
      'hsla',
      'hwb',
      'lab',
      'lch',
      'oklab',
      'oklch',
    ],
    'color-named': 'never',
    // Astro uses :global() for global selector scoping
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],
    // Rule 1: fonts only through tokens. Auto margins disallowed except in Container.astro.
    'declaration-property-value-disallowed-list': {
      '/^(font-family|font-size)$/': ['/^(?!var\\()/'],
      '/^(filter|backdrop-filter)$/': ['/drop-shadow/'],
      '/^margin(-inline)?$/': ['/\\b(0\\s+auto|auto)\\b/'],
    },
    // Rule 2: flat look. Shadows never; strokes only in the exception files below.
    'property-disallowed-list': [...shadowProps, ...strokeProps],
  },
};
