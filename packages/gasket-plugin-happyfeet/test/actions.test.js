import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { actions, testReset } from '../lib/actions.js';

describe('actions', () => {
  afterEach(() => {
    testReset();
  });

  it('should return an object', () => {
    expect(actions).toBeInstanceOf(Object);
  });

  it('has expected actions', () => {
    expect(actions).toHaveProperty('getHappyFeet');
  });

  describe('getHappyFeet', () => {
    let happyConfig, mockGasket;

    beforeEach(() => {
      mockGasket = {
        config: {}
      };
    });

    it('should return a happyFeet instance', () => {
      const result = actions.getHappyFeet(mockGasket);
      expect(result.state).toBe('HAPPY');
      expect(result.STATE).toEqual({
        HAPPY: 'HAPPY',
        STARTING: 'STARTING',
        UNHAPPY: 'UNHAPPY',
        WARN: 'WARN'
      });
    });

    it('should call the happyFeet function with gasket.config', () => {
      mockGasket.config.happyFeet = {
        foo: 'bar'
      };
      const result = actions.getHappyFeet(mockGasket);
      expect(result.state).toBe('HAPPY');
    });

    it('should call the happyFeet function with happyConfig', () => {
      happyConfig = { bar: 'foo' };
      const result = actions.getHappyFeet(mockGasket, happyConfig);
      expect(result.state).toBe('HAPPY');
    });
  });
});
