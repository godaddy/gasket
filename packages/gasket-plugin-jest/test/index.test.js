const self = require('../package.json');
const plugin = require('../lib/index.js');
const config = require('../generator/jest.config.js');

describe('Plugin', function () {
  async function create() {
    const pkg = {};

    await plugin.hooks.create.handler({}, {
      pkg: {
        add: (key, value) => {
          pkg[key] = pkg[key] || {};
          pkg[key] = { ...pkg[key], ...value };
        },
        has: (key, value) => !!pkg[key] && !!pkg[key][value]
      }
    });

    return { pkg };
  }

  async function createReact() {
    const files = [];
    const pkg = {
      dependencies: {
        react: '1.0.0'
      }
    };

    await plugin.hooks.create.handler({}, {
      pkg: {
        add: (key, value) => {
          pkg[key] = pkg[key] || {};
          pkg[key] = { ...pkg[key], ...value };
        },
        has: (key, value) => !!pkg[key] && !!pkg[key][value]
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

  it('is an object', function () {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected name', function ()  {
    expect(plugin).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', function ()  {
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

  it('has the correct custom jest config', async function () {
    const customJestConfig = await config();

    expect(customJestConfig).toHaveProperty('testEnvironment', 'jest-environment-jsdom');
    expect(customJestConfig).toHaveProperty('collectCoverageFrom', ['**/*.js']);
    expect(customJestConfig).toHaveProperty('testEnvironmentOptions', { url: 'http://localhost/' });
  });

  describe('react', function () {
    it('includes a glob for the `generator/jest.config.js` contents for react projects', async function () {
      const { files } = await createReact();

      expect(files[0]).toContain('/../generator/*');
      expect(files[1]).toContain('/../generator/**/*');
    });

    describe('adds react specific dependencies', function () {
      [
        'jest',
        '@testing-library/react',
        '@testing-library/jest-dom'
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
          expect(self.devDependencies).toHaveProperty(key);
          expect(self.devDependencies[key]).toEqual(pkg.devDependencies[key]);
        });
      });
    });
  });

  describe('dependencies', function () {
    it('adds "jest" in the devDependencies', async function () {
      const { pkg } = await create();

      expect(pkg.devDependencies).toHaveProperty('jest');
    });

    it('depends on the same versions', async function () {
      const { pkg } = await create();

      expect(typeof pkg.devDependencies).toBe('object');
      Object.keys(pkg.devDependencies).forEach((key) => {
        expect(self.devDependencies).toHaveProperty(key);
        expect(self.devDependencies[key]).toEqual(pkg.devDependencies[key]);
      });
    });
  });

  describe('scripts', function () {
    it('uses the same scrips in our package.json', async function () {
      const { pkg } = await create();

      expect(typeof pkg.scripts).toBe('object');
      Object.keys(pkg.scripts).forEach((key) => {
        expect(self.scripts).toHaveProperty(key);
        expect(self.scripts[key]).toEqual(pkg.scripts[key]);
      });
    });

    it('uses jest for test coverage in the test script', async function () {
      const { pkg } = await create();

      expect(pkg.scripts.test).toEqual('jest');
    });
  });
});
