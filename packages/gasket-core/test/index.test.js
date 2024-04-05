/* eslint-disable no-process-env */

import { jest, expect } from '@jest/globals';
import GasketEngine from '@gasket/engine';
import { makeGasket } from '../lib/index.js';

const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

/** @type {import('@gasket/engine').Plugin} */
const mockPlugin = {
  name: 'mockPlugin',
  hooks: {
    configure: jest.fn().mockImplementation((gasket, config) => {
      return {
        ...config,
        mockStage: 'configure hook'
      };
    }),
    actions: jest.fn().mockImplementation((gasket) => {
      return {
        doSomething: () => 'the environment is ' + gasket.config.env,
        doAnotherThing() {
          return 'the environment is ' + gasket.config.env;
        }
      };
    })
  }
};

/** @type {import('@gasket/engine').Plugin} */
const mockProdPlugin = {
  name: 'mockProdPlugin',
  hooks: {
    configure: jest.fn().mockImplementation((gasket, config) => {
      return {
        ...config,
        mockProd: 'configure hook'
      };
    })
  }
};

describe('makeGasket', () => {
  let inputConfig;

  beforeEach(() => {
    inputConfig = {
      mockStage: 'input',
      plugins: [
        mockPlugin
      ],
      mode: 'test',
      environments: {
        production: {
          plugins: [
            mockPlugin,
            mockProdPlugin
          ],
          mode: 'prod'
        },
        development: {
          mode: 'dev'
        }
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.GASKET_ENV;
  });

  it('should return a Gasket instance', () => {
    const gasket = makeGasket({ plugins: [] });
    expect(gasket).toBeInstanceOf(GasketEngine);
  });

  it('TODO: warns about stuff', () => {
    makeGasket({ plugins: [] });
    expect(warnSpy).toHaveBeenCalled();
  });

  describe('config', () => {

    it('applies env overrides', () => {
      process.env.GASKET_ENV = 'production';

      expect(inputConfig).toHaveProperty('environments', expect.any(Object));
      expect(inputConfig).toHaveProperty('mode', 'test');

      const gasket = makeGasket(inputConfig);

      expect(gasket.config).not.toHaveProperty('environments');
      expect(gasket.config).toHaveProperty('mode', 'prod');

      // verify that env overrides are applied before lifecycle
      expect(mockPlugin.hooks.configure).toHaveBeenCalledWith(
        gasket,
        expect.objectContaining({
          mode: 'prod',
          mockStage: 'input'
        })
      );
    });

    it('applies env overrides before instantiating plugin engine', () => {
      // -- verify by checking which hooks are called

      // test
      makeGasket(inputConfig);
      expect(mockPlugin.hooks.configure).toHaveBeenCalledTimes(1);
      expect(mockProdPlugin.hooks.configure).not.toHaveBeenCalled();

      // production
      process.env.GASKET_ENV = 'production';
      makeGasket(inputConfig);
      expect(mockPlugin.hooks.configure).toHaveBeenCalledTimes(2);
      expect(mockProdPlugin.hooks.configure).toHaveBeenCalledTimes(1);
    });

    it('executes configure lifecycle', () => {
      const gasket = makeGasket(inputConfig);
      expect(mockPlugin.hooks.configure).toHaveBeenCalledWith(
        gasket,
        expect.objectContaining({
          mockStage: 'input'
        })
      );
    });

    it('attaches modified config to instance', () => {
      const gasket = makeGasket(inputConfig);
      expect(gasket.config).not.toEqual(inputConfig);
      expect(gasket.config).toHaveProperty('mockStage', 'configure hook');
    });
  });

  describe('actions', () => {
    it('executes actions lifecycle', () => {
      const gasket = makeGasket(inputConfig);
      expect(mockPlugin.hooks.actions).toHaveBeenCalledWith(
        gasket
      );
    });

    it('attaches actions to instance', () => {
      const gasket = makeGasket(inputConfig);
      expect(gasket.actions).toEqual(expect.objectContaining({
        doSomething: expect.any(Function)
      }));
    });

    it('actions can be destructured', () => {
      const gasket = makeGasket(inputConfig);
      const { doSomething, doAnotherThing } = gasket.actions;

      expect(doSomething()).toEqual('the environment is test');
      expect(doAnotherThing()).toEqual('the environment is test');
    });

    it('warns on duplicate action names', () => {
      inputConfig.plugins.unshift({
        name: 'firstMockPlugin',
        hooks: {
          actions: jest.fn().mockImplementation(() => {
            return {
              doSomething: () => 'first in!!'
            };
          })
        }
      });
      const gasket = makeGasket(inputConfig);
      const { doSomething } = gasket.actions;

      expect(errorSpy).toHaveBeenCalledWith(
        "Action 'doSomething' from 'mockPlugin' was registered by 'firstMockPlugin'"
      );
      expect(doSomething()).toEqual('first in!!');
    });
  });
});
