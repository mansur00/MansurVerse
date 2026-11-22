// Enforces JavaScript budget per docs/03-quality/performance-budget.md section 3.
// JavaScript before interaction budget: 90KB (compressed).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = 90;
const BUDGET_BYTES = BUDGET_KB * 1024;
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

let totalRaw = 0;
let totalGzip = 0;

console.log('--- Client JavaScript Bundle Sizes ---');
for (const file of jsFiles) {
  const filePath = join(DIST_ASTRO, file);
  const content = readFileSync(filePath);
  const gzipped = gzipSync(content);
  totalRaw += content.length;
  totalGzip += gzipped.length;
  console.log(
    `  ${file.padEnd(55)} ${(content.length / 1024).toFixed(2).padStart(6)} KB raw | ${(gzipped.length / 1024).toFixed(2).padStart(6)} KB gzip`,
  );
}

const totalGzipKb = (totalGzip / 1024).toFixed(2);
const totalRawKb = (totalRaw / 1024).toFixed(2);
console.log('--------------------------------------');
console.log(
  `Total Client JS: ${totalGzipKb} KB gzip (${totalRawKb} KB raw) / Budget: ${BUDGET_KB} KB`,
);

if (totalGzip > BUDGET_BYTES) {
  console.error(
    `check-bundle-size FAILED: Total client JS (${totalGzipKb} KB gzip) exceeds ${BUDGET_KB} KB budget!`,
  );
  process.exit(1);
}

console.log(
  `check-bundle-size PASSED: Bundle size is within the ${BUDGET_KB} KB compressed budget.`,
);
