/**
 * Adds godaddy-eslint-config-react to the app.
 *
 * @type {Object}
 * @public
 */
module.exports = {
  name: 'lint',
  hooks: {
    /**
     * The actual lifecycle hook.
     *
     * @param {Gasket} gasket Gasket API.
     * @param {Package} pkg Gasket Generator PackageJson API
     * @param {Package} packageManager The package manager type
     * @private
     */
    async create(gasket, { pkg, packageManager }) {
      const runCmd = packageManager === 'npm' ? `npm run` : packageManager;

      pkg.add('devDependencies', {
        '@godaddy/eslint-plugin-react-intl': '^1.0.0',
        'babel-eslint': '^10.0.3',
        'eslint': '^6.2.2',
        'eslint-config-godaddy-react': '^6.0.0',
        'eslint-plugin-json': '^1.4.0',
        'eslint-plugin-jsx-a11y': '^6.2.3',
        'eslint-plugin-mocha': '^6.1.0',
        'eslint-plugin-react': '^7.14.3',
        'stylelint': '^10.1.0',
        'stylelint-config-godaddy': '^0.2.1'
      });

      pkg.add('scripts', {
        'lint': 'eslint --ext .js,.jsx .',
        'lint:fix': `${runCmd} lint -- --fix`,
        'stylelint': 'stylelint "**/*.scss"',
        'pretest': `${runCmd} lint && ${runCmd} stylelint`
      });

      pkg.add('eslintConfig', {
        extends: ['godaddy-react', 'plugin:@godaddy/react-intl/recommended'],
        rules: {
          //
          // The following disables 'noHref' rule for `<a>` and adds other
          // checks for next/link and next-routes `<Link as= route=>`
          //
          'jsx-a11y/anchor-is-valid': [
            'error', {
              components: ['Link'],
              specialLink: ['route', 'as'],
              aspects: ['invalidHref', 'preferButton']
            }
          ]
        }
      });

      pkg.add('eslintIgnore', [
        'coverage'
      ]);

      pkg.add('stylelint', {
        extends: 'stylelint-config-godaddy'
      });
    },

    /**
     * Runs npm run lint after the application is finished being created
     * @param {Gasket} gasket Gasket API
     * @param {Context} context build context
     * @param {Function} runScript function used to run scripts provided by
     * the plugin engine
     * @returns {Promise} completion handler
     * @api private
     */
    async postCreate(gasket, context, { runScript }) {
      await runScript('lint:fix');
      await runScript('stylelint');
    }
  }
};
