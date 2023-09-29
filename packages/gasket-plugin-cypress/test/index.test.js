const self = require('../package.json');
const plugin = require('../lib/index');
const config = require('../generator/cypress.config');

describe('Plugin', () => {
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

  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', require('../package.json').name);
  });

  it('has expected hooks', () => {
    const expected = ['create', 'metadata'];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  it('has the correct create hook timings', () => {
    expect(plugin.hooks.create.timing.after).toEqual(['@gasket/plugin-nextjs']);
  });

  it('has the correct custom cypress config', async () => {
    const { e2e } = config;
    expect(e2e).toHaveProperty('baseUrl', 'http://localhost:8080');
    expect(e2e).toHaveProperty('supportFile', false);
    expect(e2e).toHaveProperty(
      'specPattern',
      'test/e2e/**/*.cy.{js,jsx,ts,tsx}'
    );
    expect(typeof e2e.setupNodeEvents).toBe('function');
    expect(config).toHaveProperty('video', false);
  });

  describe('react', () => {
    it('includes a glob for the `generator/cypress.config.js` contents for react projects', async () => {
      const { files } = await createReact();

      expect(files[0]).toContain('/../generator/*');
      expect(files[1]).toContain('/../generator/**/*');
    });
  });

  describe('adds react specific dependencies', () => {
    ['cypress', 'start-server-and-test'].forEach((name) => {
      it(`adds "${name}" in the devDependencies`, async () => {
        const { pkg } = await createReact();

        expect(pkg.devDependencies).toHaveProperty(name);
      });
    });

    it('depends on the same versions', async () => {
      const { pkg } = await createReact();

      expect(typeof pkg.devDependencies).toBe('object');
      Object.keys(pkg.devDependencies).forEach((key) => {
        expect(self.devDependencies).toHaveProperty(key);
        expect(self.devDependencies[key]).toEqual(pkg.devDependencies[key]);
      });
    });
  });

  describe('dependencies', () => {
    it('adds "cypress" in the devDependencies', async () => {
      const { pkg } = await create();

      expect(pkg.devDependencies).toHaveProperty('cypress');
    });

    it('depends on the same versions', async () => {
      const { pkg } = await create();

      expect(typeof pkg.devDependencies).toBe('object');
      Object.keys(pkg.devDependencies).forEach((key) => {
        expect(self.devDependencies).toHaveProperty(key);
        expect(self.devDependencies[key]).toEqual(pkg.devDependencies[key]);
      });
    });
  });

  describe('scripts', () => {
    it('uses the same scrips in our package.json', async () => {
      const { pkg } = await create();

      const expected = {
        'start:local': 'gasket start --env local',
        'cypress': 'cypress open',
        'cypress:headless': 'cypress run',
        'e2e':
          'start-server-and-test start:local http://localhost:8080 cypress',
        'e2e:headless':
          'start-server-and-test start:local http://localhost:8080 cypress:headless'
      };

      expect(typeof pkg.scripts).toBe('object');
      Object.keys(pkg.scripts).forEach((key) => {
        expect(expected).toHaveProperty(key);
        expect(expected[key]).toEqual(pkg.scripts[key]);
      });
    });
  });
});
