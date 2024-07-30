const self = require('../package.json');
const plugin = require('../lib/index.js');
const { name, version, description } = require('../package');

describe('Plugin', function () {
  /**
   * Create a new project
   * @returns {Promise<object>} project
   */
  async function create() {
    const pkg = {};

    await plugin.hooks.create.handler(
      {},
      {
        pkg: {
          add: (key, value) => {
            pkg[key] = pkg[key] || {};
            pkg[key] = { ...pkg[key], ...value };
          },
          has: (key, value) => !!pkg[key] && !!pkg[key][value]
        }
      }
    );

    return { pkg };
  }

  /**
   * Create a new React project
   * @returns {Promise<object>} project
   */
  async function createReact() {
    const files = [];
    const pkg = {
      dependencies: {
        react: '1.0.0'
      }
    };

    await plugin.hooks.create.handler(
      {},
      {
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
      }
    );

    return {
      files,
      pkg
    };
  }

  it('is an object', function () {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected properties', function () {
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
    expect(plugin.hooks.create.timing.after).toEqual(['@gasket/plugin-nextjs']);
  });

  describe('react', function () {
    it('includes a glob for the `generator/cypress.config.js` contents for react projects', async function () {
      const { files } = await createReact();

      expect(files[0]).toContain('/../generator/*');
      expect(files[1]).toContain('/../generator/**/*');
    });
  });

  describe('adds react specific dependencies', function () {
    ['cypress', 'start-server-and-test'].forEach((name) => {
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

  describe('dependencies', function () {
    it('adds "cypress" in the devDependencies', async function () {
      const { pkg } = await create();

      expect(pkg.devDependencies).toHaveProperty('cypress');
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

      const expected = {
        'start:local': 'next start',
        'cypress': 'cypress open',
        'cypress:headless': 'cypress run',
        'e2e': 'start-server-and-test start:local http://localhost:3000 cypress',
        'e2e:headless':
          'start-server-and-test start:local http://localhost:3000 cypress:headless'
      };

      expect(typeof pkg.scripts).toBe('object');
      Object.keys(pkg.scripts).forEach((key) => {
        expect(expected).toHaveProperty(key);
        expect(expected[key]).toEqual(pkg.scripts[key]);
      });
    });
  });
});
