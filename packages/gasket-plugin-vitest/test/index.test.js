import self from '../package.json';
import plugin from '../lib/index.js';
import { name, version, description } from '../package';
import { expect } from 'vitest';

describe('Plugin', function () {
  /**
   * Create a new project
   * @param {object} rest - additional context
   * @returns {Promise<object>} project
   */
  async function create(rest = {}) {
    const pkg = {};

    await plugin.hooks.create.handler({}, {
      pkg: {
        add: (key, value) => {
          pkg[key] = pkg[key] || {};
          pkg[key] = { ...pkg[key], ...value };
        },
        has: (key, value) => !!pkg[key] && !!pkg[key][value]
      },
      ...rest
    });

    return { pkg };
  }
  /**
   * Create a new React project
   * @param {object} rest additional context
   * @returns {Promise<object>} project
   */
  async function createReact(rest = {}) {
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
      },
      ...rest
    });

    return {
      files,
      pkg
    };
  }

  it('is an object', function () {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has a name', function () {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
  });

  it('has expected hooks', function () {
    const expected = ['create', 'metadata'];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  it('has the correct create hook timings', function () {
    expect(plugin.hooks.create.timing.last).toBe(true);
    expect(plugin.hooks.create.timing.before).toEqual(['@gasket/plugin-lint']);
  });

  describe('react', function () {
    it('includes a glob for the generator/vitest.config.js file', async function () {
      const { files } = await createReact();

      expect(files[0]).toMatch('generator/react/*');
      expect(files[1]).toMatch('generator/react/**/*');
    });

    describe('adds react specific dependencies', function () {
      [
        '@vitejs/plugin-react',
        '@testing-library/react',
        '@testing-library/dom',
        'jsdom'
      ].forEach((dep) => {
        it(`adds "${dep}" in the devDependencies`, async function () {
          const { pkg } = await createReact();

          expect(pkg.devDependencies).toHaveProperty(dep);
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

      it('adds vite-tsconfig-paths to devDependencies if using typescript', async function () {
        const { pkg } = await createReact({ typescript: true });

        expect(pkg.devDependencies).toHaveProperty('vite-tsconfig-paths');
      });
    });
  });

  describe('dependencies', function () {
    it('adds vitest to the devDependencies', async function () {
      const { pkg } = await create();

      expect(pkg.devDependencies).toHaveProperty('vitest');
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
    it('uses the same scripts in our package.json', async function () {
      const { pkg } = await create();

      expect(typeof pkg.scripts).toBe('object');
      Object.keys(pkg.scripts).forEach((key) => {
        expect(self.scripts).toHaveProperty(key);
        expect(self.scripts[key]).toEqual(pkg.scripts[key]);
      });
    });

    it('uses vitest for test coverage in the test script', async function () {
      const { pkg } = await create();

      expect(pkg.scripts.test).toContain('vitest run');
    });
  });

});
