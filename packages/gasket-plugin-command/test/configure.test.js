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
    },
    processCommand: mockProcessCommand
  }
});

const configure = ((await import('../lib/configure.js')).default).handler;

describe('configure', () => {
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
      commands: {
        test: {
          extra: 'test-only'
        }
      }
    };
  });

  it('should be a function', () => {
    assert.equal(typeof configure, 'function');
  });

  it('adds command id to config if gasket command', () => {
    process.argv = ['node', '/path/to/gasket.js', 'test'];
    const result = configure(mockGasket, mockConfig);
    assert.equal(result.command, 'test');
  });

  it('applies command overrides', () => {
    process.argv = ['node', '/path/to/gasket.js', 'test'];
    assert.ok(mockConfig.commands);
    const result = configure(mockGasket, mockConfig);
    assert.equal(result.extra, 'test-only');
    assert.ok(!result.commands);
  });
});
