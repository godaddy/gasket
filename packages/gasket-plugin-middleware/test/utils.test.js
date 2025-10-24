import { describe, it, expect, beforeEach, vi } from 'vitest';

const app = {
  ready: vi.fn(),
  server: {
    emit: vi.fn()
  },
  register: vi.fn(),
  use: vi.fn(),
  set: vi.fn()
};

const cookieParserMiddleware = vi.fn();
const compressionMiddleware = vi.fn();
const mockCookieParser = vi.fn().mockReturnValue(cookieParserMiddleware);
const mockCompression = vi.fn().mockReturnValue(compressionMiddleware);

vi.mock('cookie-parser', () => ({ default: mockCookieParser }));
vi.mock('compression', () => ({ default: mockCompression }));

const { applyCookieParser, applyCompression, executeMiddlewareLifecycle } = await import('../lib/utils.js');


describe('utils', function () {

  describe('applyCookieParser', function () {
    let middlewarePattern;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('adds the cookie-parser middleware before plugin middleware', () => {
      applyCookieParser(app, middlewarePattern);

      const cookieParserUsage = findCall(
        app.use,
        (mw) => mw === cookieParserMiddleware
      );
      expect(cookieParserUsage).not.toBeNull();
    });

    it('adds the cookie-parser middleware with a pattern', () => {
      middlewarePattern = /somerandompattern/;
      applyCookieParser(app, middlewarePattern);

      const cookieParserUsage = findCall(
        app.use,
        (url, mw) => url === middlewarePattern && mw === cookieParserMiddleware
      );
      expect(cookieParserUsage).not.toBeNull();
    });
  });

  describe('applyCompression', function () {
    let compressionConfig;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('adds the compression middleware when enabled', () => {
      compressionConfig = true;
      applyCompression(app, compressionConfig);

      const compressionUsage = findCall(
        app.use,
        (mw) => mw === compressionMiddleware
      );
      expect(compressionUsage).not.toBeNull();
    });

    it('does not add the compression middleware when disabled', () => {
      compressionConfig = false;
      applyCompression(app, compressionConfig);

      const compressionUsage = findCall(
        app.use,
        (mw) => mw === compressionMiddleware
      );
      expect(compressionUsage).toBeNull();
    });
  });

  describe('executeMiddlewareLifecycle', function () {
    let gasket, mockMwPlugins, middlewarePattern, lifecycles;
    const sandbox = vi.fn();

    beforeEach(() => {
      mockMwPlugins = [];
      lifecycles = {
        middleware: vi.fn().mockResolvedValue([])
      };

      gasket = {
        config: {},
        logger: {
          warn: vi.fn()
        },
        exec: vi.fn().mockImplementation((lifecycle, ...args) =>
          lifecycles[lifecycle](...args)
        ),
        execApply: sandbox.mockImplementation(async function (lifecycle, fn) {
          for (const plugin of mockMwPlugins) {
            await fn(plugin, plugin.handler);
          }
        })
      };

      vi.clearAllMocks();
    });

    it('executes the `middleware` lifecycle', async function () {
      await executeMiddlewareLifecycle(gasket, app, middlewarePattern);
      expect(gasket.execApply).toHaveBeenCalledWith(
        'middleware',
        expect.any(Function)
      );
    });

    it('does not apply empty middleware arrays', async function () {
      mockMwPlugins = [
        { name: 'empty', handler: () => [] }
      ];
      await executeMiddlewareLifecycle(gasket, app, middlewarePattern);

      expect(app.use).not.toHaveBeenCalledWith([]);
    });

    it('applies middleware with inclusion regex', async function () {
      const middlewareFn = vi.fn();
      middlewarePattern = /^\/gaskety\/routes\//;
      mockMwPlugins = [
        { name: 'middleware-1', handler: () => ({ handler: middlewareFn }) }
      ];

      await executeMiddlewareLifecycle(gasket, app, middlewarePattern);

      expect(app.use).toHaveBeenCalledWith(middlewarePattern, middlewareFn);
    });

    it('applies middleware config paths if configured', async function () {
      const middlewareFn = vi.fn();
      const mockMiddleware = { handler: middlewareFn, paths: [] };

      gasket.config.middleware = [
        { plugin: 'middleware-1', paths: ['/custom'] }
      ];
      mockMwPlugins = [
        {
          name: 'middleware-1',
          handler: () => mockMiddleware
        }
      ];

      await executeMiddlewareLifecycle(gasket, app);

      expect(app.use).toHaveBeenCalledWith(['/custom'], middlewareFn);
    });

    it('handles both function-style and object-style middleware entries', async function () {
      const functionStyleMiddleware = vi.fn();
      const objectStyleMiddleware = { handler: vi.fn(), paths: ['/obj'] };

      mockMwPlugins = [
        { name: 'plugin-fn', handler: () => functionStyleMiddleware },
        { name: 'plugin-obj', handler: () => objectStyleMiddleware }
      ];

      gasket.config.middleware = [
        { plugin: 'plugin-obj', paths: ['/obj'] }
      ];

      await executeMiddlewareLifecycle(gasket, app);

      // Function-style should be applied directly
      expect(app.use).toHaveBeenCalledWith(functionStyleMiddleware);

      // Object-style should use configured paths and handler
      expect(app.use).toHaveBeenCalledWith(['/obj'], objectStyleMiddleware.handler);
    });

    it('applies arrays of middleware functions from a plugin', async function () {
      const mwFn1 = vi.fn();
      const mwFn2 = vi.fn();

      mockMwPlugins = [
        {
          name: 'plugin-array',
          handler: () => [mwFn1, mwFn2]
        }
      ];

      await executeMiddlewareLifecycle(gasket, app);

      expect(app.use).toHaveBeenCalledWith(mwFn1);
      expect(app.use).toHaveBeenCalledWith(mwFn2);
    });

    it('ignores invalid middleware entries that normalize to { handler: undefined }', async function () {
      const invalidMiddleware = { handler: 'not-a-function' };

      mockMwPlugins = [
        { name: 'plugin-invalid', handler: () => invalidMiddleware }
      ];

      await executeMiddlewareLifecycle(gasket, app);

      // app.use may be called for cookieParser or compression – so we check *how* it was called
      const calledWithInvalid = app.use.mock.calls.some(([arg1]) =>
        arg1 === invalidMiddleware || arg1 === invalidMiddleware.handler
      );

      expect(calledWithInvalid).toBe(false);
    });

    it('appends middlewarePattern to middleware.paths if config entry exists', async function () {
      const middlewareFn = vi.fn();
      const mockMiddleware = { handler: middlewareFn, paths: [] };

      middlewarePattern = /^\/api\//;

      // Plugin-specific config defines one path
      gasket.config.middleware = [
        { plugin: 'middleware-1', paths: ['/custom'] }
      ];

      mockMwPlugins = [
        {
          name: 'middleware-1',
          handler: () => mockMiddleware
        }
      ];

      await executeMiddlewareLifecycle(gasket, app, middlewarePattern);

      // Verify the final paths include both /custom and the middlewarePattern
      expect(app.use).toHaveBeenCalledWith(['/custom', middlewarePattern], middlewareFn);
    });
  });

  /**
   * Find the first call in a spy that matches a predicate
   * @param {vi.SpyInstance} aSpy
   * @param {(args: any) => boolean} aPredicate
   * @returns {any}
   */
  function findCall(aSpy, aPredicate) {
    const callIdx = aSpy.mock.calls.findIndex(args => aPredicate(...args));
    return callIdx === -1 ? null : aSpy.mock.calls[callIdx][0];
  }
});
