// Proves the flat-look and token guardrails work:
// 1. Stylelint: bad.css must fail with expected rules, good.css must pass.
// 2. ESLint: bad.astro must fail with expected rules, good.astro must pass.
// Run by `pnpm run verify`.
import { spawnSync } from 'node:child_process';

const runStylelint = (file) => spawnSync('pnpm', ['exec', 'stylelint', file], { encoding: 'utf8' });
const runESLint = (file, extraArgs = []) =>
  spawnSync('pnpm', ['exec', 'eslint', ...extraArgs, file], { encoding: 'utf8' });

const badCss = runStylelint('tests/guardrails/fixtures/bad.css');
const goodCss = runStylelint('tests/guardrails/fixtures/good.css');
const cssOutput = `${badCss.stdout}${badCss.stderr}`;
const expectedCssRules = [
  'color-no-hex',
  'function-disallowed-list',
  'property-disallowed-list',
  'declaration-property-value-disallowed-list',
];

const problems = [];
if (badCss.status === 0) problems.push('bad.css passed but must fail');
for (const rule of expectedCssRules) {
  if (!cssOutput.includes(rule)) problems.push(`bad.css did not trigger ${rule}`);
}
if (goodCss.status !== 0) problems.push(`good.css failed:\n${goodCss.stdout}${goodCss.stderr}`);

const badAstro = runESLint('tests/guardrails/fixtures/bad.astro', ['--no-ignore']);
const goodAstro = runESLint('tests/guardrails/fixtures/good.astro');
const astroOutput = `${badAstro.stdout}${badAstro.stderr}`;
const expectedAstroRules = ['custom/no-arbitrary-values', 'custom/no-hardcoded-copy'];

if (badAstro.status === 0) problems.push('bad.astro passed but must fail');
for (const rule of expectedAstroRules) {
  if (!astroOutput.includes(rule)) problems.push(`bad.astro did not trigger ${rule}`);
}
if (goodAstro.status !== 0)
  problems.push(`good.astro failed:\n${goodAstro.stdout}${goodAstro.stderr}`);

if (problems.length > 0) {
  console.error('Guardrail test failed:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('Guardrail test passed: bad fixtures rejected, good fixtures accepted.');
