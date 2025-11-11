import packageJson from '../package.json' with { type: 'json' };
const { name, version, devDependencies } = packageJson;

/** @type {import('@gasket/core').HookHandler<'create'>} */
export default function create(gasket, { pkg, files, gasketConfig }) {
  const generatorDir = new URL('../generator', import.meta.url).pathname;

  gasketConfig.addPlugin('pluginElasticApm', name);

  pkg.add('dependencies', {
    [name]: `^${version}`,
    'dotenv': devDependencies.dotenv,
    'elastic-apm-node': devDependencies['elastic-apm-node']
  });

  pkg.extend((current) => {
    return {
      scripts: {
        start: `NODE_OPTIONS=--import=./setup.js ${current.scripts.start}`
      }
    };
  });

  files.add(`${generatorDir}/*`);
}
