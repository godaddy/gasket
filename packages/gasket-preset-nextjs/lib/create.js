import path from 'path';
import { fileURLToPath } from 'url';

/** @type {import('@gasket/core').HookHandler<'create'>} */
export default function create(gasket, context) {
  const { files } = context;
  const fileName = fileURLToPath(import.meta.url);
  const generatorDir = path.join(fileName, '..', '..', 'generator');
  files.add(`${generatorDir}/*`);
}
