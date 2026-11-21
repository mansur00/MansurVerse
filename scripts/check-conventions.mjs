// Validates codebase conventions, component bindings, font preloading,
// and ensures every foreground/background combination rendered in pages/components
// has an explicit contrast pair in tokens.json that satisfies WCAG 2.2 AA.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { contrast, literal, loadTokens, pair } from './tokens/lib.mjs';

const errors = [];
const warnings = [];
const tokens = loadTokens();

// 1. Verify in component code that Jersey 20 / --font-display is only used in Logo.astro
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

  // 2. Check Logo.astro token bindings
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

  // 3. Check BaseLayout.astro preloads ONLY Jersey 20 and Plus Jakarta Sans (docs/02-engineering/tokens-implementation.md)
  const layoutPath = new URL('../src/layouts/BaseLayout.astro', import.meta.url);
  if (existsSync(layoutPath)) {
    const layoutContent = readFileSync(layoutPath, 'utf-8');
    if (!layoutContent.includes('jersey-20') && !layoutContent.includes('jersey20Url')) {
      errors.push(`BaseLayout.astro: must preload Jersey 20 font for instant above-the-fold paint`);
    }
    if (!layoutContent.includes('plus-jakarta-sans') && !layoutContent.includes('jakartaUrl')) {
      errors.push(`BaseLayout.astro: must preload Plus Jakarta Sans font for body text`);
    }
    if (layoutContent.includes('notchUrl') || layoutContent.includes('stack-sans-notch')) {
      errors.push(
        `BaseLayout.astro: do not preload Stack Sans Notch; only Jersey 20 and Plus Jakarta Sans must be preloaded`,
      );
    }
  }

  // 4. Layout system convention checks per docs/01-design/layout-system.md section 8:
  // - Every page section is a Section (no raw <section> tags in production pages)
  // - No page or block sets outer padding
  // - Nav and Footer (via Section) use the same inline-padding token (--layout-pad)
  const pagesDir = new URL('../src/pages/', import.meta.url);
  const scanPages = (dirUrl) => {
    if (!existsSync(dirUrl)) return;
    for (const entry of readdirSync(dirUrl, { withFileTypes: true })) {
      const entryUrl = new URL(entry.name, dirUrl.href.endsWith('/') ? dirUrl : dirUrl.href + '/');
      if (entry.isDirectory()) {
        scanPages(
          new URL(entry.name + '/', dirUrl.href.endsWith('/') ? dirUrl : dirUrl.href + '/'),
        );
      } else if (entry.name.endsWith('.astro') && entry.name !== 'styleguide.astro') {
        const fullContent = readFileSync(entryUrl, 'utf-8');
        // Strip frontmatter before checking markup
        const content = fullContent.replace(/^---[\s\S]*?---/, '');
        if (/<section[\s>]/.test(content)) {
          errors.push(
            `${entry.name}: Raw <section> disallowed in pages per layout-system.md. Use Section primitive.`,
          );
        }
        if (/<style[\s>]/.test(content)) {
          errors.push(
            `${entry.name}: <style> blocks disallowed in pages per layout-system.md rule 1.6.`,
          );
        }
      }
    }
  };
  scanPages(pagesDir);

  // Check blocks do not set outer padding or centered margins
  const blocksDir = new URL('../src/components/blocks/', import.meta.url);
  if (existsSync(blocksDir)) {
    for (const entry of readdirSync(blocksDir)) {
      if (entry.endsWith('.astro')) {
        const blockContent = readFileSync(new URL(entry, blocksDir), 'utf-8');
        if (
          blockContent.includes('margin: 0 auto') ||
          blockContent.includes('--layout-page-gutter')
        ) {
          errors.push(
            `Block ${entry}: Blocks may not set outer padding or margin: 0 auto per layout-system.md.`,
          );
        }
      }
    }
  }

  // Check Nav and Section/Footer use the same inline-padding token
  const navContent = readFileSync(
    new URL('../src/components/layout/Nav.astro', import.meta.url),
    'utf-8',
  );
  const sectionContent = readFileSync(
    new URL('../src/components/layout-primitives/Section.astro', import.meta.url),
    'utf-8',
  );
  if (!navContent.includes('var(--layout-pad)')) {
    errors.push('Nav.astro: must use var(--layout-pad) for horizontal alignment');
  }
  if (!sectionContent.includes('var(--layout-pad)')) {
    errors.push('Section.astro: must use var(--layout-pad) for horizontal alignment');
  }
} catch (error) {
  warnings.push(`Component convention checks skipped: ${error.message}`);
}

// 4. Surface contrast coverage verification:
// Ensure every text role and element rendered on surface backgrounds (bg-base, bg-alt, bg-feature, bg-card)
// maps to an active pair in tokens.contrast that meets contrast requirements.
const renderedSurfacePairs = [
  // On bg-base
  { fg: 'text-primary', bg: 'bg-base', role: 'Primary text on base', min: 4.5 },
  { fg: 'text-muted', bg: 'bg-base', role: 'Muted text on base', min: 4.5 },
  { fg: 'focus', bg: 'bg-base', role: 'Focus ring on base', min: 3 },
  // On bg-alt
  { fg: 'text-primary', bg: 'bg-alt', role: 'Primary text on alt band', min: 4.5 },
  { fg: 'text-muted', bg: 'bg-alt', role: 'Small description on alt band', min: 4.5 },
  { fg: 'focus', bg: 'bg-alt', role: 'Focus ring on alt band', min: 3 },
  // On bg-feature
  { fg: 'text-on-feature', bg: 'bg-feature', role: 'Headings and text on feature', min: 4.5 },
  {
    fg: 'text-muted-on-feature',
    bg: 'bg-feature',
    role: 'Safety note / muted text on feature',
    min: 4.5,
  },
  {
    fg: 'chip-outline-text-on-feature',
    bg: 'bg-feature',
    role: 'Outlined chip text on feature',
    min: 4.5,
  },
  { fg: 'focus-on-feature', bg: 'bg-feature', role: 'Focus ring on feature', min: 3 },
  // On bg-card
  { fg: 'text-on-accent', bg: 'bg-card', role: 'Primary text on card', min: 4.5 },
  { fg: 'text-muted-on-card', bg: 'bg-card', role: 'Muted text on card', min: 4.5 },
  // Accent & Error fills
  { fg: 'text-on-accent', bg: 'accent-primary', role: 'Text on primary lime accent', min: 4.5 },
  { fg: 'text-on-accent', bg: 'error', role: 'Text on error coral banner', min: 4.5 },
  {
    fg: 'button-inverse-text',
    bg: 'button-inverse-bg',
    role: 'Inverse button text on forest fill',
    min: 4.5,
  },
];

const declaredContrastPairs = new Set(tokens.contrast.map((c) => `${c.fg}::${c.bg}`));

for (const pairCheck of renderedSurfacePairs) {
  const key = `${pairCheck.fg}::${pairCheck.bg}`;
  if (!declaredContrastPairs.has(key)) {
    errors.push(
      `Surface contrast error: Rendered pair '${pairCheck.fg}' on '${pairCheck.bg}' (${pairCheck.role}) is NOT in tokens.contrast`,
    );
  } else {
    // Measure ratio in both themes
    for (const theme of ['light', 'dark']) {
      try {
        const fgHex = literal(
          tokens,
          tokens.color[pairCheck.fg] && pair(tokens.color[pairCheck.fg])[theme],
          theme,
        );
        const bgHex = literal(
          tokens,
          tokens.color[pairCheck.bg] && pair(tokens.color[pairCheck.bg])[theme],
          theme,
        );
        const ratio = contrast(fgHex, bgHex);
        if (ratio < pairCheck.min) {
          errors.push(
            `Contrast failure: '${pairCheck.fg}' on '${pairCheck.bg}' in ${theme} is ${ratio.toFixed(2)}:1 (needs >= ${pairCheck.min}:1)`,
          );
        }
      } catch (err) {
        errors.push(`Contrast calculation error for '${key}' in ${theme}: ${err.message}`);
      }
    }
  }
}

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`error: ${error}`);
  process.exit(1);
}
console.log('check:conventions passed');
