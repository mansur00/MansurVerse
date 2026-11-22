// Enforces JavaScript budget per docs/03-quality/performance-budget.md section 3.
// Pre-interaction client JavaScript budget: 90KB (compressed).
// Digit field chunk (OGL + shader) budget: 60KB (compressed).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_PRE_INTERACTION_KB = 90;
const BUDGET_PRE_INTERACTION_BYTES = BUDGET_PRE_INTERACTION_KB * 1024;
const BUDGET_DIGIT_FIELD_KB = 60;
const BUDGET_DIGIT_FIELD_BYTES = BUDGET_DIGIT_FIELD_KB * 1024;

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

const isDigitFieldChunk = (filename) =>
  filename.toLowerCase().includes('digit-field') || filename.toLowerCase().includes('ogl');

const preFiles = [];
const digitFiles = [];

for (const file of jsFiles) {
  const filePath = join(DIST_ASTRO, file);
  const content = readFileSync(filePath);
  const gzipped = gzipSync(content);
  const entry = {
    file,
    raw: content.length,
    gzip: gzipped.length,
  };

  if (isDigitFieldChunk(file)) {
    digitFiles.push(entry);
  } else {
    preFiles.push(entry);
  }
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

let digitRaw = 0;
let digitGzip = 0;
console.log('\n--- Digit Field Chunk (OGL + Shader) Bundle Sizes ---');
if (digitFiles.length === 0) {
  console.log('  (No digit field chunk found in dist/_astro/)');
} else {
  for (const entry of digitFiles) {
    digitRaw += entry.raw;
    digitGzip += entry.gzip;
    console.log(
      `  ${entry.file.padEnd(55)} ${(entry.raw / 1024).toFixed(2).padStart(6)} KB raw | ${(entry.gzip / 1024).toFixed(2).padStart(6)} KB gzip`,
    );
  }
}
const digitGzipKb = (digitGzip / 1024).toFixed(2);
const digitRawKb = (digitRaw / 1024).toFixed(2);
console.log('------------------------------------------------------');
console.log(
  `Digit Field Total: ${digitGzipKb} KB gzip (${digitRawKb} KB raw) / Budget: ${BUDGET_DIGIT_FIELD_KB} KB`,
);

let hasError = false;

if (preGzip > BUDGET_PRE_INTERACTION_BYTES) {
  console.error(
    `\ncheck-bundle-size FAILED: Pre-interaction client JS (${preGzipKb} KB gzip) exceeds ${BUDGET_PRE_INTERACTION_KB} KB budget!`,
  );
  hasError = true;
}

if (digitGzip > BUDGET_DIGIT_FIELD_BYTES) {
  console.error(
    `\ncheck-bundle-size FAILED: Digit field chunk (${digitGzipKb} KB gzip) exceeds ${BUDGET_DIGIT_FIELD_KB} KB budget!`,
  );
  hasError = true;
}

if (hasError) {
  process.exit(1);
}

console.log(
  `\ncheck-bundle-size PASSED: All bundle chunks are within their respective compressed budgets.`,
);
