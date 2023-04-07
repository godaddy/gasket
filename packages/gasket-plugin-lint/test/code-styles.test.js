const codeStyles = require('../lib/code-styles');
const { devDependencies } = require('../package');

describe('code styles', () => {
  let context, utils, pkgHas, pkgAdd;

  beforeEach(() => {
    pkgHas = jest.fn();
    pkgAdd = jest.fn();
    context = {
      pkg: {
        has: pkgHas,
        add: pkgAdd
      }
    };
    utils = {
      gatherDevDeps: jest.fn().mockImplementation(dep => {
        return Promise.resolve({
          [dep]: '*',
          example: 'latest'
        });
      }),
      runScriptStr: jest.fn().mockImplementation(name => name)
    };
  });

  describe('godaddy', () => {
    const codeStyle = codeStyles.godaddy;

    it('is named', () => {
      expect(codeStyle).toHaveProperty('name', 'GoDaddy');
    });

    it('allows stylelint', () => {
      expect(codeStyle.allowStylelint).toBe(true);
    });

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
          localeFiles: ['public/locales/en-US.json']
        }
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
  });

  describe('airbnb', () => {
    const codeStyle = codeStyles.airbnb;

    it('is named', () => {
      expect(codeStyle).toHaveProperty('name', 'Airbnb');
    });

    it('allows stylelint', () => {
      expect(codeStyle.allowStylelint).toBe(true);
    });

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
        'eslint-config-next': devDependencies['eslint-config-next']
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

    it('is named', () => {
      expect(codeStyle).toHaveProperty('name', 'Standard');
    });

    it('does not allow stylelint', () => {
      expect(codeStyle.allowStylelint).not.toBe(true);
    });

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

  describe('other', () => {
    const codeStyle = codeStyles.other;

    it('is named', () => {
      expect(codeStyle).toHaveProperty('name');
    });

    it('allows stylelint', () => {
      expect(codeStyle.allowStylelint).toBe(true);
    });

    describe('eslintConfig', () => {
      it('gathers dependencies', async () => {
        context.eslintConfig = 'eslint-config-fake';
        await codeStyle.create(context, utils);

        expect(utils.gatherDevDeps).toHaveBeenCalledWith('eslint-config-fake');
      });

      it('gathers dependencies for short name with version', async () => {
        context.eslintConfig = 'fake@^1.2.3';
        await codeStyle.create(context, utils);

        expect(utils.gatherDevDeps).toHaveBeenCalledWith('eslint-config-fake@^1.2.3');
      });

      it('gathers dependencies for scope-only short names', async () => {
        context.eslintConfig = '@fake@^1.2.3';
        await codeStyle.create(context, utils);

        expect(utils.gatherDevDeps).toHaveBeenCalledWith('@fake/eslint-config@^1.2.3');
      });

      it('add gathered devDependencies', async () => {
        context.eslintConfig = 'eslint-config-fake';
        await codeStyle.create(context, utils);

        expect(pkgAdd).toHaveBeenCalledWith('devDependencies', expect.objectContaining({
          'eslint-config-fake': expect.any(String)
        }));
      });

      it('adds eslint config as short name', async () => {
        context.eslintConfig = 'eslint-config-fake@^1.2.3';
        await codeStyle.create(context, utils);

        expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', {
          extends: ['fake']
        });
      });

      it('adds eslint config with scope-only short name', async () => {
        context.eslintConfig = '@fake/eslint-config@^1.2.3';
        await codeStyle.create(context, utils);

        expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', {
          extends: ['@fake']
        });
      });

      it('adds eslint-config-next if next present', async () => {
        context.eslintConfig = 'eslint-config-fake';
        // eslint-disable-next-line max-nested-callbacks
        pkgHas.mockImplementation((_, name) => ['next'].includes(name));
        await codeStyle.create(context, utils);

        expect(pkgAdd).toHaveBeenCalledWith('devDependencies', {
          'eslint-config-next': devDependencies['eslint-config-next']
        });
        expect(pkgAdd).toHaveBeenCalledWith('eslintConfig', {
          extends: ['next']
        });
      });

      it('ignores if no eslint config', async () => {
        await codeStyle.create(context, utils);

        expect(pkgAdd).not.toHaveBeenCalledWith('eslintConfig');
      });
    });


    describe('stylelintConfig', () => {

      it('gathers dependencies', async () => {
        context.stylelintConfig = 'stylelint-config-fake';
        await codeStyle.create(context, utils);

        expect(utils.gatherDevDeps).toHaveBeenCalledWith('stylelint-config-fake');
      });

      it('gathers dependencies with version', async () => {
        context.stylelintConfig = 'stylelint-config-fake@^1.2.3';
        await codeStyle.create(context, utils);

        expect(utils.gatherDevDeps).toHaveBeenCalledWith('stylelint-config-fake@^1.2.3');
      });

      it('add gathered devDependencies', async () => {
        context.stylelintConfig = 'stylelint-config-fake';
        await codeStyle.create(context, utils);

        expect(pkgAdd).toHaveBeenCalledWith('devDependencies', expect.objectContaining({
          'stylelint-config-fake': expect.any(String)
        }));
      });

      it('adds stylelintConfig as name (does not shorten)', async () => {
        context.stylelintConfig = 'stylelint-config-fake@^1.2.3';
        await codeStyle.create(context, utils);

        expect(pkgAdd).toHaveBeenCalledWith('stylelintConfig', {
          extends: ['stylelint-config-fake']
        });
      });

      it('ignores if no stylelint config', async () => {
        await codeStyle.create(context, utils);

        expect(pkgAdd).not.toHaveBeenCalledWith('stylelintConfig');
      });
    });
  });

  describe('none', () => {
    const codeStyle = codeStyles.none;

    it('is named', () => {
      expect(codeStyle).toHaveProperty('name');
    });

    it('does not allows stylelint', () => {
      expect(codeStyle.allowStylelint).not.toBe(true);
    });
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
