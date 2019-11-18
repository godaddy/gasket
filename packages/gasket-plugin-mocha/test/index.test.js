import { shallow, render, mount } from 'enzyme';
import { describe, it } from 'mocha';
import self from '../package.json';
import chai, { expect } from 'chai';
import spies from 'chai-spies';
import React from 'react';
import plugin from '../';
import path from 'path';

chai.use(spies);

describe('Plugin', () => {
  let spyFunc;

  async function create() {
    const files = [];
    const pkg = {};

    await plugin.hooks.create({}, {
      pkg: {
        add: (key, value) => {
          pkg[key] = value;
        }
      },
      files: {
        add: (...args) => {
          files.push(...args);
        }
      }
    });

    return {
      files,
      pkg
    };
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

  describe('files', function () {
    it('includes the `generator/test` folder & contents', async function () {
      const { files } = await create();

      expect(files[0]).equals(path.join(__dirname, '..', 'generator', '*'));
      expect(files[1]).equals(path.join(__dirname, '..', 'generator', '**', '*'));
    });

    it('includes a glob for the `generator/test/pages` contents', async function () {
      const { files } = await create();

      expect(files[2]).equals(path.join(__dirname, '..', 'generator', '**', '**', '*'));
    });
  });

  describe('dependencies', function () {
    [
      'enzyme-adapter-react-16',
      '@babel/register',
      '@babel/core',
      'enzyme',
      'jsdom',
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

  describe('enzyme', function () {
    it('correctly configured { shallow }', function () {
      const Component = () => <div>hello world</div>;
      const enzyme = shallow(<Component />);

      expect(enzyme.text()).equals('hello world');
    });

    it('correctly configured { render }', function () {
      const Component = () => <div>hello world</div>;
      const enzyme = render(<Component />);

      expect(enzyme.text()).equals('hello world');
    });

    it('correctly configured { mount }', function () {
      const Component = () => <div>hello world</div>;
      const enzyme = mount(<Component />);

      expect(enzyme.text()).equals('hello world');
    });
  });
});
