/* eslint-disable complexity,max-statements */
const { eslintConfigIdentifier, stylelintConfigIdentifier } = require('./utils');


/**
 *
 * @typedef {object} CodeStyle
 *
 * @property {string} name - Proper name to show in prompt. Do not set to keep from prompt choices
 * @property {function(context: CreateContext, utils: CodeStyleUtils)} create - Create steps for the code style
 * @property {boolean} [allowStylelint] - If should prompt for adding stylelint
 */


/**
 * GoDaddy JavaScript Style
 * @see: https://github.com/godaddy/javascript
 *
 * @type {CodeStyle}
 */
const godaddy = {
  name: 'GoDaddy',
  allowStylelint: true,
  create: async (context, utils) => {
    const { pkg, addStylelint } = context;
    const { gatherDevDeps } = utils;

    const hasFlow = pkg.has('devDependencies', 'flow-bin');
    const hasReact = pkg.has('dependencies', 'react');
    const hasReactIntl = pkg.has('dependencies', 'react-intl');

    let configName = 'godaddy';
    if (hasReact && hasFlow) {
      configName = 'godaddy-react-flow';
    } else if (hasReact) {
      configName = 'godaddy-react';
    } else if (hasFlow) {
      configName = 'godaddy-flow';
    }

    pkg.add('devDependencies', (await gatherDevDeps(`eslint-config-${configName}`)));
    pkg.add('eslintConfig', { extends: [configName] });

    if (hasReactIntl) {
      pkg.add('devDependencies', (await gatherDevDeps('@godaddy/eslint-plugin-react-intl')));
      pkg.add('eslintConfig', { extends: ['plugin:@godaddy/react-intl/recommended'] });
    }

    if (addStylelint) {
      const stylelintName = 'stylelint-config-godaddy';
      pkg.add('devDependencies', (await gatherDevDeps(stylelintName)));
      pkg.add('stylelint', { extends: [stylelintName] });
    }
  }
};

/**
 * JavaScript Standard Style
 * @see: https://standardjs.com/
 *
 * @type {CodeStyle}
 */
const standard = {
  name: 'Standard',
  create: async (context, utils) => {
    const { pkg } = context;
    const { gatherDevDeps } = utils;

    const devDeps = await Promise.all([
      gatherDevDeps('standard'),
      gatherDevDeps('snazzy')
    ]);

    pkg.add('devDependencies', devDeps.reduce((acc, cur) => ({ ...acc, ...cur }), {}));

    pkg.add('scripts', {
      'lint': 'standard | snazzy',
      'lint:fix': 'standard --fix | snazzy'
    });

    if (pkg.has('devDependencies', 'jest')) {
      pkg.add('standard', { env: ['jest'] });
    } else if (pkg.has('devDependencies', 'mocha')) {
      pkg.add('standard', { env: ['mocha'] });
    }

    pkg.add('standard', { ignore: ['build/'] });
  }
};

/**
 * Airbnb JavaScript Style
 * @see: https://github.com/airbnb/javascript
 *
 * @type {CodeStyle}
 */
const airbnb = {
  name: 'Airbnb',
  allowStylelint: true,
  create: async (context, utils) => {
    const { pkg, addStylelint } = context;
    const { gatherDevDeps } = utils;

    const hasReact = pkg.has('dependencies', 'react');

    let configName = 'airbnb-base';
    if (hasReact) configName = 'airbnb';

    pkg.add('devDependencies', (await gatherDevDeps(`eslint-config-${configName}`)));
    pkg.add('eslintConfig', { extends: [configName] });

    if (addStylelint) {
      const stylelintName = 'stylelint-config-airbnb';
      pkg.add('devDependencies', (await gatherDevDeps(stylelintName)));
      pkg.add('stylelint', { extends: [stylelintName] });
    }
  }
};

/**
 * Allows users to type in the name of an eslint config and stylelint config.
 *
 * @type {CodeStyle}
 */
const other = {
  name: 'other (input eslint config)',
  allowStylelint: true,
  create: async (context, utils) => {
    const { pkg, eslintConfig, stylelintConfig } = context;
    const { gatherDevDeps } = utils;

    if (eslintConfig) {
      const configName = eslintConfigIdentifier(eslintConfig).fullName;
      pkg.add('devDependencies', (await gatherDevDeps(configName)));
      pkg.add('eslintConfig', { extends: [eslintConfig] });
    }

    if (stylelintConfig) {
      const stylelintName = stylelintConfigIdentifier(stylelintConfig).fullName;
      pkg.add('devDependencies', (await gatherDevDeps(stylelintName)));
      pkg.add('stylelint', { extends: [stylelintConfig] });
    }
  }
};

/**
 * Create an app without any linting setup
 *
 * @type {CodeStyle}
 */
const none = {
  name: 'none (not recommended)'
};

/**
 * This does not show up as a prompt choice, but is common setup that runs
 * for all code styles choices (except, of course, none).
 *
 * @type {CodeStyle}
 */
const common = {
  // no name = no choice
  create: async (context, utils) => {
    const { pkg } = context;
    const { runScriptStr } = utils;

    const hasEslint = pkg.has('devDependencies', 'eslint');
    const hasStylelint = pkg.has('devDependencies', 'stylelint');

    //
    // Handle common eslint configuration
    //
    if (hasEslint) {
      if (!pkg.has('scripts', 'lint')) {
        pkg.add('scripts', {
          'lint': 'eslint --ext .js,.jsx .',
          'lint:fix': runScriptStr('lint -- --fix')
        });
      }

      if (pkg.has('devDependencies', 'jest')) {
        pkg.add('eslintConfig', { env: { jest: true } });
      } else if (pkg.has('devDependencies', 'mocha')) {
        pkg.add('eslintConfig', { env: { mocha: true } });
      }

      pkg.add('eslintIgnore', [
        'coverage/',
        'build/'
      ]);

      const hasNext = pkg.has('dependencies', 'next');
      const hasJSXA11y = pkg.has('devDependencies', 'eslint-plugin-jsx-a11y');

      if (hasNext && hasJSXA11y) {
        pkg.add('eslintConfig', {
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
      }
    }

    //
    // Handle common stylelint configuration
    //
    if (hasStylelint) {
      if (!pkg.has('scripts', 'stylelint')) {
        pkg.add('scripts', {
          'stylelint': 'stylelint "**/*.scss"',
          'stylelint:fix': runScriptStr('stylelint -- --fix')
        });
      }
    }

    if (!pkg.has('scripts', 'posttest')) {
      if (hasEslint && hasStylelint) {
        pkg.add('scripts', { posttest: `${runScriptStr('lint')} && ${runScriptStr('stylelint')}` });
      } else if (hasEslint) {
        pkg.add('scripts', { posttest: `${runScriptStr('lint')}` });
      } else if (hasStylelint) {
        pkg.add('scripts', { posttest: `${runScriptStr('stylelint')}` });
      }
    }
  }
};

module.exports = {
  godaddy,
  standard,
  airbnb,
  other,
  none,
  common
};
