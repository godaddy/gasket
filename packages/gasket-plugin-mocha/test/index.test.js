import { describe, it } from 'mocha';
import self from '../package.json';
import chai, { expect } from 'chai';
import spies from 'chai-spies';
import plugin from '../';
const sinon = require('sinon');

chai.use(spies);

describe('Plugin', () => {
  let spyFunc;

  async function create() {
    const pkg = {};

    await plugin.hooks.create.handler({}, {
      files: {
        add: sinon.stub()
      },
      pkg: {
        add: (key, value) => {
          pkg[key] = value;
        },
        has: (key, value) => !!pkg[key] && !!pkg[key][value]
      }
    });

    return { pkg };
  }

  async function createReact() {
    const pkg = {
      dependencies: {
        react: '1.0.0'
      }
    };

    await plugin.hooks.create.handler({}, {
      files: {
        add: sinon.stub()
      },
      pkg: {
        add: (key, value) => {
          pkg[key] = value;
        },
        has: (key, value) => {
          return !!pkg[key] && !!pkg[key][value];
        }
      }
    });

    return { pkg };
  }

  before(async function () {
    const { pkg } = await create();
    spyFunc = chai.spy(pkg.add);
  });

  it('is an object', () => {
    expect(plugin).is.an('object');
  });

  it('has expected name', () => {
    expect(plugin).to.have.property('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'metadata'
    ];

    expect(plugin).to.have.property('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).eqls(expected);
    expect(hooks).is.length(expected.length);
  });

  it('has the correct create hook timings', function () {
    expect(plugin.hooks.create.timing.last).to.be.true;
    expect(plugin.hooks.create.timing.before).to.eql(['@gasket/plugin-lint']);
  });

  describe('dependencies', function () {
    [
      '@babel/register',
      '@babel/core',
      'mocha',
      'sinon',
      'chai',
      'nyc'
    ].forEach(name => {
      it(`adds "${name}" in the devDependencies`, async function () {
        const { pkg } = await create();

        expect(pkg.devDependencies).to.have.own.property(name);
      });
    });

    it('depends on the same versions', async function () {
      const { pkg } = await create();

      expect(pkg.devDependencies).is.a('object');
      Object.keys(pkg.devDependencies).forEach((key) => {
        expect(self.devDependencies).to.have.own.property(key);
        expect(self.devDependencies[key]).equals(pkg.devDependencies[key]);
      });
    });

    [
      'global-jsdom',
      '@testing-library/react',
      'jsdom'
    ].forEach(name => {
      it(`doesn't add framework specific dependency "${name}" in the devDependencies`, async function () {
        const { pkg } = await create();

        expect(pkg.devDependencies).not.to.have.own.property(name);
      });
    });
  });

  describe('dependencies - react', function () {
    [
      'global-jsdom',
      '@testing-library/react',
      'jsdom'
    ].forEach(name => {
      it(`adds "${name}" in the devDependencies`, async function () {
        const { pkg } = await createReact();

        expect(pkg.devDependencies).to.have.own.property(name);
      });
    });

    it('depends on the same versions', async function () {
      const { pkg } = await createReact();

      expect(pkg.devDependencies).is.a('object');
      Object.keys(pkg.devDependencies).forEach((key) => {
        expect(self.devDependencies).to.have.own.property(key);
        expect(self.devDependencies[key]).equals(pkg.devDependencies[key]);
      });
    });
  });

  describe('scripts', function () {
    it('uses the same scrips in our package.json', async function () {
      const { pkg } = await create();
      expect(pkg.scripts).is.a('object');
      Object.keys(pkg.scripts).forEach((key) => {
        expect(self.scripts).to.have.own.property(key);
        expect(self.scripts[key]).equals(pkg.scripts[key]);
      });
    });

    it('uses nyc for test coverage in the test script', async function () {
      const { pkg } = await create();

      expect(pkg.scripts['test:coverage']).includes('nyc');
    });

    it('adds appropriate scripts for npm', function () {
      const expected = 'npm run';

      spyFunc('scripts', {
        'test': `npm run test:runner`,
        'test:coverage': `nyc --reporter=text --reporter=json-summary ${expected} test:runner`,
        'test:runner': 'mocha --require setup-env --recursive "test/**/*.*(test|spec).js"',
        'test:watch': `${expected} test:runner -- --watch`
      });

      expect(spyFunc).to.have.been.called.with('scripts', {
        'test': `npm run test:runner`,
        'test:coverage': `nyc --reporter=text --reporter=json-summary npm run test:runner`,
        'test:runner': 'mocha --require setup-env --recursive "test/**/*.*(test|spec).js"',
        'test:watch': `npm run test:runner -- --watch`
      });
    });

    it('adds appropriate scripts for yarn', function () {
      const expected = 'yarn';

      spyFunc('scripts', {
        'test': `nyc --reporter=text --reporter=json-summary ${expected} test:runner`,
        'test:runner': 'mocha --require setup-env --recursive "test/**/*.*(test|spec).js"',
        'test:watch': `${expected} test:runner -- --watch`
      });

      expect(spyFunc).to.have.been.called.with('scripts', {
        'test': `nyc --reporter=text --reporter=json-summary yarn test:runner`,
        'test:runner': 'mocha --require setup-env --recursive "test/**/*.*(test|spec).js"',
        'test:watch': `yarn test:runner -- --watch`
      });
    });
  });
});
