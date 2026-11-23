// Validates that every var(--name) used in src/ resolves to a generated design token
// or to a custom property declared in the same file or component.
// Fails with file and line if an undefined CSS variable is found.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const generatedTokens = new Set();
const genDir = new URL('../src/styles/tokens/generated/', import.meta.url).pathname;

if (!existsSync(genDir)) {
  console.error(`check-tokens-used: ${genDir} does not exist. Run 'pnpm run tokens:build' first.`);
  process.exit(1);
}

for (const file of readdirSync(genDir)) {
  if (file.endsWith('.css')) {
    const content = readFileSync(join(genDir, file), 'utf-8');
    for (const match of content.matchAll(/--[a-zA-Z0-9_-]+(?=\s*:)/g)) {
      generatedTokens.add(match[0]);
    }
  }
}

const errors = [];
const srcDir = new URL('../src/', import.meta.url).pathname;

function scanDir(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'generated') {
        scanDir(fullPath);
      }
    } else if (/\.(astro|css|ts|js|mjs)$/.test(entry.name)) {
      const content = readFileSync(fullPath, 'utf-8');
      const localDeclared = new Set();

      // CSS custom property declaration: --name:
      for (const match of content.matchAll(/--[a-zA-Z0-9_-]+(?=\s*:)/g)) {
        localDeclared.add(match[0]);
      }

      // Programmatic setProperty('--name', ...)
      for (const match of content.matchAll(/setProperty\(\s*['"](--[a-zA-Z0-9_-]+)['"]/g)) {
        localDeclared.add(match[1]);
      }

      // Inline style property assignment in Astro/HTML: style="--name: ..." or style={`--name: ...`}
      for (const match of content.matchAll(/style=[{`"'][^"`}]*(--[a-zA-Z0-9_-]+)\s*:/g)) {
        localDeclared.add(match[1]);
      }

      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        // Skip lines interpolating dynamic token prefixes: var(--foo-${...})
        if (/var\(\s*`?--[a-zA-Z0-9_-]*\$\{/.test(line)) {
          return;
        }

        for (const match of line.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)) {
          const varName = match[1];
          if (!generatedTokens.has(varName) && !localDeclared.has(varName)) {
            const relPath = fullPath.replace(process.cwd() + '/', '');
            errors.push(`${relPath}:${idx + 1}: Undefined CSS variable '${varName}'`);
          }
        }
      });
    }
  }
}

scanDir(srcDir);

if (errors.length > 0) {
  for (const err of errors) {
    console.error(`error: ${err}`);
  }
  console.error(`check:tokens-used failed with ${errors.length} error(s)`);
  process.exit(1);
}

console.log(
  `check:tokens-used passed: all var(--*) usages resolve to generated tokens or declared custom properties (${generatedTokens.size} generated tokens verified)`,
);
