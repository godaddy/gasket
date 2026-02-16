import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import express from './express.js';
import fastify from './fastify.js';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);
const packageJson = JSON.parse(readFileSync(join(dirName, '../package.json'), 'utf8'));

const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    express,
    fastify
  }
};

export default plugin;
