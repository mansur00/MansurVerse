// Generates CSS, Tailwind theme and TS constants from src/styles/tokens/tokens.json.
import { mkdirSync, writeFileSync } from 'node:fs';
import { generate, loadTokens } from './tokens/lib.mjs';

const OUT = new URL('../src/styles/tokens/generated/', import.meta.url);
mkdirSync(OUT, { recursive: true });
const files = generate(loadTokens());
for (const [name, content] of Object.entries(files)) writeFileSync(new URL(name, OUT), content);
console.log(`tokens:build wrote ${Object.keys(files).length} files`);
