// Proves the flat-look and token guardrails work: the bad fixture must fail with the expected rules,
// the good fixture must pass. Run by `pnpm run verify`.
import { spawnSync } from 'node:child_process';

const run = (file) =>
  spawnSync('pnpm', ['exec', 'stylelint', file], { encoding: 'utf8' });

const bad = run('tests/guardrails/fixtures/bad.css');
const good = run('tests/guardrails/fixtures/good.css');
const output = `${bad.stdout}${bad.stderr}`;
const expected = [
  'color-no-hex',
  'function-disallowed-list',
  'property-disallowed-list',
  'declaration-property-value-disallowed-list',
];

const problems = [];
if (bad.status === 0) problems.push('bad.css passed but must fail');
for (const rule of expected) {
  if (!output.includes(rule)) problems.push(`bad.css did not trigger ${rule}`);
}
if (good.status !== 0) problems.push(`good.css failed:\n${good.stdout}${good.stderr}`);

if (problems.length > 0) {
  console.error('Guardrail test failed:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('Guardrail test passed: bad fixture rejected, good fixture accepted.');
