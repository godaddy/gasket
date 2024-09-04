/* eslint-disable no-sync */
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
      exec: jest.fn().mockReturnValue([{ id: 'test', description: 'test', action: jest.fn() }])
    };
  });

  it('should be a function', () => {
    expect(ready).toEqual(expect.any(Function));
  });

  it('should not exec commands if not a gasket command', () => {
    ready(mockGasket);
    expect(mockGasket.exec).not.toHaveBeenCalled();
  });

  it('should execute on gasket command', () => {
    process.argv = ['node', '/path/to/gasket.js'];
    ready(mockGasket);
    expect(mockGasket.exec).toHaveBeenCalled();
  });

  it('should add commands to gasketBin', async () => {
    process.argv = ['node', '/path/to/gasket.js'];
    await ready(mockGasket);
    expect(mockAddCommand).toHaveBeenCalled();
  });

  it('should parse commands', async () => {
    process.argv = ['node', '/path/to/gasket.js'];
    await ready(mockGasket);
    expect(mockParse).toHaveBeenCalled();
  });
});
