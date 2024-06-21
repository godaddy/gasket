const actions = require('../lib/actions');

describe('actions', () => {
  it('should return an object', () => {
    expect(actions()).toBeInstanceOf(Object);
  });

  it('has expected actions', () => {
    const results = actions({});
    expect(results).toHaveProperty('getHappyFeet');
  });

  describe('getHappyFeet', () => {
    let happyConfig, mockGasket;

    beforeEach(() => {
      mockGasket = {};
    });

    it('should return a happyFeet instance', () => {
      const result = actions(mockGasket).getHappyFeet(happyConfig);

      expect(result).toBe('');
    });
  });
});
