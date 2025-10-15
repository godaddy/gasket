import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';

const mockAddCommand = mock.fn();
const mockParse = mock.fn();
const mockProcessCommand = mock.fn(() => ({ command: 'test', hidden: false, isDefault: false }));

mock.module('../lib/cli.js', {
  namedExports: {
    gasketBin: {
      addCommand: mockAddCommand,
      parse: mockParse
    }
  }
});

mock.module('../lib/utils/process-command.js', {
  namedExports: {
    processCommand: mockProcessCommand
  }
});

const prepare = ((await import('../lib/prepare.js')).default);

describe('prepare', () => {
  let mockGasket, mockConfig;

  beforeEach(() => {
    mockAddCommand.mock.resetCalls();
    mockParse.mock.resetCalls();
    mockProcessCommand.mock.resetCalls();

    mockGasket = {
      execSync: mock.fn(() => [{ id: 'test', description: 'test', action: mock.fn() }]),
      config: {
        env: 'development'
      }
    };
    mockConfig = {
      command: 'test'
    };
  });

  it('should be function', () => {
    assert.equal(typeof prepare, 'function');
  });

  it('should not exec commands if no gasket command detected', async () => {
    delete mockConfig.command;
    await prepare(mockGasket, mockConfig);
    assert.equal(mockGasket.execSync.mock.calls.length, 0);
  });

  it('should execute command lifecycle', async () => {
    process.argv = ['node', '/path/to/gasket.js'];
    await prepare(mockGasket, mockConfig);
    assert.equal(mockGasket.execSync.mock.calls.length, 1);
    assert.deepEqual(mockGasket.execSync.mock.calls[0].arguments, ['commands']);
  });

  it('should add commands to gasketBin', async () => {
    process.argv = ['node', '/path/to/gasket.js', 'bogus'];
    await prepare(mockGasket, mockConfig);
    assert.equal(mockAddCommand.mock.calls.length, 1);
    assert.equal(mockAddCommand.mock.calls[0].arguments[0], 'test');
    assert.equal(typeof mockAddCommand.mock.calls[0].arguments[1], 'object');
  });

  it('should handle plugins returning arrays of commands', async () => {
    // Mock some plugins returning single commands and others returning arrays
    mockGasket.execSync = mock.fn(() => [
      { id: 'single', description: 'single command', action: mock.fn() },
      [
        { id: 'multi1', description: 'multi command 1', action: mock.fn() },
        { id: 'multi2', description: 'multi command 2', action: mock.fn() }
      ],
      { id: 'another-single', description: 'another single command', action: mock.fn() }
    ]);

    process.argv = ['node', '/path/to/gasket.js', 'test'];
    await prepare(mockGasket, mockConfig);

    // Should flatten and process all commands
    assert.equal(mockProcessCommand.mock.calls.length, 4);
    assert.equal(mockAddCommand.mock.calls.length, 4);
  });

  it('should handle empty arrays from plugins', async () => {
    mockGasket.execSync = mock.fn(() => [
      { id: 'single', description: 'single command', action: mock.fn() },
      [], // Empty array from a plugin
      { id: 'another', description: 'another command', action: mock.fn() }
    ]);

    process.argv = ['node', '/path/to/gasket.js', 'test'];
    await prepare(mockGasket, mockConfig);

    // Should process only the non-empty commands
    assert.equal(mockProcessCommand.mock.calls.length, 2);
    assert.equal(mockAddCommand.mock.calls.length, 2);
  });
});
