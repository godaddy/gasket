/// <reference types="@gasket/core" />

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import packageJson from '../package.json' with { type: 'json' };
const { name, version, devDependencies } = packageJson;
const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

const createTestFiles = ({ files, generatorDir, testPlugins, globIgnore }) => {
  if (!testPlugins || testPlugins.length === 0) return;
  const unit = ['jest', 'mocha', 'vitest'];
  const integration = ['cypress'];
  const frameworks = [...unit, ...integration];
  const frameworksRegex = new RegExp(frameworks.join('|'));

  testPlugins.forEach((testPlugin) => {
    const match = frameworksRegex.exec(testPlugin);
    if (match) {
      const matchedFramework = match[0];
      if (unit.includes(matchedFramework)) {
        files.add(`${generatorDir}/${matchedFramework}/*`, `${generatorDir}/${matchedFramework}/**/${globIgnore}`);
      } else {
        files.add(`${generatorDir}/${matchedFramework}/*`, `${generatorDir}/${matchedFramework}/**/*`);
      }
    }
  });
};

/**
 * Add files & extend package.json for new apps.
 * @type {import('@gasket/core').HookHandler<'create'>}
 */
export default async function create(gasket, context) {
  const {
    files,
    typescript,
    apiApp,
    addApiRoutes = true,
    testPlugins,
    pkg,
    gasketConfig
  } = context;
  const generatorDir = join(dirName, '..', 'generator');

  gasketConfig.addPlugin('pluginExpress', name);

  pkg.add('dependencies', {
    [name]: `^${version}`,
    express: devDependencies.express
  });

  if (apiApp && addApiRoutes) {
    const globIgnore = typescript ? '!(*.js)' : '!(*.ts)';
    files.add(`${generatorDir}/app/**/${globIgnore}`);
    gasketConfig.addPlugin('pluginRoutes', './plugins/routes-plugin.js');

    createTestFiles({ files, generatorDir, testPlugins, globIgnore });
  }
}
