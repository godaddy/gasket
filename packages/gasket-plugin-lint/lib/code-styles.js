const { devDependencies } = require('../package.json');

const packageUtils = {
  hasDependency(pkg, type, name) {
    return pkg.has(type, name);
  },

  async addDevDependencies(pkg, dependencies, gatherDevDeps) {
    const deps = await Promise.all(dependencies.map(gatherDevDeps));
    pkg.add('devDependencies', Object.assign({}, ...deps));
  },

  addEslintConfig(pkg, extendsArray, settings = {}) {
    pkg.add('eslintConfig', { extends: extendsArray, ...settings });
  },

  addScript(pkg, name, command) {
    pkg.add('scripts', { [name]: command });
  },

  async setupStylelint(pkg, gatherDevDeps, configName) {
    await packageUtils.addDevDependencies(pkg, [configName], gatherDevDeps);
    pkg.add('stylelint', { extends: [configName] });
  },

  async setupNext(pkg) {
    pkg.add('devDependencies', {
      'eslint-config-next': devDependencies['eslint-config-next'],
      'typescript': devDependencies.typescript
    });
    packageUtils.addEslintConfig(pkg, ['next']);
  },

  async setupReactIntl(pkg, gatherDevDeps) {
    const pluginName = '@godaddy/eslint-plugin-react-intl';
    const deps = await gatherDevDeps(pluginName);
    pkg.add('devDependencies', { [pluginName]: deps[pluginName] });
    packageUtils.addEslintConfig(pkg, ['plugin:@godaddy/react-intl/recommended'], {
      settings: { localeFiles: ['locales/en-US.json'] }
    });
  },

  async setupStandardLinting(pkg, gatherDevDeps) {
    await packageUtils.addDevDependencies(pkg, ['standard', 'snazzy'], gatherDevDeps);
    packageUtils.addScript(pkg, 'lint', 'standard | snazzy');
    packageUtils.addScript(pkg, 'lint:fix', 'standard --fix | snazzy');
  },

  setupTestEnv(pkg) {
    let env = null;

    if (packageUtils.hasDependency(pkg, 'devDependencies', 'jest')) {
      env = 'jest';
    } else if (packageUtils.hasDependency(pkg, 'devDependencies', 'mocha')) {
      env = 'mocha';
    } else if (packageUtils.hasDependency(pkg, 'devDependencies', 'vitest')) {
      env = 'vitest';
    }
    
    if (env) {
      pkg.add('standard', { env: [env] });
    }

    pkg.add('standard', { ignore: ['build/'] });
  }
};

/**
 * GoDaddy JavaScript Style
 * @see https://github.com/godaddy/javascript
 * @type {import('./internal').CodeStyle}
 */
const godaddy = {
  name: 'GoDaddy',
  allowStylelint: true,
  async create(context, utils) {
    const { pkg, addStylelint } = context;
    const { gatherDevDeps } = utils;
    const { hasDependency, addDevDependencies, addEslintConfig, setupStylelint, setupNext, setupReactIntl } = packageUtils;

    let configName = 'godaddy';
    if (hasDependency(pkg, 'dependencies', 'react')) configName += '-react';
    if (hasDependency(pkg, 'devDependencies', 'flow-bin')) configName += '-flow';

    await addDevDependencies(pkg, [`eslint-config-${configName}`], gatherDevDeps);
    addEslintConfig(pkg, [configName]);

    if (hasDependency(pkg, 'dependencies', 'react-intl')) await setupReactIntl(pkg, gatherDevDeps);
    if (addStylelint) await setupStylelint(pkg, gatherDevDeps, 'stylelint-config-godaddy');
    if (hasDependency(pkg, 'dependencies', 'next')) await setupNext(pkg);
  }
};

/**
 * JavaScript Standard Style
 * @see https://standardjs.com/
 * @type {import('./internal').CodeStyle}
 */
const standard = {
  name: 'Standard',
  allowStylelint: false,
  async create(context, utils) {
    const { pkg } = context;
    const { gatherDevDeps } = utils;
    const { hasDependency, setupStandardLinting, setupTestEnv, addEslintConfig } = packageUtils;

    await setupStandardLinting(pkg, gatherDevDeps);
    setupTestEnv(pkg);

    if (hasDependency(pkg, 'dependencies', 'next')) {
      pkg.add('devDependencies', { 'eslint-config-next': devDependencies['eslint-config-next'] });
      addEslintConfig(pkg, ['next']);
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
  async create(context, utils) {
    const { pkg, addStylelint } = context;
    const { gatherDevDeps } = utils;
    const { hasDependency, addDevDependencies, addEslintConfig, setupStylelint, setupNext } = packageUtils;

    const configName = hasDependency(pkg, 'dependencies', 'react') ? 'airbnb' : 'airbnb-base';
    await addDevDependencies(pkg, [`eslint-config-${configName}`], gatherDevDeps);
    addEslintConfig(pkg, [configName]);

    if (addStylelint) await setupStylelint(pkg, gatherDevDeps, 'stylelint-config-airbnb');
    if (hasDependency(pkg, 'dependencies', 'next')) await setupNext(pkg);
  }
};

/**
 * Create an app without any linting setup
 * @type {import('./internal').CodeStyle}
 */
const none = {
  name: 'none (not recommended)',
  allowStylelint: false
};

/**
 * This does not show up as a prompt choice, but is common setup that runs for
 * all code styles choices (except, of course, none).
 * @type {import('./internal').CodeStyle}
 */
const common = {
  // No name = no choice
  async create(context, utils) {
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
          'stylelint': 'stylelint "**/*.(css|scss)"',
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
  none,
  common
};
