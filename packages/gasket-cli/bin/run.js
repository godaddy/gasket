#!/usr/bin/env node
import { setup } from '../src/utils/setup.js';

async function main() {
  await setup();
  const { execute } = await import('@oclif/core');
  await execute({ dir: import.meta.url });
}

await main();
