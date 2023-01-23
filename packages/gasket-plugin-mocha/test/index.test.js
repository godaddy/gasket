const plugin = require('../lib');

describe('Plugin', () => {
  let spyFunc, filesAddStub;

  async function create() {
    const pkg = {};
    filesAddStub = jest.fn();

    await plugin.hooks.create.handler({}, {
      files: {
        add: filesAddStub
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
        add: filesAddStub
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

  beforeAll(async function () {
    await create();
    spyFunc = jest.fn();
  });

  it('is an object', () => {
    expect(typeof plugin).toBe('object');
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  it('has the correct create hook timings', function () {
    expect(plugin.hooks.create.timing.last).toBe(true);
    expect(plugin.hooks.create.timing.before).toEqual(['@gasket/plugin-lint']);
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

        expect(pkg.devDependencies).toHaveProperty(name);
      });
    });

    it('depends on the same versions', async function () {
      const { pkg } = await create();

      expect(typeof pkg.devDependencies).toBe('object');
      Object.keys(pkg.devDependencies).forEach((key) => {
        expect(pkg.devDependencies).toHaveProperty(key);
        expect(pkg.devDependencies[key]).toEqual(pkg.devDependencies[key]);
      });
    });

    [
      'global-jsdom',
      '@testing-library/react',
      'jsdom'
    ].forEach(name => {
      it(`doesn't add framework specific dependency "${name}" in the devDependencies`, async function () {
        const { pkg } = await create();

        expect(pkg.devDependencies).not.toHaveProperty(name);
      });
    });
  });

  describe('dependencies - react', function () {
    it('includes a glob for generator contents', async function () {
      await createReact();
      const [firstCall, secondCall] = filesAddStub.mock.calls[0];
      expect(firstCall).toEqual(expect.stringContaining('/../generator/*'));
      expect(secondCall).toEqual(expect.stringContaining('/../generator/**/*'));
    });

    [
      'global-jsdom',
      '@testing-library/react',
      'jsdom'
    ].forEach(name => {
      it(`adds "${name}" in the devDependencies`, async function () {
        const { pkg } = await createReact();

        expect(pkg.devDependencies).toHaveProperty(name);
      });
    });

    it('depends on the same versions', async function () {
      const { pkg } = await createReact();

      expect(typeof pkg.devDependencies).toBe('object');
      Object.keys(pkg.devDependencies).forEach((key) => {
        expect(pkg.devDependencies).toHaveProperty(key);
        expect(pkg.devDependencies[key]).toEqual(pkg.devDependencies[key]);
      });
    });
  });

  describe('scripts', function () {
    it('uses the same scrips in our package.json', async function () {
      const { pkg } = await create();
      expect(typeof pkg.scripts).toBe('object');
      Object.keys(pkg.scripts).forEach((key) => {
        expect(pkg.scripts).toHaveProperty(key);
        expect(pkg.scripts[key]).toEqual(pkg.scripts[key]);
      });
    });

    it('uses nyc for test coverage in the test script', async function () {
      const { pkg } = await create();

      expect(pkg.scripts['test:coverage']).toContain('nyc');
    });

    it('adds appropriate scripts for npm', function () {
      const expected = 'npm run';

      spyFunc('scripts', {
        'test': `npm run test:runner`,
        'test:coverage': `nyc --reporter=text --reporter=json-summary ${expected} test:runner`,
        'test:runner': 'mocha --require setup-env --recursive "test/**/*.*(test|spec).js"',
        'test:watch': `${expected} test:runner -- --watch`
      });

      expect(spyFunc).toHaveBeenCalledWith('scripts', {
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

      expect(spyFunc).toHaveBeenCalledWith('scripts', {
        'test': `nyc --reporter=text --reporter=json-summary yarn test:runner`,
        'test:runner': 'mocha --require setup-env --recursive "test/**/*.*(test|spec).js"',
        'test:watch': `yarn test:runner -- --watch`
      });
    });
  });
});
