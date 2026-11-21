// Validates content collections, schemas, image dimensions, and headings per docs/02-engineering/content-schema.md.
// Emits warnings for placeholder content and exits with code 1 on errors.
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const errors = [];
const warnings = [];

// 1. Read site config
const siteConfigPath = new URL('../src/config/site.ts', import.meta.url);
if (!existsSync(siteConfigPath)) {
  errors.push('src/config/site.ts is missing');
}

const siteContent = readFileSync(siteConfigPath, 'utf-8');
const categoriesMatch = siteContent.match(/categories:\s*\[([^\]]+)\]/);
const allowedCategories = categoriesMatch
  ? categoriesMatch[1]
      .split(',')
      .map((s) => s.replace(/['"\s]/g, ''))
      .filter(Boolean)
  : ['Web', 'App', 'Brand'];

if (siteContent.includes("timezone: 'UTC'") || siteContent.includes('timezonePlaceholder: true')) {
  warnings.push(
    'site.timezone: using temporary placeholder UTC until owner provides IANA timezone (O-16)',
  );
}

// Helper to parse simple SVG width and height / viewBox
function getSvgDimensions(filePath) {
  if (!existsSync(filePath)) return null;
  const content = readFileSync(filePath, 'utf-8');
  const viewBoxMatch = content.match(
    /viewBox=["']\s*0\s+0\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*["']/i,
  );
  if (viewBoxMatch) {
    return { width: parseFloat(viewBoxMatch[1]), height: parseFloat(viewBoxMatch[2]) };
  }
  const widthMatch = content.match(/width=["'](\d+(?:\.\d+)?)["']/i);
  const heightMatch = content.match(/height=["'](\d+(?:\.\d+)?)["']/i);
  if (widthMatch && heightMatch) {
    return { width: parseFloat(widthMatch[1]), height: parseFloat(heightMatch[2]) };
  }
  return null;
}

// 2. Validate projects collection
const projectsDir = new URL('../src/content/projects/', import.meta.url);
if (!existsSync(projectsDir)) {
  errors.push('src/content/projects/ directory is missing');
} else {
  const projectFiles = readdirSync(projectsDir).filter((f) => f.endsWith('.mdx'));
  if (projectFiles.length === 0) {
    errors.push('No projects found in src/content/projects/. At least one project is required.');
  }

  const seenOrders = new Map();
  const seenSlugs = new Set();

  for (const filename of projectFiles) {
    const slug = filename.replace(/\.mdx$/, '');
    if (seenSlugs.has(slug)) {
      errors.push(`Duplicate project slug: "${slug}"`);
    }
    seenSlugs.add(slug);

    const fileContent = readFileSync(new URL(filename, projectsDir), 'utf-8');
    const frontmatterMatch = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      errors.push(`${filename}: Missing YAML frontmatter block`);
      continue;
    }

    const [, frontmatterRaw, body] = frontmatterMatch;

    // Parse essential frontmatter fields
    const titleMatch = frontmatterRaw.match(/title:\s*['"]?([^\r\n"']+)['"]?/);
    const orderMatch = frontmatterRaw.match(/order:\s*(\d+)/);
    const categoryMatch = frontmatterRaw.match(/category:\s*['"]?([^\r\n"']+)['"]?/);
    const coverAltMatch = frontmatterRaw.match(
      /cover:\s*(?:[\r\n\s]*image:[^\r\n]+)?[\r\n\s]*alt:\s*['"]?([^\r\n"']+)['"]?/,
    );
    const isPlaceholder = /placeholder:\s*true/i.test(frontmatterRaw);

    if (isPlaceholder) {
      warnings.push(`[placeholder] Project "${slug}" carries placeholder: true`);
    }

    if (!titleMatch || !titleMatch[1].trim()) {
      errors.push(`${filename}: Missing or empty title`);
    } else if (titleMatch[1].trim().length > 48) {
      errors.push(
        `${filename}: Title exceeds 48 characters (${titleMatch[1].trim().length} chars)`,
      );
    }

    if (!orderMatch) {
      errors.push(`${filename}: Missing numeric order`);
    } else {
      const order = parseInt(orderMatch[1], 10);
      if (seenOrders.has(order)) {
        errors.push(
          `${filename}: Duplicate order ${order} (already used by ${seenOrders.get(order)})`,
        );
      } else {
        seenOrders.set(order, filename);
      }
    }

    if (!categoryMatch) {
      errors.push(`${filename}: Missing category`);
    } else {
      const category = categoryMatch[1].trim();
      if (!allowedCategories.includes(category)) {
        errors.push(
          `${filename}: Category "${category}" is not allowed. Must be one of: ${allowedCategories.join(', ')}`,
        );
      }
    }

    if (!coverAltMatch || !coverAltMatch[1].trim()) {
      errors.push(`${filename}: Missing cover.alt text`);
    }

    // Required headings in MDX body: ## Overview, ## Problem, ## Solution, ## Results
    const requiredHeadings = ['Overview', 'Problem', 'Solution', 'Results'];
    const headingMatches = [...body.matchAll(/^##\s+([^\r\n]+)/gm)].map((m) => m[1].trim());

    let lastIdx = -1;
    for (const req of requiredHeadings) {
      const foundIdx = headingMatches.indexOf(req);
      if (foundIdx === -1) {
        errors.push(`${filename}: Missing required heading "## ${req}" in MDX body`);
      } else if (foundIdx <= lastIdx) {
        errors.push(
          `${filename}: Required heading "## ${req}" is out of order. Expected: ## Overview, ## Problem, ## Solution, ## Results`,
        );
      }
      lastIdx = foundIdx;
    }

    // Compare images check
    if (frontmatterRaw.includes('compare:')) {
      const beforeImgMatch = frontmatterRaw.match(
        /before:\s*[\r\n\s]*image:\s*['"]?([^\r\n"']+)['"]?/,
      );
      const beforeAltMatch = frontmatterRaw.match(
        /before:\s*[\s\S]*?alt:\s*['"]?([^\r\n"']+)['"]?/,
      );
      const afterImgMatch = frontmatterRaw.match(
        /after:\s*[\r\n\s]*image:\s*['"]?([^\r\n"']+)['"]?/,
      );
      const afterAltMatch = frontmatterRaw.match(/after:\s*[\s\S]*?alt:\s*['"]?([^\r\n"']+)['"]?/);

      if (!beforeAltMatch || !beforeAltMatch[1].trim()) {
        errors.push(`${filename}: compare.before must include non-empty alt text`);
      }
      if (!afterAltMatch || !afterAltMatch[1].trim()) {
        errors.push(`${filename}: compare.after must include non-empty alt text`);
      }

      if (beforeImgMatch && afterImgMatch) {
        const resolveImg = (relPath) => {
          if (relPath.startsWith('/')) {
            return new URL('../public' + relPath, import.meta.url);
          }
          return new URL(relPath, projectsDir);
        };

        const beforeDim = getSvgDimensions(resolveImg(beforeImgMatch[1].trim()));
        const afterDim = getSvgDimensions(resolveImg(afterImgMatch[1].trim()));

        if (beforeDim && afterDim) {
          if (beforeDim.width !== afterDim.width || beforeDim.height !== afterDim.height) {
            errors.push(
              `${filename}: compare images must have matching dimensions. Before is ${beforeDim.width}x${beforeDim.height}, after is ${afterDim.width}x${afterDim.height}`,
            );
          }
        }
      }
    }
  }
}

// 3. Validate single-entry JSON collections
const jsonFiles = [
  { name: 'home.json', limits: { introMax: 200, statementMax: 220 } },
  { name: 'profile.json', check: (d) => !d.portrait?.alt && 'profile.portrait.alt is missing' },
  { name: 'capabilities.json', limits: { minItems: 4, maxItems: 8 } },
  { name: 'process.json', limits: { exactItems: 4 } },
  { name: 'values.json', limits: { exactItems: 3 } },
  { name: 'stats.json', limits: { minItems: 2, maxItems: 4 } },
  { name: 'experience.json', limits: {} },
  { name: 'skills.json', limits: {} },
  { name: 'open-to.json', limits: { minItems: 1, maxItems: 4 } },
];

for (const { name, limits, check } of jsonFiles) {
  const jsonPath = new URL(`../src/content/${name}`, import.meta.url);
  if (!existsSync(jsonPath)) {
    errors.push(`src/content/${name} is missing`);
    continue;
  }

  try {
    const raw = readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(raw);

    if (data.placeholder) {
      warnings.push(`[placeholder] ${name} carries placeholder: true`);
    }

    if (check) {
      const err = check(data);
      if (err) errors.push(`${name}: ${err}`);
    }

    if (limits?.exactItems !== undefined) {
      const count = data.items?.length ?? 0;
      if (count !== limits.exactItems) {
        errors.push(`${name}: items count must be exactly ${limits.exactItems}, got ${count}`);
      }
    }

    if (limits?.minItems !== undefined && (data.items?.length ?? 0) < limits.minItems) {
      errors.push(`${name}: items count must be at least ${limits.minItems}`);
    }

    if (limits?.maxItems !== undefined && (data.items?.length ?? 0) > limits.maxItems) {
      errors.push(`${name}: items count cannot exceed ${limits.maxItems}`);
    }
  } catch (err) {
    errors.push(`${name}: Invalid JSON - ${err.message}`);
  }
}

// Output warnings
if (warnings.length > 0) {
  for (const w of warnings) {
    console.warn(`warning: ${w}`);
  }
}

// Output errors
if (errors.length > 0) {
  for (const e of errors) {
    console.error(`error: ${e}`);
  }
  console.error(`check:content failed with ${errors.length} error(s)`);
  process.exit(1);
}

console.log('check:content passed');
