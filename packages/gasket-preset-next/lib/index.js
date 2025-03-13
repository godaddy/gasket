import fs from 'fs/promises';
import runPrompts from './prompts.js';
import runActions from './actions/index.js';
import writePkg from './utils/write-package.js';
import writeGasketFile from './utils/gasket-file.js';
import copyFiles from './utils/copy-files.js';


export default async function presetNextJs(context) {
  await fs.mkdir(context.dest, { recursive: true }); // Offload to util or cli
  await runPrompts(context);
  await runActions(context);
  await copyFiles(context);
  await writePkg(context);
  await writeGasketFile(context);
}
