// Generates static digit field fallback SVG poster per docs/01-design/interaction-motion.md (I-05).
// Uses the exact same grid formula: 28px cell, pseudo-random hash, Stack Sans Notch 600.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const OUT_PATH = new URL('../public/assets/digit-field-poster.svg', import.meta.url);
mkdirSync(dirname(OUT_PATH.pathname), { recursive: true });

const CELL_SIZE = 28;
const GRID_SIZE = 20; // 20x20 = 400 cells = 560x560 repeating pattern
const cells = [];

for (let cy = 0; cy < GRID_SIZE; cy++) {
  for (let cx = 0; cx < GRID_SIZE; cx++) {
    const h = Math.sin(cx * 12.9898 + cy * 78.233) * 43758.5453;
    const digit = h - Math.floor(h) > 0.5 ? '1' : '0';
    const px = cx * CELL_SIZE + CELL_SIZE / 2;
    const py = cy * CELL_SIZE + CELL_SIZE / 2;
    cells.push(
      `<text x="${px}" y="${py}" text-anchor="middle" dominant-baseline="central" font-family="'Stack Sans Notch', monospace" font-size="14" font-weight="600" fill="currentColor">${digit}</text>`,
    );
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <pattern id="digit-pattern" width="${GRID_SIZE * CELL_SIZE}" height="${GRID_SIZE * CELL_SIZE}" patternUnits="userSpaceOnUse">
      ${cells.join('\n      ')}
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#digit-pattern)" />
</svg>
`;

writeFileSync(OUT_PATH, svg);
console.log('generate-digit-field-poster: wrote public/assets/digit-field-poster.svg');
