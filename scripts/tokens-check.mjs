// Validates the token source and the generated files. Fails on errors; prints warnings.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { contrast, generate, literal, loadTokens, pair } from './tokens/lib.mjs';

const OUT = new URL('../src/styles/tokens/generated/', import.meta.url);
const tokens = loadTokens();
const errors = [];
const warnings = [];

// 1. Every reference resolves (literal() throws on a missing target) in both themes.
const refSources = [
  ...Object.entries(tokens.color).flatMap(([n, e]) =>
    ['light', 'dark'].map((t) => [`color.${n}`, pair(e)[t], t]),
  ),
  ...Object.entries(tokens.component).map(([n, v]) => [`component.${n}`, v, 'light']),
];
for (const [name, value, theme] of refSources) {
  try {
    literal(tokens, value, theme);
  } catch (error) {
    errors.push(`${name}: ${error.message}`);
  }
}

// 2. Dark and light values exist for every colour entry.
for (const [name, entry] of Object.entries(tokens.color)) {
  const p = pair(entry);
  if (!p.light || !p.dark) errors.push(`color.${name}: needs both light and dark values`);
}

// 3. Text roles are complete and use known fonts.
for (const [name, role] of Object.entries(tokens.text)) {
  for (const key of ['font', 'weight', 'size', 'line', 'tracking', 'element']) {
    if (role[key] === undefined) errors.push(`text.${name}: missing ${key}`);
  }
  if (!(role.font in tokens.font)) errors.push(`text.${name}: unknown font ${role.font}`);
  if (role.element === 'h1' && role.font !== 'display')
    errors.push(`text.${name}: h1 roles must use the display font`);
  if (/^h[2-6]$/.test(role.element) && role.font !== 'label') {
    errors.push(`text.${name}: h2 to h6 roles must use the label font`);
  }
  if (role.font === 'display' && role.element !== 'h1' && name !== 'logo-primary') {
    errors.push(`text.${name}: display font (Jersey 20) is only allowed for h1 and wordmark`);
  }
}

if (tokens.text?.tag?.font !== 'body' || tokens.text?.tag?.weight !== '600') {
  errors.push(`text.tag: must use font 'body' (Plus Jakarta Sans) and weight '600'`);
}
if (tokens.text?.superscript?.font !== 'label') {
  errors.push(`text.superscript: must use font 'label' (Stack Sans Notch)`);
}

// 3a. Verify Logo font tokens and roles
if (!tokens.font?.display?.includes('Jersey 20')) {
  errors.push(`font.display: must include 'Jersey 20'`);
}
if (!tokens.font?.label?.includes('Stack Sans Notch')) {
  errors.push(`font.label: must include 'Stack Sans Notch'`);
}
if (tokens.text?.['logo-primary']?.font !== 'display') {
  errors.push(`text.logo-primary: must use display font (Jersey 20)`);
}
if (tokens.text?.['logo-secondary']?.font !== 'label') {
  errors.push(`text.logo-secondary: must use label font (Stack Sans Notch)`);
}

// 3b. Verify in component code that Jersey 20 / --font-display is only used in Logo.astro
try {
  const compDirPath = new URL('../src/components/', import.meta.url);
  const scanDir = (dirUrl) => {
    if (!existsSync(dirUrl)) return;
    for (const entry of readdirSync(dirUrl, { withFileTypes: true })) {
      const entryUrl = new URL(entry.name, dirUrl.href.endsWith('/') ? dirUrl : dirUrl.href + '/');
      if (entry.isDirectory()) {
        scanDir(new URL(entry.name + '/', dirUrl.href.endsWith('/') ? dirUrl : dirUrl.href + '/'));
      } else if (entry.name.endsWith('.astro') && entry.name !== 'Logo.astro') {
        const content = readFileSync(entryUrl, 'utf-8');
        if (content.includes('var(--font-display)') || content.includes('Jersey 20')) {
          errors.push(
            `${entry.name}: Jersey 20 / --font-display is only allowed in Logo.astro and h1`,
          );
        }
      }
    }
  };
  scanDir(compDirPath);

  // Check Logo.astro itself
  const logoPath = new URL('../src/components/primitives/Logo.astro', import.meta.url);
  if (existsSync(logoPath)) {
    const logoContent = readFileSync(logoPath, 'utf-8');
    if (
      !logoContent.includes('text-logo-primary') &&
      !logoContent.includes('var(--text-logo-primary')
    ) {
      errors.push(`Logo.astro: primary element must use text-logo-primary token`);
    }
    if (
      !logoContent.includes('text-logo-secondary') &&
      !logoContent.includes('var(--text-logo-secondary')
    ) {
      errors.push(`Logo.astro: secondary element must use text-logo-secondary token`);
    }
  }

  // Check BaseLayout.astro preloads Jersey 20
  const layoutPath = new URL('../src/layouts/BaseLayout.astro', import.meta.url);
  if (existsSync(layoutPath)) {
    const layoutContent = readFileSync(layoutPath, 'utf-8');
    if (!layoutContent.includes('jersey-20') && !layoutContent.includes('jersey20Url')) {
      errors.push(`BaseLayout.astro: must preload Jersey 20 font for instant above-the-fold paint`);
    }
  }
} catch (error) {
  warnings.push(`Component font-display scan skipped: ${error.message}`);
}

// 4. Contrast pairs in both themes.
for (const { fg, bg, min } of tokens.contrast) {
  for (const theme of ['light', 'dark']) {
    try {
      const ratio = contrast(
        literal(tokens, tokens.color[fg] && pair(tokens.color[fg])[theme], theme),
        literal(tokens, tokens.color[bg] && pair(tokens.color[bg])[theme], theme),
      );
      if (ratio < min)
        errors.push(`contrast ${fg} on ${bg} (${theme}): ${ratio.toFixed(2)} is below ${min}`);
    } catch (error) {
      errors.push(`contrast ${fg} on ${bg}: ${error.message}`);
    }
  }
}

// 5. Unused primitives (warning only).
const used = new Set();
const scan = (value) => {
  const text = JSON.stringify(value);
  for (const match of text.matchAll(/\{palette\.([a-z0-9-]+)\}/g)) used.add(match[1]);
};
scan(tokens.color);
scan(tokens.component);
for (const name of Object.keys(tokens.palette))
  if (!used.has(name))
    warnings.push(`palette.${name} is not used by any semantic or component token`);

// 6. Generated files are present and current.
const expected = generate(tokens);
for (const [name, content] of Object.entries(expected)) {
  const path = new URL(name, OUT);
  if (!existsSync(path)) errors.push(`generated/${name} is missing; run pnpm run tokens:build`);
  else if (readFileSync(path, 'utf8') !== content)
    errors.push(`generated/${name} is out of date; run pnpm run tokens:build`);
}

for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length > 0) {
  console.error(`tokens:check failed:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('tokens:check passed');
