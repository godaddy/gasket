const self = require('../package.json');
const plugin = require('../index.js');
const path = require('path');

describe('Plugin', () => {
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

  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', 'jest');
  });

  it('has expected hooks', () => {
    const expected = [
      'create'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  describe('files', function () {
    it('includes the `generator` folder & contents', async function () {
      const { files } = await create();

      expect(files[0]).toEqual(path.join(__dirname, '..', 'generator', '*'));
    });

    it('includes a glob for the `generator/jest.config.js` contents', async function () {
      const { files } = await create();

      expect(files[1]).toEqual(path.join(__dirname, '..', 'generator', '**', '*'));
    });
  });

  describe('dependencies', function () {
    [
      'jest',
      'enzyme',
      'enzyme-adapter-react-16',
      'eslint-plugin-jest'
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

  describe('eslintConfig', function () {
    it('adds eslint setting to use jest related settings', async function () {
      const { pkg } = await create();

      expect(pkg.eslintConfig).toEqual({
        extends: ['plugin:jest/recommended']
      });
    });
  });
});
