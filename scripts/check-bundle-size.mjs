// Enforces JavaScript budget per docs/03-quality/performance-budget.md section 3.
// Pre-interaction client JavaScript budget: 90KB (compressed).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_PRE_INTERACTION_KB = 90;
const BUDGET_PRE_INTERACTION_BYTES = BUDGET_PRE_INTERACTION_KB * 1024;

const DIST = new URL('../dist/', import.meta.url).pathname;
const DIST_ASTRO = join(DIST, '_astro');

if (!existsSync(DIST_ASTRO)) {
  console.error(
    `check-bundle-size: dist/_astro directory does not exist. Run 'pnpm run build' first.`,
  );
  process.exit(1);
}

const jsFiles = readdirSync(DIST_ASTRO).filter((f) => f.endsWith('.js'));

if (jsFiles.length === 0) {
  console.warn('check-bundle-size: No client JS files found in dist/_astro/.');
  process.exit(0);
}

// 1. Identify chunks loaded directly by Home page (dist/index.html) before user interaction
const homeHtmlPath = join(DIST, 'index.html');
const homeDirectScripts = new Set();
if (existsSync(homeHtmlPath)) {
  const homeHtml = readFileSync(homeHtmlPath, 'utf-8');
  for (const match of homeHtml.matchAll(/src="\/_astro\/([^"]+\.js)"/g)) {
    homeDirectScripts.add(match[1]);
  }
}

// Recursively find static dependencies imported by Home entry scripts
const homePreInteractionFiles = new Set(homeDirectScripts);
function resolveImports(filename) {
  const filePath = join(DIST_ASTRO, filename);
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, 'utf-8');
  for (const match of content.matchAll(/(?:import|from)\s*['"]\.\/([^'"]+\.js)['"]/g)) {
    const importedFile = match[1];
    if (!homePreInteractionFiles.has(importedFile)) {
      homePreInteractionFiles.add(importedFile);
      resolveImports(importedFile);
    }
  }
}

for (const script of Array.from(homeDirectScripts)) {
  resolveImports(script);
}

const preFiles = [];
const dynamicFiles = [];

for (const file of jsFiles) {
  const filePath = join(DIST_ASTRO, file);
  const content = readFileSync(filePath);
  const gzipped = gzipSync(content);
  const entry = {
    file,
    raw: content.length,
    gzip: gzipped.length,
  };
  if (homePreInteractionFiles.has(file)) {
    preFiles.push(entry);
  } else {
    dynamicFiles.push(entry);
  }
}

let preRaw = 0;
let preGzip = 0;
console.log('--- Initial Pre-Interaction Client JavaScript (Home page) ---');
for (const entry of preFiles) {
  preRaw += entry.raw;
  preGzip += entry.gzip;
  console.log(
    `  ${entry.file.padEnd(58)} ${(entry.raw / 1024).toFixed(2).padStart(6)} KB raw | ${(entry.gzip / 1024).toFixed(2).padStart(6)} KB gzip`,
  );
}

const preGzipKb = (preGzip / 1024).toFixed(2);
const preRawKb = (preRaw / 1024).toFixed(2);
console.log('-------------------------------------------------------------');
console.log(
  `Pre-Interaction Total: ${preGzipKb} KB gzip (${preRawKb} KB raw) / Budget: ${BUDGET_PRE_INTERACTION_KB} KB`,
);

let dynRaw = 0;
let dynGzip = 0;
console.log('\n--- On-Demand Page-Specific Dynamic Imports ---');
for (const entry of dynamicFiles) {
  dynRaw += entry.raw;
  dynGzip += entry.gzip;
  console.log(
    `  ${entry.file.padEnd(58)} ${(entry.raw / 1024).toFixed(2).padStart(6)} KB raw | ${(entry.gzip / 1024).toFixed(2).padStart(6)} KB gzip`,
  );
}
console.log('-------------------------------------------------------------');
console.log(
  `On-Demand Total: ${(dynGzip / 1024).toFixed(2)} KB gzip (${(dynRaw / 1024).toFixed(2)} KB raw)`,
);
console.log(
  `All App Chunks Combined: ${((preGzip + dynGzip) / 1024).toFixed(2)} KB gzip (${((preRaw + dynRaw) / 1024).toFixed(2)} KB raw)`,
);

let hasError = false;

if (preGzip > BUDGET_PRE_INTERACTION_BYTES) {
  console.error(
    `\ncheck-bundle-size FAILED: Pre-interaction client JS (${preGzipKb} KB gzip) exceeds ${BUDGET_PRE_INTERACTION_KB} KB budget!`,
  );
  hasError = true;
}

if (hasError) {
  process.exit(1);
}

console.log(
  `\ncheck-bundle-size PASSED: Pre-interaction client JS is well within the ${BUDGET_PRE_INTERACTION_KB} KB budget.`,
);
