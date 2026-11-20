// Removes the internal style guide from production output unless PUBLIC_ENABLE_STYLEGUIDE=true (preview builds).
import { existsSync, rmSync } from 'node:fs';

if (process.env.PUBLIC_ENABLE_STYLEGUIDE === 'true') {
  console.log('strip-styleguide: kept (PUBLIC_ENABLE_STYLEGUIDE=true)');
  process.exit(0);
}
const dist = new URL('../dist/', import.meta.url);
for (const target of ['styleguide', 'styleguide.html']) {
  const path = new URL(target, dist);
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
    console.log(`strip-styleguide: removed dist/${target}`);
  }
}
