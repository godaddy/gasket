const { describe, it } = require('mocha');
const assume = require('assume');
const plugin = require('../index');
const sinon = require('sinon');

assume.use(require('assume-sinon'));

function assumeCreatedWith(assertFn) {
  return async function assumeCreated() {
    const spy = {
      pkg: { add: sinon.spy() },
      packageManager: 'npm' || 'yarn',
      files: { add: sinon.spy() }
    };

    await plugin.hooks.create({}, spy);
    assertFn(spy);
  };
}

function assumePostCreateWith(assertFn) {
  return async function () {
    const spy = {
      runScript: sinon.spy()
    };

    await plugin.hooks.postCreate({}, {}, spy);
    assertFn(spy);
  };
}

describe('Plugin', function () {

  it('is an object', () => {
    assume(plugin).is.an('object');
  });

  it('has expected name', () => {
    assume(plugin).to.have.property('name', 'lint');
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'postCreate'
    ];

    assume(plugin).to.have.property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).is.length(expected.length);
  });

  it('adds appropriate devDependencies', assumeCreatedWith(({ pkg }) => {
    assume(pkg.add).calledWith('devDependencies', {
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
  }));

  it('adds appropriate scripts', assumeCreatedWith(({ pkg, packageManager }) => {
    const expected = packageManager === 'npm' ? 'npm run' : packageManager;
    assume(pkg.add).calledWith('scripts', {
      'lint': 'eslint --ext .js,.jsx .',
      'lint:fix': `${expected} lint -- --fix`,
      'stylelint': 'stylelint **/*.scss',
      'pretest': `${expected} lint && ${expected} stylelint`
    });
  }));

  it('adds eslintConfig', assumeCreatedWith(({ pkg }) => {
    assume(pkg.add).calledWith('eslintConfig', {
      extends: ['godaddy-react', 'plugin:@godaddy/react-intl/recommended'],
      rules: {
        'jsx-a11y/anchor-is-valid': [
          'error', {
            components: ['Link'],
            specialLink: ['route', 'as'],
            aspects: ['invalidHref', 'preferButton']
          }
        ]
      }
    });
  }));

  it('adds eslintIgnore', assumeCreatedWith(({ pkg }) => {
    assume(pkg.add).calledWith('eslintIgnore', [
      'coverage'
    ]);
  }));

  it('adds stylelint', assumeCreatedWith(({ pkg }) => {
    assume(pkg.add).calledWith('stylelint', {
      extends: 'stylelint-config-godaddy'
    });
  }));

  it('runs lint:fix and stylelint on postCreate', assumePostCreateWith(({ runScript }) => {
    assume(runScript.calledWith('lint:fix')).is.true();
    assume(runScript.calledWith('stylelint')).is.true();
  }));
});
