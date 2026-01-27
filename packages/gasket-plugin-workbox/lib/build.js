/// <reference types="@gasket/plugin-command" />

import { copyWorkboxLibraries } from 'workbox-build';
import { getOutputDir } from './utils.js';

/** @type {import('@gasket/core').HookHandler<'build'>} */
export default async function build(gasket) {
  const buildDir = getOutputDir(gasket);
  await copyWorkboxLibraries(buildDir);
}
