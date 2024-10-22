const plugin = require('../lib');
const { name, version, description } = require('../package');

describe('Plugin', () => {
  let spyFunc, filesAddStub, addPluginStub, create, createReact;

  beforeEach(async function () {
    filesAddStub = jest.fn();
    /**
     * Create a new project
     * @param context
     * @returns {Promise<object>} project
     */
    create = async function (context = {}) {
      const pkg = {};

      await plugin.hooks.create.handler({}, {
        files: {
          add: filesAddStub
        },
        pkg: {
          add: (key, value) => {
            pkg[key] = { ...pkg[key], ...value };
          },
          has: (key, value) => !!pkg[key] && !!pkg[key][value]
        },
        ...context
      });

      return { pkg };
    };

    /**
     * Create a new React project
     * @param context
     * @returns {Promise<object>} project
     */
    createReact = async function (context = {}) {
      const pkg = {
        dependencies: {
          react: '1.0.0'
        }
      };
      addPluginStub = jest.fn();

      await plugin.hooks.create.handler({}, {
        files: {
          add: filesAddStub
        },
        pkg: {
          add: (key, value) => {
            pkg[key] = { ...pkg[key], ...value };
          },
          has: (key, value) => {
            return !!pkg[key] && !!pkg[key][value];
          }
        },
        gasketConfig: {
          addPlugin: addPluginStub
        },
        ...context
      });

      return { pkg };
    };

    spyFunc = jest.fn();
  });

  it('is an object', () => {
    expect(typeof plugin).toBe('object');
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
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

  describe('typescript', function () {
    it('adds typescript to the devDependencies', async function () {
      const { pkg } = await create({ typescript: true });
      expect(pkg.devDependencies).toHaveProperty('@babel/preset-typescript');
    });

    it('does not add typescript to the devDependencies', async function () {
      const { pkg } = await create({ typescript: false });
      expect(pkg.devDependencies).not.toHaveProperty('@babel/preset-typescript');
    });

    it('sets ts file extension for the test:runner script for a react project', async function () {
      const { pkg } = await createReact({ typescript: true });
      expect(pkg.scripts['test:runner']).toContain('test/**/*.{test,spec}.{ts,tsx}');
    });

    it('sets ts file extension for the test:runner script', async function () {
      const { pkg } = await create({ typescript: true });
      expect(pkg.scripts['test:runner']).toContain('test/**/*.*(test|spec).ts');
    });
  });

  describe('dependencies', function () {
    [
      '@babel/core',
      'mocha',
      'sinon',
      'chai',
      'nyc'
    ].forEach(name => {
      it(`adds "${name}" in the devDependencies`, async function () {
        const { pkg } = await create();

        expect(pkg.devDependencies).toHaveProperty(name, expect.any(String));
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
      expect(addPluginStub).toHaveBeenCalled();
      const [firstCall, secondCall, thirdCall] = filesAddStub.mock.calls[0];
      expect(firstCall).toEqual(expect.stringContaining('/../generator/react-app/*'));
      expect(secondCall).toEqual(expect.stringContaining('/../generator/react-app/**/.*'));
      expect(thirdCall).toEqual(expect.stringContaining('/../generator/react-app/**/*'));
    });

    [
      '@babel/preset-react',
      '@testing-library/react',
      'global-jsdom',
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

  describe('apiApp', function () {
    let mockContext;
    beforeEach(() => {
      mockContext = {
        typescript: false,
        apiApp: true
      };
    });

    it('sets up an apiApp test:runner script', async function () {
      const { pkg } = await create(mockContext);

      expect(pkg.scripts['test:runner']).toEqual(
        `mocha -r setup-env --recursive "test/**/*.*(test|spec).js"`
      );
    });

    it('sets up an apiApp with typescript', async function () {
      mockContext.typescript = true;
      await create(mockContext);
      expect(addPluginStub).toHaveBeenCalled();
      const [firstCall, secondCall, thirdCall] = filesAddStub.mock.calls[0];
      expect(firstCall).toEqual(expect.stringContaining('/../generator/api-app/typescript/*'));
      expect(secondCall).toEqual(expect.stringContaining('/../generator/api-app/typescript/**/.*'));
      expect(thirdCall).toEqual(expect.stringContaining('/../generator/api-app/typescript/**/*'));
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
