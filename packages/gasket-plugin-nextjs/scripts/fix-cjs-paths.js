import { readFileSync, writeFileSync } from 'fs';

const file = 'cjs/webpack-config.cjs';
const content = readFileSync(file, 'utf8');
const updated = content
  .replace(/\.mjs/g, '.cjs')
  .replace('./utils/try-resolve.js', './utils/try-resolve.cjs');
writeFileSync(file, updated);
