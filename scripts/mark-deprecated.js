import { globSync } from 'glob';
import { createRequire } from 'module';
import * as path from 'path';
import { execSync } from 'child_process';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(new URL(import.meta.url).pathname);

/**
 * Find all packages with a `deprecated` property and `npm deprecate` them.
 * The `deprecated` value should be the message displayed
 */
function main() {
  const packagePaths = globSync('packages/*/package.json');
  const deprecated = packagePaths.map(p => require(path.join(__dirname, '..', p))).filter(pkg => pkg.deprecated);

  deprecated.forEach(pkg => {
    const cmd = `npm deprecate ${ pkg.name }@${ pkg.version } "${ pkg.deprecated }"`;

    try {
      console.log(cmd);
      execSync(cmd, { stdio: [0, 1, 2] });
    } catch (e) {
      console.error(e);
    }
  });
}

main();
