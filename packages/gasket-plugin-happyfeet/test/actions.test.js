
const mockHappyFeet = jest.fn();

jest.mock('happy-feet', () => mockHappyFeet);

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
      jest.clearAllMocks();
      mockGasket = {
        config: {}
      };
      mockHappyFeet.mockReturnValue({
        state: 'HAPPY',
        STATE: { UNHAPPY: 'unhappy' }
      });
    });

    it('should return a happyFeet instance', () => {
      const result = actions(mockGasket).getHappyFeet();
      expect(mockHappyFeet).toHaveBeenCalledTimes(1);
      expect(result.state).toBe('HAPPY');
    });

    it('should call the happyFeet function with gasket.config', () => {
      mockGasket.config.happyFeet = {
        foo: 'bar'
      };
      happyConfig = { bar: 'foo' };
      actions(mockGasket).getHappyFeet(happyConfig);
      expect(mockHappyFeet).toHaveBeenCalledTimes(1);
      expect(mockHappyFeet).toHaveBeenCalledWith({ foo: 'bar' });
    });

    it('should call the happyFeet function with happyConfig', () => {
      happyConfig = { bar: 'foo' };
      actions(mockGasket).getHappyFeet(happyConfig);
      expect(mockHappyFeet).toHaveBeenCalledTimes(1);
      expect(mockHappyFeet).toHaveBeenCalledWith({ bar: 'foo' });
    });
  });
});
