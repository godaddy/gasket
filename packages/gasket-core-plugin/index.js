const url = require('url');
const path = require('path').posix;

/**
 * Collection of lifecycle events that we want to trigger upon.
 *
 * @private
 */
const hooks = {

  /**
   * Add files & extend package.json for new apps.
   *
   * @param {Gasket} gasket - The gasket API.
   * @param {CreateContext} context - Create context
   * @param {Files} context.files - The Gasket Files API.
   * @param {PackageJson} context.pkg - The Gasket PackageJson API.
   * @public
   */
  async create(gasket, context) {
    const { files, pkg } = context;

    files.add(
      `${__dirname}/generator/.*`,
      `${__dirname}/generator/*`,
      `${__dirname}/generator/**/*`
    );

    pkg.add('license', 'UNLICENSED');

    pkg.add('dependencies', {
      '@gasket/assets': '^1.0.0',
      'express': '^4.16.3',
      'next': '^8.0.3',
      'prop-types': '^15.6.2',
      'react': '^16.4.1',
      'react-dom': '^16.4.1',
      'react-transition-group': '^2.4.0'
    });

    pkg.add('devDependencies', {
      'babel-core': '^7.0.0-bridge.0'
    });

    pkg.add('scripts', {
      local: 'gasket local',
      build: 'gasket build',
      start: 'gasket start'
    });
  },

  /**
   * Start up the HTTP servers.
   *
   * @param {Gasket} gasket The gasket API.
   * @returns {Function} Promise-returning function that stops the servers.
   * @public
   */
  start: async function start(gasket) {
    const dev = gasket.command === 'local';
    return await require('./start')(gasket, { dev });
  },

  /**
   * Next.js has a dedicated build step that needs to run before the server
   * starts.
   *
   * @param {Gasket} gasket The gasket API.
   * @public
   */
  build: async function build(gasket) {
    if (gasket.command !== 'local') {
      await gasket.exec('nextBuild');
    }
  },

  /**
   * Workbox config partial to add next.js static assets to precache
   *
   * @param {Gasket} gasket The gasket API.
   * @returns {Object} config
   */
  workbox: function (gasket) {
    const { next = {} } = gasket.config;
    const { assetPrefix = '' } = next;

    const parsed = assetPrefix ? url.parse(assetPrefix) : '';
    const joined = parsed ? url.format({ ...parsed, pathname: path.join(parsed.pathname, '_next/') }) : '_next/';

    return {
      globDirectory: '.',
      globPatterns: [
        '.next/static/**'
      ],
      modifyURLPrefix: {
        '.next/': joined
      }
    };
  }
};

//
// Expose the plugin interface
//
module.exports = {
  dependencies: ['log', 'nextjs', 'express', 'https'],
  name: 'core',
  hooks
};
