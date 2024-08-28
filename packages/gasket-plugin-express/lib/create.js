/// <reference types="@gasket/core" />

const { name, version, devDependencies } = require('../package.json');

/**
 * createTestFiles
 * @property {Files} files - The Gasket Files API.
 * @property {generatorDir} - The directory of the generator.
 * @property {testPlugins} - Array of selected test plugins
 * @property {globIgnore} - Selected typescript from prompt
 */
function createTestFiles({ files, generatorDir, testPlugins, globIgnore }) {
  if (!testPlugins || testPlugins.length === 0) return;
  const unit = ['jest', 'mocha'];
  const integration = ['cypress'];
  const frameworks = [...unit, ...integration];
  const frameworksRegex = new RegExp(frameworks.join('|'));

  testPlugins.forEach((testPlugin) => {
    const match = frameworksRegex.exec(testPlugin);
    if (match) {
      const matchedFramework = match[0];
      if (unit.includes(matchedFramework)) {
        files.add(`${generatorDir}/${matchedFramework}/*/${globIgnore}`, `${generatorDir}/${matchedFramework}/**/${globIgnore}`);
      } else {
        files.add(`${generatorDir}/${matchedFramework}/*`, `${generatorDir}/${matchedFramework}/**/*`);
      }
    }
  });
}

/**
 * Add files & extend package.json for new apps.
 * @type {import('@gasket/core').HookHandler<'create'>}
 */
module.exports = async function create(gasket, context) {
  const {
    files,
    typescript,
    apiApp,
    testPlugins,
    pkg,
    gasketConfig
  } = context;
  const generatorDir = `${__dirname}/../generator`;

  gasketConfig.addPlugin('pluginExpress', name);

  pkg.add('dependencies', {
    [name]: `^${version}`,
    express: devDependencies.express
  });

  if (apiApp) {
    const globIgnore = typescript ? '!(*.js)' : '!(*.ts)';
    files.add(`${generatorDir}/app/**/${globIgnore}`);

    createTestFiles({ files, generatorDir, testPlugins, globIgnore });
  }
};
