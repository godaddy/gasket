const codeStyles = require('../lib/code-styles');
const { devDependencies } = require('../package.json');

// Temporary version pin until ESLint9 app upgrades are complete
const eslintConfigNext = '^13.2.1';
devDependencies['eslint-config-next'] = eslintConfigNext;

describe('code styles', () => {
  let context, utils, pkgHas, pkgAdd;

  beforeEach(() => {
    pkgHas = jest.fn();
    pkgAdd = jest.fn();

    context = {
      pkg: {
        has: pkgHas,
        add: pkgAdd
      },
      addStylelint: false,
      apiApp: false,
      typescript: false
    };

    utils = {
      gatherDevDeps: jest.fn().mockImplementation(dep => Promise.resolve({ [dep]: '*', example: 'latest' })),
      runScriptStr: jest.fn().mockImplementation(name => name)
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const testCodeStyle = (codeStyle, name, allowStylelint) => {
    it('is named', () => {
      expect(codeStyle).toHaveProperty('name', name);
    });

    it(`allows stylelint: ${allowStylelint}`, () => {
      expect(codeStyle.allowStylelint).toBe(allowStylelint);
    });
  };

  describe('godaddy', () => {
    const codeStyle = codeStyles.godaddy;
    testCodeStyle(codeStyle, 'GoDaddy', true);

    it('uses godaddy-react config if react present', async () => {
      pkgHas.mockImplementation((_, name) => ['react'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('devDependencies', expect.objectContaining({
        'eslint-config-godaddy-react': expect.any(String)
      }));
      expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', expect.objectContaining({
        extends: ['godaddy-react']
      }));
    });

    it('uses godaddy-flow config if flow-bin present', async () => {
      pkgHas.mockImplementation((_, name) => ['flow-bin'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('devDependencies', expect.objectContaining({
        'eslint-config-godaddy-flow': expect.any(String)
      }));
      expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', expect.objectContaining({
        extends: ['godaddy-flow']
      }));
    });

    it('uses godaddy-react-flow config if react & flow-bin present', async () => {
      pkgHas.mockImplementation((_, name) => ['react', 'flow-bin'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('devDependencies', expect.objectContaining({
        'eslint-config-godaddy-react-flow': expect.any(String)
      }));
      expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', expect.objectContaining({
        extends: ['godaddy-react-flow']
      }));
    });

    it('uses base godaddy if no special dependencies present', async () => {
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('devDependencies', expect.objectContaining({
        'eslint-config-godaddy': expect.any(String)
      }));
      expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', expect.objectContaining({
        extends: ['godaddy']
      }));
    });

    it('adds eslint-plugin-react-intl if react-intl present', async () => {
      pkgHas.mockImplementation((_, name) => ['react-intl'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('devDependencies', {
        '@godaddy/eslint-plugin-react-intl': expect.any(String)
      });
      expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', {
        extends: ['plugin:@godaddy/react-intl/recommended'],
        settings: {
          localeFiles: ['locales/en-US.json']
        }
      });
    });

    it('adds eslint-config-next if next present', async () => {
      pkgHas.mockImplementation((_, name) => ['next'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('devDependencies', {
        'eslint-config-next': devDependencies['eslint-config-next'],
        'typescript': devDependencies.typescript
      });
      expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', {
        extends: ['next']
      });
    });

    it('adds stylelint if configured', async () => {
      context.addStylelint = true;
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('devDependencies', expect.objectContaining({
        'stylelint-config-godaddy': expect.any(String)
      }));
      expect(pkgAdd).toHaveBeenCalledWith('stylelint', expect.objectContaining({
        extends: ['stylelint-config-godaddy']
      }));
    });

    it('does not add stylelint if api app', async () => {
      context.apiApp = true;
      await codeStyle.create(context, utils);

      expect(pkgAdd).not.toHaveBeenCalledWith('devDependencies', expect.objectContaining({
        'stylelint-config-godaddy': expect.any(String)
      }));
      expect(pkgAdd).not.toHaveBeenCalledWith('stylelint', expect.objectContaining({
        extends: ['stylelint-config-godaddy']
      }));
    });
  });

  describe('airbnb', () => {
    const codeStyle = codeStyles.airbnb;
    testCodeStyle(codeStyle, 'Airbnb', true);

    it('uses airbnb config if react present', async () => {
      pkgHas.mockImplementation((_, name) => ['react'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('devDependencies', expect.objectContaining({
        'eslint-config-airbnb': expect.any(String)
      }));
      expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', expect.objectContaining({
        extends: ['airbnb']
      }));
    });

    it('uses base airbnb if no special dependencies present', async () => {
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('devDependencies', expect.objectContaining({
        'eslint-config-airbnb-base': expect.any(String)
      }));
      expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', {
        extends: ['airbnb-base']
      });
    });

    it('adds eslint-config-next if next present', async () => {
      pkgHas.mockImplementation((_, name) => ['next'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('devDependencies', {
        'eslint-config-next': devDependencies['eslint-config-next'],
        'typescript': devDependencies.typescript
      });
      expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', {
        extends: ['next']
      });
    });

    it('adds stylelint if configured', async () => {
      context.addStylelint = true;
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('devDependencies', expect.objectContaining({
        'stylelint-config-airbnb': expect.any(String)
      }));
      expect(pkgAdd).toHaveBeenCalledWith('stylelint', {
        extends: ['stylelint-config-airbnb']
      });
    });
  });

  describe('standard', () => {
    const codeStyle = codeStyles.standard;
    testCodeStyle(codeStyle, 'Standard', false);

    it('uses standard and snazzy dependencies', async () => {
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('devDependencies', expect.objectContaining({
        standard: expect.any(String),
        snazzy: expect.any(String)
      }));
    });

    it('adds env if jest present', async () => {
      pkgHas.mockImplementation((_, name) => ['jest'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('standard', {
        env: ['jest']
      });
    });

    it('adds env if mocha present', async () => {
      pkgHas.mockImplementation((_, name) => ['mocha'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('standard', {
        env: ['mocha']
      });
    });

    it('adds expected ignores', async () => {
      pkgHas.mockImplementation((_, name) => ['mocha'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('standard', {
        ignore: ['build/']
      });
    });

    it('adds eslint-config-next if next present', async () => {
      pkgHas.mockImplementation((_, name) => ['next'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('devDependencies', {
        'eslint-config-next': devDependencies['eslint-config-next']
      });
      expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', {
        extends: ['next']
      });
    });
  });

  describe('none', () => {
    const codeStyle = codeStyles.none;
    testCodeStyle(codeStyle, 'none (not recommended)', false);
  });

  // eslint-disable-next-line max-statements
  describe('common', () => {
    const codeStyle = codeStyles.common;

    it('is not named', () => {
      expect(codeStyle).not.toHaveProperty('name');
    });

    it('does not allows stylelint', () => {
      expect(codeStyle.allowStylelint).not.toBe(true);
    });

    it('adds lint scripts if eslint present', async () => {
      pkgHas.mockImplementation((_, name) => ['eslint'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('scripts', {
        'lint': expect.any(String),
        'lint:fix': expect.any(String)
      });

      expect(utils.runScriptStr).toHaveBeenCalledWith('lint -- --fix');
    });

    it('adds lint scripts support for .js, .jsx, .cjs', async () => {
      pkgHas.mockImplementation((_, name) => ['eslint'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('scripts', {
        'lint': 'eslint --ext .js,.jsx,.cjs .',
        'lint:fix': expect.any(String)
      });

      expect(utils.runScriptStr).toHaveBeenCalledWith('lint -- --fix');
    });

    it('adds lint scripts support for .ts, .tsx', async () => {
      context.typescript = true;
      pkgHas.mockImplementation((_, name) => ['eslint'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('scripts', {
        'lint': 'eslint --ext .js,.jsx,.cjs,.ts,.tsx .',
        'lint:fix': expect.any(String)
      });

      expect(utils.runScriptStr).toHaveBeenCalledWith('lint -- --fix');
    });

    it('adds typescript eslint parser', async () => {
      context.typescript = true;
      pkgHas.mockImplementation((_, name) => ['eslint'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('devDependencies', {
        '@typescript-eslint/parser': devDependencies['@typescript-eslint/parser']
      });
    });

    it('does not add lint scripts if already set', async () => {
      pkgHas.mockImplementation((_, name) => ['eslint', 'lint'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).not.toHaveBeenCalledWith('scripts', {
        'lint': expect.any(String),
        'lint:fix': expect.any(String)
      });
    });

    it('adds env if jest present', async () => {
      pkgHas.mockImplementation((_, name) => ['eslint', 'jest'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', {
        env: { jest: true }
      });
    });

    it('adds env if mocha present', async () => {
      pkgHas.mockImplementation((_, name) => ['eslint', 'mocha'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', {
        env: { mocha: true }
      });
    });

    it('adds expected ignores', async () => {
      pkgHas.mockImplementation((_, name) => ['eslint'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('eslintIgnore', ['coverage/', 'build/']);
    });

    it('adds jsx-ally rules it and next are present', async () => {
      pkgHas.mockImplementation((_, name) => ['eslint', 'next', 'eslint-plugin-jsx-a11y'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', {
        rules: {
          'jsx-a11y/anchor-is-valid': expect.any(Array)
        }
      });
    });

    it('adds stylelint scripts if stylelint present', async () => {
      pkgHas.mockImplementation((prop, name) => prop === 'devDependencies' && ['stylelint'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('scripts', {
        'stylelint': expect.any(String),
        'stylelint:fix': expect.any(String)
      });

      expect(utils.runScriptStr).toHaveBeenCalledWith('stylelint -- --fix');
    });

    it('adds posttest script for eslint', async () => {
      pkgHas.mockImplementation((_, name) => ['eslint'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('scripts', {
        posttest: expect.any(String)
      });

      expect(utils.runScriptStr).toHaveBeenCalledWith('lint');
      expect(utils.runScriptStr).not.toHaveBeenCalledWith('stylelint');
    });

    it('adds posttest script for stylelint', async () => {
      pkgHas.mockImplementation((_, name) => ['stylelint'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('scripts', {
        posttest: expect.any(String)
      });

      expect(utils.runScriptStr).not.toHaveBeenCalledWith('lint');
      expect(utils.runScriptStr).toHaveBeenCalledWith('stylelint');
    });

    it('adds posttest script for lint && stylelint', async () => {
      pkgHas.mockImplementation((_, name) => ['eslint', 'stylelint'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('scripts', {
        posttest: expect.any(String)
      });

      expect(utils.runScriptStr).toHaveBeenCalledWith('lint');
      expect(utils.runScriptStr).toHaveBeenCalledWith('stylelint');
    });

    it('does not add posttest script if set', async () => {
      pkgHas.mockImplementation((_, name) => ['posttest', 'eslint', 'stylelint'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).not.toHaveBeenCalledWith('scripts', {
        posttest: expect.any(String)
      });
    });

    it('adds eslint-config-next if next present', async () => {
      pkgHas.mockImplementation((_, name) => ['eslint', 'next'].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).toHaveBeenCalledWith('devDependencies', {
        'eslint-config-next': devDependencies['eslint-config-next']
      });
      expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', {
        extends: ['next']
      });
    });

    it('does not add posttest script if no eslint or stylelint', async () => {
      pkgHas.mockImplementation((_, name) => [].includes(name));
      await codeStyle.create(context, utils);

      expect(pkgAdd).not.toHaveBeenCalledWith('scripts', {
        posttest: expect.any(String)
      });
    });
  });
});
