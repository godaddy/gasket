#!/usr/bin/env node

import { join } from 'path';
const location = ['@gasket', 'cli', 'bin', 'run'];
const local = join(process.cwd(), 'node_modules', ...location);

//
// We want to prefer the local installation of a `@gasket/cli` instead of a
// global installation. So we are going to check if a `@gasket/cli` is installed
// as dependency, and if that is the case, we're going to execute that `run`
// executable instead of our own.
//
import(local).catch(async () => {
  console.log('------------------------------');
  console.log('ESM PORT!!!');
  console.log('------------------------------');
  //
  // If the local installation failed, we're going to execute our own `run`
  // executable.
  //
  await import('./run.js');
});
