import { jest } from '@jest/globals';

const mockAddCommand = jest.fn();
const mockParse = jest.fn();
const mockProcessCommand = jest.fn();

jest.unstable_mockModule('../lib/cli.js', () => {
  return {
    gasketBin: {
      addCommand: mockAddCommand,
      parse: mockParse
    }
  };
});

jest.unstable_mockModule('../lib/utils/process-command.js', () => {
  return {
    processCommand: mockProcessCommand.mockReturnValue({ command: 'test', hidden: false, isDefault: false })
  };
});

const prepare = ((await import('../lib/prepare.js')).default);

describe('prepare', () => {
  let mockGasket, mockConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGasket = {
      execSync: jest.fn().mockReturnValue([{ id: 'test', description: 'test', action: jest.fn() }]),
      config: {
        env: 'development'
      }
    };
    mockConfig = {
      command: 'test'
    };
  });

  it('should be function', () => {
    expect(prepare).toEqual(expect.any(Function));
  });

  it('should not exec commands if no gasket command detected', async () => {
    delete mockConfig.command;
    await prepare(mockGasket, mockConfig);
    expect(mockGasket.execSync).not.toHaveBeenCalled();
  });

  it('should execute command lifecycle', async () => {
    process.argv = ['node', '/path/to/gasket.js'];
    await prepare(mockGasket, mockConfig);
    expect(mockGasket.execSync).toHaveBeenCalledWith('commands');
  });

  it('should add commands to gasketBin', async () => {
    process.argv = ['node', '/path/to/gasket.js', 'bogus'];
    await prepare(mockGasket, mockConfig);
    expect(mockAddCommand).toHaveBeenCalledWith('test', expect.any(Object));
  });
});
