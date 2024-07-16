/* eslint-disable complexity,max-statements */
const { devDependencies } = require('../package.json');

/**
 * GoDaddy JavaScript Style
 * @see https://github.com/godaddy/javascript
 * @type {import('./internal').CodeStyle}
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
    const hasNext = pkg.has('dependencies', 'next');

    let configName = 'godaddy';
    if (hasReact && hasFlow) {
      configName = 'godaddy-react-flow';
    } else if (hasReact) {
      configName = 'godaddy-react';
    } else if (hasFlow) {
      configName = 'godaddy-flow';
    }

    pkg.add(
      'devDependencies',
      await gatherDevDeps(`eslint-config-${configName}`)
    );
    pkg.add('eslintConfig', { extends: [configName] });

    if (hasReactIntl) {
      const pluginName = '@godaddy/eslint-plugin-react-intl';
      const deps = await gatherDevDeps(pluginName);
      // only add the plugin to avoid stomping config version
      pkg.add('devDependencies', {
        [pluginName]: deps[pluginName]
      });
      pkg.add('eslintConfig', {
        extends: ['plugin:@godaddy/react-intl/recommended'],
        settings: {
          localeFiles: ['public/locales/en-US.json']
        }
      });
    }

    if (addStylelint) {
      const stylelintName = 'stylelint-config-godaddy';
      pkg.add('devDependencies', await gatherDevDeps(stylelintName));
      pkg.add('stylelint', { extends: [stylelintName] });
    }

    if (hasNext) {
      pkg.add('devDependencies', {
        'eslint-config-next': devDependencies['eslint-config-next']
      });
      pkg.add('eslintConfig', { extends: ['next'] });
    }
  }
};

/**
 * JavaScript Standard Style
 * @see https://standardjs.com/
 * @type {import('./internal').CodeStyle}
 */
const standard = {
  name: 'Standard',
  create: async (context, utils) => {
    const { pkg } = context;
    const { gatherDevDeps } = utils;
    const hasNext = pkg.has('dependencies', 'next');

    const devDeps = await Promise.all([
      gatherDevDeps('standard'),
      gatherDevDeps('snazzy')
    ]);

    pkg.add(
      'devDependencies',
      devDeps.reduce((acc, cur) => ({ ...acc, ...cur }), {})
    );

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

    if (hasNext) {
      pkg.add('devDependencies', {
        'eslint-config-next': devDependencies['eslint-config-next']
      });
      pkg.add('eslintConfig', { extends: ['next'] });
    }
  }
};

/**
 * Airbnb JavaScript Style
 * @see https://github.com/airbnb/javascript
 * @type {import('./internal').CodeStyle}
 */
const airbnb = {
  name: 'Airbnb',
  allowStylelint: true,
  create: async (context, utils) => {
    const { pkg, addStylelint } = context;
    const { gatherDevDeps } = utils;

    const hasReact = pkg.has('dependencies', 'react');
    const hasNext = pkg.has('dependencies', 'next');

    let configName = 'airbnb-base';
    if (hasReact) configName = 'airbnb';

    pkg.add(
      'devDependencies',
      await gatherDevDeps(`eslint-config-${configName}`)
    );
    pkg.add('eslintConfig', { extends: [configName] });

    if (addStylelint) {
      const stylelintName = 'stylelint-config-airbnb';
      pkg.add('devDependencies', await gatherDevDeps(stylelintName));
      pkg.add('stylelint', { extends: [stylelintName] });
    }

    if (hasNext) {
      pkg.add('devDependencies', {
        'eslint-config-next': devDependencies['eslint-config-next']
      });
      pkg.add('eslintConfig', { extends: ['next'] });
    }
  }
};

/**
 * Allows users to type in the name of an eslint config and stylelint config.
 * @type {import('./internal').CodeStyle}
 */
const other = {
  name: 'other (input eslint config)',
  allowStylelint: true,
  create: async (context, utils) => {
    const { pkg, eslintConfig, stylelintConfig } = context;
    const { gatherDevDeps } = utils;

    if (eslintConfig) {
      const hasNext = pkg.has('dependencies', 'next');

      pkg.add('devDependencies', await gatherDevDeps(eslintConfig));
      pkg.add('eslintConfig', { extends: [eslintConfig] });

      if (hasNext) {
        pkg.add('devDependencies', {
          'eslint-config-next': devDependencies['eslint-config-next']
        });
        pkg.add('eslintConfig', { extends: ['next'] });
      }
    }

    if (stylelintConfig) {
      pkg.add('devDependencies', await gatherDevDeps(stylelintConfig));
      pkg.add('stylelint', { extends: [stylelintConfig] });
    }
  }
};

/**
 * Create an app without any linting setup
 * @type {import('./internal').CodeStyle}
 */
const none = {
  name: 'none (not recommended)'
};

/**
 * This does not show up as a prompt choice, but is common setup that runs for
 * all code styles choices (except, of course, none).
 * @type {import('./internal').CodeStyle}
 */
const common = {
  // no name = no choice
  create: async (context, utils) => {
    const { pkg, typescript } = context;
    const { runScriptStr } = utils;

    const hasEslint = pkg.has('devDependencies', 'eslint');
    const hasStylelint = pkg.has('devDependencies', 'stylelint');

    // Handle common eslint configuration
    if (hasEslint) {
      if (!pkg.has('scripts', 'lint')) {
        const exts = `.js,.jsx,.cjs${typescript ? ',.ts,.tsx' : ''}`;

        pkg.add('scripts', {
          'lint': `eslint --ext ${exts} .`,
          'lint:fix': runScriptStr('lint -- --fix')
        });
      }

      if (typescript) {
        pkg.add('devDependencies', {
          '@typescript-eslint/parser': devDependencies['@typescript-eslint/parser']
        });

        pkg.add('eslintConfig', {
          parser: '@typescript-eslint/parser'
        });
      }

      if (pkg.has('devDependencies', 'jest')) {
        pkg.add('eslintConfig', { env: { jest: true } });
      } else if (pkg.has('devDependencies', 'mocha')) {
        pkg.add('eslintConfig', { env: { mocha: true } });
      }

      pkg.add('eslintIgnore', ['coverage/', 'build/']);

      const hasNext = pkg.has('dependencies', 'next');
      const hasJSXA11y = pkg.has('devDependencies', 'eslint-plugin-jsx-a11y');

      if (hasNext && hasJSXA11y) {
        pkg.add('eslintConfig', {
          rules: {
            // The following disables 'noHref' rule for `<a>` and adds other
            // checks for next/link and next-routes `<Link as= route=>`
            'jsx-a11y/anchor-is-valid': [
              'error',
              {
                components: ['Link'],
                specialLink: ['route', 'as'],
                aspects: ['invalidHref', 'preferButton']
              }
            ]
          }
        });
      }

      if (hasNext) {
        pkg.add('devDependencies', {
          'eslint-config-next': devDependencies['eslint-config-next']
        });
        pkg.add('eslintConfig', { extends: ['next'] });
      }
    }

    // Handle common stylelint configuration
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
        pkg.add('scripts', {
          posttest: `${runScriptStr('lint')} && ${runScriptStr('stylelint')}`
        });
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
