import { jest } from '@jest/globals';

const mockAddCommand = jest.fn();
const mockParse = jest.fn();
const mockProcessCommand = jest.fn();

jest.unstable_mockModule('../lib/cli.js', () => {

  return {
    gasketBin: {
      addCommand: mockAddCommand,
      parse: mockParse
    },
    processCommand: mockProcessCommand.mockReturnValue({ command: 'test', hidden: false, isDefault: false })
  };
});

const ready = ((await import('../lib/ready.js')).default).handler;

describe('ready', () => {
  let mockGasket;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGasket = {
      isReady: Promise.resolve(),
      execSync: jest.fn().mockReturnValue([{ id: 'test', description: 'test', action: jest.fn() }]),
      config: {
        env: 'development'
      }
    };
  });

  it('should be a function', () => {
    expect(ready).toEqual(expect.any(Function));
  });

  it('should parse gasketBin', async () => {
    await ready(mockGasket);
    expect(mockParse).toHaveBeenCalled();
  });

  it('should wait for gasket to be ready', async () => {
    await ready(mockGasket);
    await expect(mockGasket.isReady).resolves.toBeUndefined();
  });
});
