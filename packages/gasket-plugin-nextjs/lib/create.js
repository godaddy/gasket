const { name, version, devDependencies } = require('../package.json');

/**
 * createAppFiles
 * @property {Files} files - The Gasket Files API.
 * @property {string} generatorDir - The directory of the generator.
 * @property {string} nextServerType - Selected server type from prompt
 * @property {string} appStructure - Structure of the app
 * @property {boolean} typescript - Selected typescript from prompt
 * @property {Readme} readme - The Gasket Readme API.
 */

async function createAppFiles({
  files,
  generatorDir,
  nextServerType,
  appStructure,
  typescript,
  readme
}) {
  const globIgnore = typescript ? '!(*.js|.jsx)' : '!(*.ts|*.tsx)';

  files.add(
    `${generatorDir}/app/${appStructure}/**/${globIgnore}`
  );

  await readme.markdownFile(`${generatorDir}/markdown/${appStructure}.md`);
  if (nextServerType === 'customServer') {
    await readme.markdownFile(`${generatorDir}/markdown/custom-server.md`);
  }
}

/**
 * createTestFiles
 * @property {Files} files - The Gasket Files API.
 * @property {generatorDir} - The directory of the generator.
 * @property {testPlugins} - Array of selected test plugins
 * @property {appStructure} - Structure of the app
 * @property {typescript} - Selected typescript from prompt
 */
function createTestFiles({ files, generatorDir, testPlugins, appStructure, typescript }) {
  if (!testPlugins || testPlugins.length === 0) return;
  const unit = ['jest', 'mocha'];
  const integration = ['cypress'];
  const frameworks = [...unit, ...integration];
  const frameworksRegex = new RegExp(frameworks.join('|'));
  const globIgnore = typescript ? '!(*.js|*.jsx)' : '!(*.ts|*.tsx)';

  testPlugins.forEach((testPlugin) => {
    const match = frameworksRegex.exec(testPlugin);
    if (match) {
      const matchedFramework = match[0];
      if (unit.includes(matchedFramework)) {
        files.add(`${generatorDir}/${matchedFramework}/${appStructure}/*`, `${generatorDir}/${matchedFramework}/${appStructure}/**/${globIgnore}`);
      } else {
        files.add(`${generatorDir}/${matchedFramework}/*`, `${generatorDir}/${matchedFramework}/**/*`);
      }
    }
  });
}

/**
 * createNextFiles - Add next.config.js & server.mjs to files
 * @property {Files} files - The Gasket Files API.
 * @property {generatorDir} - The directory of the generator.
 * @property {nextDevProxy} - Selected dev proxy from prompt
 * @property {typescript} - Selected typescript from prompt
 */
function createNextFiles({ files, generatorDir, nextDevProxy, typescript, nextServerType }) {
  let glob;

  // TS specific next.config.js
  if (typescript) {
    glob = `${generatorDir}/next/typescript/*`;
    // if no proxy and using defaultServer, add next.config.js
  } else if (!nextDevProxy && nextServerType !== 'customServer') {
    glob = `${generatorDir}/next/*(next.config).js`;
    // if proxy or customServer, add server.js & next.config.js
  } else {
    glob = `${generatorDir}/next/*.js`;
  }

  files.add(glob);
}

/**
 * configureSitemap
 * @property {Files} files - The Gasket Files API.
 * @property {PackageJsonBuilder} pkg - The Gasket PackageJson API.
 * @property {generatorDir} - The directory of the generator.
 */
function configureSitemap({ files, pkg, generatorDir }) {
  pkg.add('dependencies', {
    'next-sitemap': '^3.1.29'
  });

  files.add(`${generatorDir}/sitemap/*`);
  pkg.add('scripts', {
    sitemap: 'next-sitemap'
  });
}

/**
 * addDependencies
 * @property {PackageJsonBuilder} pkg - The Gasket PackageJson API.
 * @property {boolean} typescript - Selected typescript from prompt
 */
function addDependencies({ pkg, typescript }) {
  pkg.add('dependencies', {
    '@gasket/assets': devDependencies['@gasket/assets'],
    '@gasket/nextjs': devDependencies['@gasket/nextjs'],
    [name]: `^${version}`,
    'next': devDependencies.next,
    'react': devDependencies.react,
    'react-dom': devDependencies['react-dom']
  });

  // Add nodemon for dev if not using TS
  if (typescript === false) {
    pkg.add('devDependencies', {
      nodemon: devDependencies.nodemon
    });
  }
}

/**
 * addNpmScripts
 * @property {PackageJsonBuilder} pkg - The Gasket PackageJson API.
 * @property {string} nextServerType - Selected server type from prompt
 * @property {boolean} nextDevProxy - Selected dev proxy from prompt
 * @property {boolean} typescript - Selected typescript from prompt
 * @property {boolean} hasGasketIntl - Selected gasket-intl from prompt
 */
function addNpmScripts({ pkg, nextServerType, nextDevProxy, typescript, hasGasketIntl }) {
  const fileExtension = typescript ? 'ts' : 'js';
  const bin = typescript ? 'tsx' : 'node';
  const watcher = typescript ? 'tsx watch' : 'nodemon';
  const prebuild = hasGasketIntl ? { prebuild: `${bin} gasket.${fileExtension} build` } : {};

  const scripts = {
    build: 'next build',
    start: 'next start',
    local: 'next dev',
    preview: 'npm run build && npm run start',
    ...prebuild
  };

  if (nextServerType === 'customServer') {
    if (typescript) {
      scripts.start = 'node dist/server.js';
      scripts['build:tsc'] = 'tsc -p ./tsconfig.server.json';
      scripts.build = 'npm run build:tsc && next build';
      scripts.local = `npm run build:tsc && GASKET_DEV=1 ${watcher} server.${fileExtension}`;
    } else {
      scripts.start = 'node server.js';
      scripts.build = 'next build';
      scripts.local = `GASKET_DEV=1 ${watcher} server.${fileExtension}`;
    }
  } else if (nextDevProxy) {
    scripts.local = `${scripts.local} & ${watcher} server.${fileExtension}`;
    scripts['start:local'] = `${scripts.start} & ${bin} server.${fileExtension}`;
    scripts.preview = `${scripts.preview} & ${bin} server.${fileExtension}`;
  }

  pkg.add('scripts', scripts);
}

/**
 * @param {Object} params
 * @param {any} [params.gasketConfig]
 * @param {any} [params.nextDevProxy]
 * @param {any} [params.nextServerType]
 */
function addConfig({ gasketConfig, nextDevProxy, nextServerType }) {
  gasketConfig.addPlugin('pluginNextjs', name);

  if (nextDevProxy && nextServerType !== 'customServer') {
    gasketConfig.add('devProxy', {
      protocol: 'http',
      hostname: 'localhost',
      port: 80,
      xfwd: true,
      ws: true,
      target: {
        host: 'localhost',
        port: 3000
      }
    });
  }
}

module.exports = {
  timing: {
    before: ['@gasket/plugin-intl']
  },
  /**
   * Add files & extend package.json for new apps.
   * @type {import('@gasket/core').HookHandler<'create'>}
   */
  handler: async function create(gasket, context) {
    const {
      files,
      pkg,
      readme,
      testPlugins,
      addSitemap,
      nextServerType,
      nextDevProxy,
      typescript,
      useAppRouter,
      hasGasketIntl
    } = context;
    const generatorDir = `${__dirname}/../generator`;
    const appStructure = useAppRouter ? 'app-router' : 'pages-router';

    await createAppFiles({ files, generatorDir, nextServerType, appStructure, typescript, readme });
    createTestFiles({ files, generatorDir, testPlugins, appStructure, typescript });
    createNextFiles({ files, generatorDir, nextDevProxy, typescript, nextServerType });
    addDependencies({ pkg, typescript });
    addNpmScripts({ pkg, nextServerType, nextDevProxy, typescript, hasGasketIntl });
    addConfig(context);
    if (addSitemap) configureSitemap({ files, pkg, generatorDir });
  }
};
