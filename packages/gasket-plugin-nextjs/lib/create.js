const { name, version, devDependencies } = require('../package');

/**
 * createAppFiles
 * @property {Files} files - The Gasket Files API.
 * @property {generatorDir} - The directory of the generator.
 */
function createAppFiles({ files, generatorDir }) {
  files.add(
    `${generatorDir}/app/.*`,
    `${generatorDir}/app/*`,
    `${generatorDir}/app/**/*`
  );
}

/**
 * createTestFiles
 * @property {Files} files - The Gasket Files API.
 * @property {generatorDir} - The directory of the generator.
 * @property {testPlugin} - Selected test plugin from prompt
 */
function createTestFiles({ files, generatorDir, testPlugin }) {
  const frameworks = ['jest', 'mocha', 'cypress'];
  frameworks.forEach((tester) => {
    const regex = new RegExp(`${tester}`);
    if (regex.test(testPlugin)) {
      files.add(`${generatorDir}/${tester}/*`, `${generatorDir}/${tester}/**/*`);
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
function createNextFiles({ files, generatorDir, nextDevProxy, typescript }) {
  let glob;
  if (typescript || !nextDevProxy) glob = `${generatorDir}/next/*[!server].js`;
  else glob = `${generatorDir}/next/*`;
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
 */
function addDependencies({ pkg, nextDevProxy }) {
  pkg.add('dependencies', {
    '@gasket/assets': devDependencies['@gasket/assets'],
    '@gasket/nextjs': devDependencies['@gasket/nextjs'],
    'next': devDependencies.next,
    'prop-types': devDependencies['prop-types'],
    'react': devDependencies.react,
    'react-dom': devDependencies['react-dom']
  });

  if (nextDevProxy) {
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
 * @property {nextServerType} - Selected server type from prompt
 * @property {nextDevProxy} - Selected dev proxy from prompt
 * @property {typescript} - Selected typescript from prompt
 */
function addNpmScripts({ pkg, nextServerType, nextDevProxy, typescript }) {
  const fileExtension = typescript ? 'ts' : 'js';
  const scripts = {
    defaultServer: {
      'build': 'next build',
      'start': 'next start',
      'start:local': `next start & GASKET_ENV=local node server.${fileExtension}`,
      'local': `next dev${nextDevProxy ? ` & nodemon server.${fileExtension}` : ''}`
    },
    customServer: {
      'build': 'next build',
      'start': `next build && node server.${fileExtension}`,
      'start:local': `next build && GASKET_ENV=local node server.${fileExtension}`,
      'local': `GASKET_DEV=1 GASKET_ENV=local nodemon server.${fileExtension}`
    }
  };

  pkg.add('scripts', scripts[nextServerType]);
}

function addConfig({ pkg, gasketConfig, nextDevProxy }) {
  gasketConfig.addPlugin('pluginNextjs', name);
  pkg.add('dependencies', {
    [name]: `^${version}`
  });

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
   *
   * @param {Gasket} gasket - The Gasket API.
   * @param {CreateContext} context - Create context
   * @param {Files} context.files - The Gasket Files API.
   * @param {PackageJson} context.pkg - The Gasket PackageJson API.
   * @param {PluginName} context.testPlugin - The name of included test plugins.
   * @public
   */
  handler: function create(gasket, context) {
    const {
      files,
      pkg, testPlugin,
      addSitemap,
      nextServerType,
      nextDevProxy,
      typescript
    } = context;
    const generatorDir = `${__dirname}/../generator`;

    createAppFiles({ files, generatorDir });
    createTestFiles({ files, generatorDir, testPlugin });
    createNextFiles({ files, generatorDir, nextDevProxy, typescript });
    addDependencies({ pkg, nextDevProxy });
    addNpmScripts({ pkg, nextServerType, nextDevProxy, typescript });
    addConfig(context);
    if (addSitemap) configureSitemap({ files, pkg, generatorDir });
    if (pkg.has('dependencies', '@gasket/redux')) addRedux({ files, pkg, generatorDir });
  }
};
