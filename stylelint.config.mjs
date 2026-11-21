// Guardrails: AGENTS.md rules 1, 2 and 11, docs/01-design/spacing-radius-shadow.md, docs/01-design/layout-system.md
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

// Literal length units (px, rem, em, vw, vh, %) disallowed in spacing/sizing unless wrapped in var() or calc(var())
const literalLengthDisallowed =
  '/^(?!.*var\\().*(?:\\d+(?:px|rem|em|vw|vh)|(?<!100?)(?<!\\d)\\d{1,2}%|(?<!1)00%).*$/';
const marginAutoDisallowed = '/0\\s+auto/';
const negativeMarginDisallowed = '/^(?!.*var\\().*-\\s*\\d+/';

const spacingSizingProps =
  '/^(margin|margin-top|margin-right|margin-bottom|margin-left|margin-inline|margin-block|padding|padding-top|padding-right|padding-bottom|padding-left|padding-inline|padding-block|gap|row-gap|column-gap|inset|top|right|bottom|left|width|max-width)$/';

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
      // Allow-listed files for decorative art, slider clips, base resets and styleguide specimens
      files: [
        'src/components/primitives/PixelShape.astro',
        'src/components/content/ProjectCard.astro',
        'src/components/primitives/KeywordTag.astro',
        'src/components/motion/CompareSlider.astro',
        'src/components/layout-primitives/Bleed.astro',
        'src/styles/base.css',
        'src/layouts/BaseLayout.astro',
        'src/components/styleguide/**',
        'src/pages/styleguide.astro',
      ],
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
    // Rule 1 & Rule 11: fonts, spacing, sizing, and placements only through tokens.
    'declaration-property-value-disallowed-list': {
      '/^(font-family|font-size)$/': ['/^(?!var\\()/'],
      '/^(filter|backdrop-filter)$/': ['/drop-shadow/'],
      [spacingSizingProps]: [literalLengthDisallowed, marginAutoDisallowed],
      '/^margin/': [negativeMarginDisallowed],
    },
    // Rule 2: flat look. Shadows never; strokes only in the exception files above.
    'property-disallowed-list': [...shadowProps, ...strokeProps],
  },
};
