// Enforces JavaScript budget per docs/03-quality/performance-budget.md section 3.
// Pre-interaction client JavaScript budget: 90KB (compressed).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_PRE_INTERACTION_KB = 90;
const BUDGET_PRE_INTERACTION_BYTES = BUDGET_PRE_INTERACTION_KB * 1024;

const DIST_ASTRO = new URL('../dist/_astro/', import.meta.url).pathname;

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

const preFiles = [];

for (const file of jsFiles) {
  const filePath = join(DIST_ASTRO, file);
  const content = readFileSync(filePath);
  const gzipped = gzipSync(content);
  const entry = {
    file,
    raw: content.length,
    gzip: gzipped.length,
  };
  preFiles.push(entry);
}

let preRaw = 0;
let preGzip = 0;
console.log('--- Pre-Interaction Client JavaScript Bundle Sizes ---');
for (const entry of preFiles) {
  preRaw += entry.raw;
  preGzip += entry.gzip;
  console.log(
    `  ${entry.file.padEnd(55)} ${(entry.raw / 1024).toFixed(2).padStart(6)} KB raw | ${(entry.gzip / 1024).toFixed(2).padStart(6)} KB gzip`,
  );
}

const preGzipKb = (preGzip / 1024).toFixed(2);
const preRawKb = (preRaw / 1024).toFixed(2);
console.log('------------------------------------------------------');
console.log(
  `Pre-Interaction Total: ${preGzipKb} KB gzip (${preRawKb} KB raw) / Budget: ${BUDGET_PRE_INTERACTION_KB} KB`,
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
  `\ncheck-bundle-size PASSED: All bundle chunks are within their respective compressed budgets.`,
);
