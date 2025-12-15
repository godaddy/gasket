const self = require('../package.json');
const plugin = require('../lib/index.js');
const { name, version, description, devDependencies } = require('../package');

describe('Plugin', function () {
  /**
   * Create a new project
   * @param {object} rest - Additional project options
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
      packageManager: 'npm',
      ...rest
    });

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
      packageManager: 'npm'
    });

    return {
      files,
      pkg
    };
  }

  it('is an object', function () {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
  });

  it('has expected hooks', function () {
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
        '@testing-library/jest-dom',
        '@testing-library/dom'
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
    it('uses the same scripts in our package.json', async function () {
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

  describe('apiApp', function () {
    let mockContext;
    beforeEach(() => {
      mockContext = {
        typescript: false,
        apiApp: true
      };
    });

    it('sets up an API app', async function () {
      const { pkg } = await create(mockContext);

      expect(pkg.devDependencies['cross-env']).toEqual(devDependencies['cross-env']);
      expect(pkg.scripts).toEqual({
        'test': "cross-env NODE_OPTIONS='--unhandled-rejections=strict --experimental-vm-modules' jest",
        'test:watch': 'npm run test -- --watch',
        'test:coverage': 'npm run test -- --coverage'
      });
    });

    it('sets up an API app with yarn', async function () {
      mockContext.packageManager = 'yarn';
      const { pkg } = await create(mockContext);

      expect(pkg.devDependencies['cross-env']).toEqual(devDependencies['cross-env']);
      expect(pkg.scripts).toEqual({
        'test': "cross-env NODE_OPTIONS='--unhandled-rejections=strict --experimental-vm-modules' jest",
        'test:watch': 'yarn test -- --watch',
        'test:coverage': 'yarn test -- --coverage'
      });
    });

    it('sets up an API app with pnpm', async function () {
      mockContext.packageManager = 'pnpm';
      const { pkg } = await create(mockContext);

      expect(pkg.devDependencies['cross-env']).toEqual(devDependencies['cross-env']);
      expect(pkg.scripts).toEqual({
        'test': "cross-env NODE_OPTIONS='--unhandled-rejections=strict --experimental-vm-modules' jest",
        'test:watch': 'pnpm test -- --watch',
        'test:coverage': 'pnpm test -- --coverage'
      });
    });

    it('sets up an apiApp with typescript', async function () {
      mockContext.typescript = true;
      const { pkg } = await create(mockContext);

      expect(pkg.devDependencies['@types/jest']).toEqual(devDependencies['@types/jest']);
      expect(pkg.devDependencies['ts-jest']).toEqual(devDependencies['ts-jest']);
      expect(pkg.devDependencies['ts-node']).toEqual(devDependencies['ts-node']);
      expect(pkg.scripts).toEqual({
        'test': "cross-env NODE_OPTIONS='--unhandled-rejections=strict --experimental-vm-modules' jest",
        'test:watch': 'npm run test -- --watchAll',
        'test:coverage': 'npm run test -- --coverage'
      });
    });

    it('sets up an apiApp with typescript and yarn', async function () {
      mockContext.typescript = true;
      mockContext.packageManager = 'yarn';
      const { pkg } = await create(mockContext);

      expect(pkg.devDependencies['@types/jest']).toEqual(devDependencies['@types/jest']);
      expect(pkg.devDependencies['ts-jest']).toEqual(devDependencies['ts-jest']);
      expect(pkg.devDependencies['ts-node']).toEqual(devDependencies['ts-node']);
      expect(pkg.scripts).toEqual({
        'test': "cross-env NODE_OPTIONS='--unhandled-rejections=strict --experimental-vm-modules' jest",
        'test:watch': 'yarn test -- --watchAll',
        'test:coverage': 'yarn test -- --coverage'
      });
    });

    it('sets up an apiApp with typescript and pnpm', async function () {
      mockContext.typescript = true;
      mockContext.packageManager = 'pnpm';
      const { pkg } = await create(mockContext);

      expect(pkg.devDependencies['@types/jest']).toEqual(devDependencies['@types/jest']);
      expect(pkg.devDependencies['ts-jest']).toEqual(devDependencies['ts-jest']);
      expect(pkg.devDependencies['ts-node']).toEqual(devDependencies['ts-node']);
      expect(pkg.scripts).toEqual({
        'test': "cross-env NODE_OPTIONS='--unhandled-rejections=strict --experimental-vm-modules' jest",
        'test:watch': 'pnpm test -- --watchAll',
        'test:coverage': 'pnpm test -- --coverage'
      });
    });

    it('adds devDeps for apiApp with typescript', async function () {
      mockContext.typescript = true;
      const { pkg } = await create(mockContext);

      expect(pkg.devDependencies['cross-env']).toEqual(devDependencies['cross-env']);
      expect(pkg.devDependencies['@types/jest']).toEqual(devDependencies['@types/jest']);
      expect(pkg.devDependencies['ts-jest']).toEqual(devDependencies['ts-jest']);
      expect(pkg.devDependencies['ts-node']).toEqual(devDependencies['ts-node']);
    });
  });
});
