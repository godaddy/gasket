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

const ready = (await import('../lib/ready.js')).default;

describe('ready', () => {
  let mockGasket;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGasket = {
      execSync: jest.fn().mockReturnValue([{ id: 'test', description: 'test', action: jest.fn() }]),
      config: {
        env: 'development'
      }
    };
  });

  it('should be a function', () => {
    expect(ready).toEqual(expect.any(Function));
  });

  it('should parse gasketBin if gasket custom command is set', async () => {
    mockGasket.config.command = 'docs';
    await ready(mockGasket);
    expect(mockParse).toHaveBeenCalled();
  });

  it('should not parse gasketBin if gasket custom command is not set', async () => {
    await ready(mockGasket);
    expect(mockParse).not.toHaveBeenCalled();
  });
});
