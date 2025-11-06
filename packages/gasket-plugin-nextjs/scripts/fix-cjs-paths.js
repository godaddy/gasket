import { readFileSync, writeFileSync } from 'fs';

const file = 'cjs/webpack-config.cjs';
const content = readFileSync(file, 'utf8');
const updated = content.replace(/\.mjs/g, '.cjs');
writeFileSync(file, updated);
