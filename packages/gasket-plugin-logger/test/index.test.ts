/* eslint-disable no-console, no-sync */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Gasket } from '@gasket/core';
import type { Logger } from '../src/index.js';
import plugin from '../src/index.js';
import packageJson from '../package.json' with { type: 'json' };

const { name, version, description } = packageJson;

vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'info').mockImplementation(() => {});
vi.spyOn(console, 'debug').mockImplementation(() => {});

const createMockLogger = (): Logger => ({
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  child: vi.fn()
});

const createMockGasket = (): Partial<Gasket> => ({
  execSync: vi.fn() as Gasket['execSync'],
  logger: null as unknown as Logger
});

describe('@gasket/plugin-logger', () => {
  describe('Plugin properties', () => {
    it('should have properties from package.json', () => {
      expect(plugin).toHaveProperty('name', name);
      expect(plugin).toHaveProperty('version', version);
      expect(plugin).toHaveProperty('description', description);
    });
  });

  describe('plugin.hooks', () => {
    let gasket: Partial<Gasket>;

    beforeEach(() => {
      gasket = createMockGasket();
    });

    describe('init', () => {
      const initHook = typeof plugin.hooks.init === 'function' ? plugin.hooks.init : plugin.hooks.init!.handler;

      it('should set logger from the first plugin if only one logger is hooked', () => {
        const fakeLogger = createMockLogger();
        (gasket.execSync as ReturnType<typeof vi.fn>).mockReturnValue([fakeLogger]);

        initHook(gasket as Gasket);

        expect(gasket.logger).toEqual(fakeLogger);
      });

      it('should throw error if logger is missing required method', () => {
        const invalidLogger = { debug: vi.fn(), error: vi.fn(), info: vi.fn() };
        (gasket.execSync as ReturnType<typeof vi.fn>).mockReturnValue([invalidLogger]);

        // eslint-disable-next-line max-nested-callbacks
        expect(() => initHook(gasket as Gasket)).toThrow(
          'Logger is missing required level: warn'
        );
      });

      it('should set logger to default if no loggers are hooked', () => {
        (gasket.execSync as ReturnType<typeof vi.fn>).mockReturnValue([]);

        initHook(gasket as Gasket);

        const childLogger = gasket.logger!.child({ key: 'value' });
        const nestedChild = childLogger.child({ nested: true });

        nestedChild.error('msg');
        nestedChild.warn('msg');
        nestedChild.info('msg');
        nestedChild.debug('msg');

        expect(console.error).toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalled();
        expect(console.info).toHaveBeenCalled();
        expect(console.debug).toHaveBeenCalled();
        expect(gasket.logger).toEqual({
          error: console.error,
          warn: console.warn,
          info: console.info,
          debug: console.debug,
          child: expect.any(Function)
        });
      });

      it('should throw an error if multiple loggers are hooked', () => {
        (gasket.execSync as ReturnType<typeof vi.fn>).mockReturnValue([createMockLogger(), createMockLogger()]);

        // eslint-disable-next-line max-nested-callbacks
        expect(() => initHook(gasket as Gasket)).toThrow(
          'Multiple plugins are hooking createLogger. Only one logger is supported.'
        );
      });

      it('should throw an error if createLogger returns a Promise', () => {
        (gasket.execSync as ReturnType<typeof vi.fn>).mockReturnValue([Promise.resolve(createMockLogger())]);

        // eslint-disable-next-line max-nested-callbacks
        expect(() => initHook(gasket as Gasket)).toThrow(
          'createLogger hooks must be synchronous'
        );
      });
    });

    describe('create', () => {
      const createHook = typeof plugin.hooks.create === 'function' ? plugin.hooks.create : plugin.hooks.create!.handler;

      it('should add plugin and dependency to gasket config', () => {
        const context = {
          pkg: { add: vi.fn() },
          gasketConfig: { addPlugin: vi.fn() }
        };

        createHook(gasket as Gasket, context as never);

        expect(context.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginLogger', '@gasket/plugin-logger');
        expect(context.pkg.add).toHaveBeenCalledWith('dependencies', { [name]: `^${version}` });
      });
    });

    describe('actions', () => {
      it('should return getLogger action', () => {
        const getLogger = plugin.actions!.getLogger as (gasket: Gasket) => Logger;
        expect(getLogger(gasket as Gasket)).toBe(gasket.logger);
      });
    });

    describe('onSignal', () => {
      const onSignalHook = typeof plugin.hooks.onSignal === 'function' ? plugin.hooks.onSignal : plugin.hooks.onSignal!.handler;

      it('should close logger if available', async () => {
        const fakeLogger = { ...createMockLogger(), close: vi.fn() };
        gasket.logger = fakeLogger;

        await onSignalHook(gasket as Gasket);

        expect(fakeLogger.close).toHaveBeenCalled();
      });

      it('should not throw error if logger is not available', async () => {
        await expect(onSignalHook(gasket as Gasket)).resolves.not.toThrow();
      });
    });

    describe('metadata', () => {
      const metadataHook = typeof plugin.hooks.metadata === 'function' ? plugin.hooks.metadata : plugin.hooks.metadata!.handler;

      it('should return metadata with lifecycle information', () => {
        const meta = metadataHook(gasket as Gasket, { otherData: 'example' } as never);

        expect(meta).toEqual(
          expect.objectContaining({
            lifecycles: expect.arrayContaining([
              expect.objectContaining({
                name: 'createLogger',
                method: 'execSync',
                description: 'Custom logger creation',
                link: 'README.md#createLogger',
                parent: 'init'
              })
            ])
          })
        );
      });
    });
  });
});
