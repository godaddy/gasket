const { devDependencies } = require('../package.json');
const { pluginIdentifier } = require('@gasket/resolve');

module.exports = {
  timing: {
    before: ['@gasket/plugin-intl'],
    after: ['@gasket/plugin-redux']
  },
  /**
   * Add files & extend package.json for new apps.
   * @type {import('@gasket/engine').HookHandler<'create'>}
   */
  handler: function create(gasket, context) {
    const { files, pkg, testPlugin, addSitemap } = context;

    const generatorDir = `${__dirname}/../generator`;

    files.add(
      `${generatorDir}/app/.*`,
      `${generatorDir}/app/*`,
      `${generatorDir}/app/**/*`
    );

    ['jest', 'mocha', 'cypress'].forEach((tester) => {
      if (
        testPlugin &&
        pluginIdentifier(testPlugin).longName === `@gasket/plugin-${tester}`
      ) {
        files.add(
          `${generatorDir}/${tester}/*`,
          `${generatorDir}/${tester}/**/*`
        );
      }
    });

    pkg.add('dependencies', {
      '@gasket/assets': devDependencies['@gasket/assets'],
      '@gasket/nextjs': devDependencies['@gasket/nextjs'],
      'next': devDependencies.next,
      'prop-types': devDependencies['prop-types'],
      'react': devDependencies.react,
      'react-dom': devDependencies['react-dom']
    });

    if (addSitemap) {
      pkg.add('dependencies', {
        'next-sitemap': '^3.1.29'
      });

      files.add(`${generatorDir}/sitemap/*`);
      pkg.add('scripts', {
        sitemap: 'next-sitemap'
      });
    }

    if (pkg.has('dependencies', '@gasket/redux')) {
      pkg.add('dependencies', {
        'next-redux-wrapper': devDependencies['next-redux-wrapper'],
        'lodash.merge': devDependencies['lodash.merge']
      });

      files.add(`${generatorDir}/redux/*`, `${generatorDir}/redux/**/*`);
    }
  }
};
