const { name, version, devDependencies } = require('../package.json');

/**
 * createAppFiles
 * @property {Files} files - The Gasket Files API.
 * @property {string} generatorDir - The directory of the generator.
 * @property {boolean} useAppRouter - Selected app router from prompt
 * @property {boolean} typescript - Selected typescript from prompt
 */
function createAppFiles({ files, generatorDir, useAppRouter, typescript }) {
  files.add(
    `${generatorDir}/app/shared/**/*`
  );

  const globIgnore = typescript ? '!(*.js|.jsx)' : '!(*.ts|*.tsx)';
  const appStructure = useAppRouter ? 'app-router' : 'pages-router';

  files.add(
    `${generatorDir}/app/${appStructure}/**/${globIgnore}`
  );
}

/**
 * createTestFiles
 * @property {Files} files - The Gasket Files API.
 * @property {generatorDir} - The directory of the generator.
 * @property {testPlugins} - Array of selected test plugins
 */
function createTestFiles({ files, generatorDir, testPlugins }) {
  if (!testPlugins || testPlugins.length === 0) return;

  const frameworks = ['jest', 'mocha', 'cypress'];
  const frameworksRegex = new RegExp(frameworks.join('|'));

  testPlugins.forEach((testPlugin) => {
    const match = frameworksRegex.exec(testPlugin);
    if (match) {
      const matchedFramework = match[0];
      files.add(`${generatorDir}/${matchedFramework}/*`, `${generatorDir}/${matchedFramework}/**/*`);
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
 * addRedux
 * @property {Files} files - The Gasket Files API.
 * @property {PackageJsonBuilder} pkg - The Gasket PackageJson API.
 * @property {generatorDir} - The directory of the generator.
 */
function addRedux({ files, pkg, generatorDir }) {
  pkg.add('dependencies', {
    'next-redux-wrapper': devDependencies['next-redux-wrapper'],
    'lodash.merge': devDependencies['lodash.merge']
  });

  files.add(`${generatorDir}/redux/*`, `${generatorDir}/redux/**/*`);
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
    scripts.start = typescript ?
      `node dist/server.js` :
      `node server.js`;
    scripts.build = typescript ?
      `tsc -p ./tsconfig.server.json && next build` :
      `next build`;
    scripts.local = `GASKET_DEV=1 ${watcher} server.${fileExtension}`;
  } else if (nextDevProxy) {
    scripts.local = `${scripts.local} & ${watcher} server.${fileExtension}`;
    scripts['start:local'] = `${scripts.start} & ${bin} server.${fileExtension}`;
    scripts.preview = `${scripts.preview} & ${bin} server.${fileExtension}`;
  }

  pkg.add('scripts', scripts);
}

function addConfig({ gasketConfig, nextDevProxy }) {
  gasketConfig.addPlugin('pluginNextjs', name);

  if (nextDevProxy) {
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
    before: ['@gasket/plugin-intl'],
    after: ['@gasket/plugin-redux']
  },
  /**
   * Add files & extend package.json for new apps.
   * @type {import('@gasket/core').HookHandler<'create'>}
   */
  handler: function create(gasket, context) {
    const {
      files,
      pkg,
      testPlugins,
      addSitemap,
      nextServerType,
      nextDevProxy,
      typescript,
      useRedux,
      useAppRouter,
      hasGasketIntl
    } = context;
    const generatorDir = `${__dirname}/../generator`;

    createAppFiles({ files, generatorDir, useAppRouter, typescript });
    createTestFiles({ files, generatorDir, testPlugins });
    createNextFiles({ files, generatorDir, nextDevProxy, typescript, nextServerType });
    addDependencies({ pkg, typescript });
    addNpmScripts({ pkg, nextServerType, nextDevProxy, typescript, hasGasketIntl });
    addConfig(context);
    if (addSitemap) configureSitemap({ files, pkg, generatorDir });
    if (useRedux) addRedux({ files, pkg, generatorDir });
  }
};
