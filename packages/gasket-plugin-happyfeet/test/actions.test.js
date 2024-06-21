const actions = require('../lib/actions');
jest.mock('happy-feet', () => () => ({
  state: jest.fn(),
  STATE: { UNHAPPY: 'unhappy' }
}));


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
      mockGasket = {
        config: {}
      };
    });

    it('should return a happyFeet instance', () => {
      const result = actions(mockGasket).getHappyFeet(happyConfig);
      expect(typeof result).toBe('object');
      expect(result.state).toBe('HAPPY');
    });
  });
});
