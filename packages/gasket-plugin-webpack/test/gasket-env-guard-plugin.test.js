const GasketEnvGuardPlugin = require('../lib/gasket-env-guard-plugin');

describe('GasketEnvGuardPlugin', () => {
  let mockCompiler, mockCompilation;

  beforeEach(() => {
    mockCompilation = {
      errors: [],
      warnings: [],
      hooks: {
        buildModule: {
          tap: jest.fn()
        },
        succeedModule: {
          tap: jest.fn()
        }
      }
    };

    mockCompiler = {
      hooks: {
        compilation: {
          tap: jest.fn((name, handler) => handler(mockCompilation))
        }
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('instantiation', () => {
    it('can be instantiated without options', () => {
      const plugin = new GasketEnvGuardPlugin();
      expect(plugin).toBeInstanceOf(GasketEnvGuardPlugin);
    });
  });

  describe('apply', () => {
    it('registers compilation hooks correctly', () => {
      const plugin = new GasketEnvGuardPlugin();
      plugin.apply(mockCompiler);

      expect(mockCompiler.hooks.compilation.tap).toHaveBeenCalledWith(
        'GasketEnvGuardPlugin',
        expect.any(Function)
      );
      expect(mockCompilation.hooks.buildModule.tap).toHaveBeenCalledWith(
        'GasketEnvGuardPlugin',
        expect.any(Function)
      );
    });
  });

  describe('shouldCheckModule', () => {
    let plugin;

    beforeEach(() => {
      plugin = new GasketEnvGuardPlugin();
    });

    it('returns true for JavaScript files', () => {
      expect(plugin.shouldCheckModule('/test/file.js')).toBe(true);
      expect(plugin.shouldCheckModule('/test/file.jsx')).toBe(true);
      expect(plugin.shouldCheckModule('/test/file.ts')).toBe(true);
      expect(plugin.shouldCheckModule('/test/file.tsx')).toBe(true);
      expect(plugin.shouldCheckModule('/test/file.mjs')).toBe(true);
    });

    it('returns false for non-JavaScript files', () => {
      expect(plugin.shouldCheckModule('/test/file.css')).toBe(false);
      expect(plugin.shouldCheckModule('/test/file.json')).toBe(false);
      expect(plugin.shouldCheckModule('/test/file.png')).toBe(false);
    });

    it('returns false for node_modules files', () => {
      expect(plugin.shouldCheckModule('/test/node_modules/package/file.js')).toBe(false);
    });
  });

  describe('containsGasketEnv', () => {
    let plugin;

    beforeEach(() => {
      plugin = new GasketEnvGuardPlugin();
    });

    it('detects process.env.GASKET_ENV', () => {
      expect(plugin.containsGasketEnv('const env = process.env.GASKET_ENV;')).toBe(true);
    });

    it('detects process.env["GASKET_ENV"]', () => {
      expect(plugin.containsGasketEnv('const env = process.env["GASKET_ENV"];')).toBe(true);
    });

    it('detects process.env[\'GASKET_ENV\']', () => {
      expect(plugin.containsGasketEnv("const env = process.env['GASKET_ENV'];")).toBe(true);
    });

    it('does not detect other environment variables', () => {
      expect(plugin.containsGasketEnv('const env = process.env.NODE_ENV;')).toBe(false);
    });

    it('does not detect comments or strings', () => {
      expect(plugin.containsGasketEnv('// process.env.GASKET_ENV')).toBe(false);
      expect(plugin.containsGasketEnv('"process.env.GASKET_ENV"')).toBe(false);
    });
  });

  describe('error handling', () => {
    let plugin;

    beforeEach(() => {
      plugin = new GasketEnvGuardPlugin();
    });

    it('adds error when GASKET_ENV is detected', () => {
      plugin.handleGasketEnvDetection(mockCompilation, '/test/file.js');

      expect(mockCompilation.errors).toHaveLength(1);
      expect(mockCompilation.errors[0].message).toContain('process.env.GASKET_ENV detected in /test/file.js');
      expect(mockCompilation.errors[0].message).toContain('GASKET_ENV is intended for server-side');
      expect(mockCompilation.warnings).toHaveLength(0);
    });

    it('includes helpful recommendations in error message', () => {
      plugin.handleGasketEnvDetection(mockCompilation, '/test/file.js');

      const errorMessage = mockCompilation.errors[0].message;
      expect(errorMessage).toContain('Use gasket.config.env');
      expect(errorMessage).toContain('Use @gasket/data');
      expect(errorMessage).toContain('Move environment-specific logic to server-side');
    });
  });
});
