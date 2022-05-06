const self = require('../package.json');
const plugin = require('../lib/index.js');

describe('Plugin', function () {
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

  it('is an object', function () {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected name', function () {
    expect(plugin).toHaveProperty('name', require('../package').name);
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
    it('includes a glob for the `generator/cypress.json` contents for react projects', async function () {
      const { files } = await createReact();

      expect(files[0]).toContain('/../generator/*');
      expect(files[1]).toContain('/../generator/**/*');
    });
  });
});
