const { describe, it } = require('mocha');
const assume = require('assume');
const sinon = require('sinon');
const codeStyles = require('../lib/code-styles');

describe('code styles', () => {
  let context, utils, pkgHas, pkgAdd;

  beforeEach(() => {
    pkgHas = sinon.stub();
    pkgAdd = sinon.stub();
    context = {
      pkg: {
        has: pkgHas,
        add: pkgAdd
      }
    };
    utils = {
      gatherDevDeps: sinon.stub().callsFake(dep => {
        return Promise.resolve({
          [dep]: '*',
          example: 'latest'
        });
      }),
      runScriptStr: sinon.stub().callsFake(name => name)
    };
  });

  describe('godaddy', () => {
    const codeStyle = codeStyles.godaddy;

    it('is named', () => {
      assume(codeStyle).property('name', 'GoDaddy');
    });

    it('allows stylelint', () => {
      assume(codeStyle.allowStylelint).true();
    });

    it('uses godaddy-react config if react present', async () => {
      pkgHas.callsFake((_, name) => ['react'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('devDependencies', {
        'eslint-config-godaddy-react': sinon.match.string
      });
      assume(pkgAdd).calledWithMatch('eslintConfig', {
        extends: ['godaddy-react']
      });
    });

    it('uses godaddy-flow config if flow-bin present', async () => {
      pkgHas.callsFake((_, name) => ['flow-bin'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('devDependencies', {
        'eslint-config-godaddy-flow': sinon.match.string
      });
      assume(pkgAdd).calledWithMatch('eslintConfig', {
        extends: ['godaddy-flow']
      });
    });

    it('uses godaddy-react-flow config if react & flow-bin present', async () => {
      pkgHas.callsFake((_, name) => ['react', 'flow-bin'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('devDependencies', {
        'eslint-config-godaddy-react-flow': sinon.match.string
      });
      assume(pkgAdd).calledWithMatch('eslintConfig', {
        extends: ['godaddy-react-flow']
      });
    });

    it('uses base godaddy if no special dependencies present', async () => {
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('devDependencies', {
        'eslint-config-godaddy': sinon.match.string
      });
      assume(pkgAdd).calledWithMatch('eslintConfig', {
        extends: ['godaddy']
      });
    });

    it('adds eslint-plugin-react-intl if react-intl present', async () => {
      pkgHas.callsFake((_, name) => ['react-intl'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('devDependencies', {
        '@godaddy/eslint-plugin-react-intl': sinon.match.string
      });
      assume(pkgAdd).calledWithMatch('eslintConfig', {
        extends: ['plugin:@godaddy/react-intl/recommended']
      });
    });

    it('adds stylelint if configured', async () => {
      context.addStylelint = true;
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('devDependencies', {
        'stylelint-config-godaddy': sinon.match.string
      });
      assume(pkgAdd).calledWithMatch('stylelint', {
        extends: ['stylelint-config-godaddy']
      });
    });

  });

  describe('airbnb', () => {
    const codeStyle = codeStyles.airbnb;

    it('is named', () => {
      assume(codeStyle).property('name', 'Airbnb');
    });

    it('allows stylelint', () => {
      assume(codeStyle.allowStylelint).true();
    });

    it('uses airbnb config if react present', async () => {
      pkgHas.callsFake((_, name) => ['react'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('devDependencies', {
        'eslint-config-airbnb': sinon.match.string
      });
      assume(pkgAdd).calledWithMatch('eslintConfig', {
        extends: ['airbnb']
      });
    });

    it('uses base airbnb if no special dependencies present', async () => {
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('devDependencies', {
        'eslint-config-airbnb-base': sinon.match.string
      });
      assume(pkgAdd).calledWithMatch('eslintConfig', {
        extends: ['airbnb-base']
      });
    });

    it('adds stylelint if configured', async () => {
      context.addStylelint = true;
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('devDependencies', {
        'stylelint-config-airbnb': sinon.match.string
      });
      assume(pkgAdd).calledWithMatch('stylelint', {
        extends: ['stylelint-config-airbnb']
      });
    });
  });

  describe('standard', () => {
    const codeStyle = codeStyles.standard;

    it('is named', () => {
      assume(codeStyle).property('name', 'Standard');
    });

    it('does not allow stylelint', () => {
      assume(codeStyle.allowStylelint).not.true();
    });

    it('uses standard and snazzy dependencies', async () => {
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('devDependencies', {
        standard: sinon.match.string,
        snazzy: sinon.match.string
      });
    });

    it('adds env if jest present', async () => {
      pkgHas.callsFake((_, name) => ['jest'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('standard', {
        env: ['jest']
      });
    });

    it('adds env if mocha present', async () => {
      pkgHas.callsFake((_, name) => ['mocha'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('standard', {
        env: ['mocha']
      });
    });

    it('adds expected ignores', async () => {
      pkgHas.callsFake((_, name) => ['mocha'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('standard', {
        ignore: ['build/']
      });
    });
  });

  describe('other', () => {
    const codeStyle = codeStyles.other;

    it('is named', () => {
      assume(codeStyle).property('name');
    });

    it('allows stylelint', () => {
      assume(codeStyle.allowStylelint).true();
    });

    it('uses eslint config', async () => {
      context.eslintConfig = 'eslint-config-fake';
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('devDependencies', {
        'eslint-config-fake': sinon.match.string
      });
      assume(pkgAdd).calledWithMatch('eslintConfig', {
        extends: ['eslint-config-fake']
      });
    });

    it('uses eslint config with short name', async () => {
      context.eslintConfig = 'fake';
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('devDependencies', {
        'eslint-config-fake': sinon.match.string
      });
      assume(pkgAdd).calledWithMatch('eslintConfig', {
        extends: ['fake']
      });
    });

    it.skip('uses eslint config with scoped short name', async () => {
      context.eslintConfig = '@scope/fake';
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('devDependencies', {
        '@scope/eslint-config-fake': sinon.match.string
      });
      assume(pkgAdd).calledWithMatch('eslintConfig', {
        extends: ['@scope/fake']
      });
    });

    it('ignores if no eslint config', async () => {
      await codeStyle.create(context, utils);

      assume(pkgAdd).not.calledWithMatch('eslintConfig');
    });

    it('uses stylelint config', async () => {
      context.stylelintConfig = 'stylelint-config-fake';
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('devDependencies', {
        'stylelint-config-fake': sinon.match.string
      });
      assume(pkgAdd).calledWithMatch('stylelint', {
        extends: ['stylelint-config-fake']
      });
    });

    it('uses stylelint config with short name', async () => {
      context.stylelintConfig = 'fake';
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('devDependencies', {
        'stylelint-config-fake': sinon.match.string
      });
      assume(pkgAdd).calledWithMatch('stylelint', {
        extends: ['fake']
      });
    });

    it('ignores if no stylelint config', async () => {
      await codeStyle.create(context, utils);

      assume(pkgAdd).not.calledWithMatch('stylelint');
    });
  });

  describe('none', () => {
    const codeStyle = codeStyles.none;

    it('is named', () => {
      assume(codeStyle).property('name');
    });

    it('does not allows stylelint', () => {
      assume(codeStyle.allowStylelint).not.true();
    });
  });

  describe('common', () => {
    const codeStyle = codeStyles.common;

    it('is not named', () => {
      assume(codeStyle).not.property('name');
    });

    it('does not allows stylelint', () => {
      assume(codeStyle.allowStylelint).not.true();
    });

    it('adds lint scripts if eslint present', async () => {
      pkgHas.callsFake((_, name) => ['eslint'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('scripts', {
        'lint': sinon.match.string,
        'lint:fix': sinon.match.string
      });

      assume(utils.runScriptStr).calledWith('lint -- --fix');
    });

    it('does not add lint scripts if already set', async () => {
      pkgHas.callsFake((_, name) => ['eslint', 'lint'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).not.calledWithMatch('scripts', {
        'lint': sinon.match.string,
        'lint:fix': sinon.match.string
      });
    });

    it('adds env if jest present', async () => {
      pkgHas.callsFake((_, name) => ['eslint', 'jest'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('eslintConfig', {
        env: { jest: true }
      });
    });

    it('adds env if mocha present', async () => {
      pkgHas.callsFake((_, name) => ['eslint', 'mocha'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('eslintConfig', {
        env: { mocha: true }
      });
    });

    it('adds expected ignores', async () => {
      pkgHas.callsFake((_, name) => ['eslint'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('eslintIgnore', ['coverage/', 'build/']);
    });

    it('adds jsx-ally rules it and next are present', async () => {
      pkgHas.callsFake((_, name) => ['eslint', 'next', 'eslint-plugin-jsx-a11y'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('eslintConfig', {
        rules: {
          'jsx-a11y/anchor-is-valid': sinon.match.array
        }
      });
    });

    it('adds stylelint scripts if stylelint present', async () => {
      pkgHas.callsFake((prop, name) => prop === 'devDependencies' && ['stylelint'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('scripts', {
        'stylelint': sinon.match.string,
        'stylelint:fix': sinon.match.string
      });

      assume(utils.runScriptStr).calledWith('stylelint -- --fix');
    });

    it('adds posttest script for eslint', async () => {
      pkgHas.callsFake((_, name) => ['eslint'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('scripts', {
        posttest: sinon.match.string
      });

      assume(utils.runScriptStr).calledWith('lint');
      assume(utils.runScriptStr).not.calledWith('stylelint');
    });

    it('adds posttest script for stylelint', async () => {
      pkgHas.callsFake((_, name) => ['stylelint'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('scripts', {
        posttest: sinon.match.string
      });

      assume(utils.runScriptStr).not.calledWith('lint');
      assume(utils.runScriptStr).calledWith('stylelint');
    });

    it('adds posttest script for lint && stylelint', async () => {
      pkgHas.callsFake((_, name) => ['eslint', 'stylelint'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).calledWithMatch('scripts', {
        posttest: sinon.match.string
      });

      assume(utils.runScriptStr).calledWith('lint');
      assume(utils.runScriptStr).calledWith('stylelint');
    });

    it('does not add posttest script if set', async () => {
      pkgHas.callsFake((_, name) => ['posttest', 'eslint', 'stylelint'].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).not.calledWithMatch('scripts', {
        posttest: sinon.match.string
      });
    });

    it('does not add posttest script if no eslint or stylelint', async () => {
      pkgHas.callsFake((_, name) => [].includes(name));
      await codeStyle.create(context, utils);

      assume(pkgAdd).not.calledWithMatch('scripts', {
        posttest: sinon.match.string
      });
    });
  });
});
