const { name, version, devDependencies } = require('../package.json');

/**
 * createAppFiles
 * @property {Files} files - The Gasket Files API.
 * @property {generatorDir} - The directory of the generator.
 */
function createAppFiles({ files, generatorDir, useAppRouter }) {
  files.add(
    `${generatorDir}/app/shared/**/*`
  );

  const appStructure = useAppRouter ? 'app-router' : 'pages-router';

  files.add(
    `${generatorDir}/app/${appStructure}/**/*`
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
  if (
    typescript ||
    (!nextDevProxy && nextServerType === 'defaultServer')
  ) glob = `${generatorDir}/next/*[!server].js`;
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
function addDependencies({ pkg }) {
  pkg.add('dependencies', {
    '@gasket/assets': devDependencies['@gasket/assets'],
    '@gasket/nextjs': devDependencies['@gasket/nextjs'],
    [name]: `^${version}`,
    'next': devDependencies.next,
    'prop-types': devDependencies['prop-types'],
    'react': devDependencies.react,
    'react-dom': devDependencies['react-dom']
  });

  pkg.add('devDependencies', {
    nodemon: devDependencies.nodemon
  });
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

function addConfig(createContext) {
  const { gasketConfig, nextDevProxy } = createContext;
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
      useAppRouter
    } = context;
    const generatorDir = `${__dirname}/../generator`;

    createAppFiles({ files, generatorDir, useAppRouter });
    createTestFiles({ files, generatorDir, testPlugins });
    createNextFiles({ files, generatorDir, nextDevProxy, typescript, nextServerType });
    addDependencies({ pkg });
    addNpmScripts({ pkg, nextServerType, nextDevProxy, typescript });
    addConfig(context);
    if (addSitemap) configureSitemap({ files, pkg, generatorDir });
    if (useRedux) addRedux({ files, pkg, generatorDir });
    // TODO - remove with typecheck solution
    return;
  }
};
