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

const ready = (await import('../lib/ready.js')).default;

describe('ready', () => {
  let mockGasket;

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
  });

  it('should be a function', () => {
    assert.equal(typeof ready, 'function');
  });

  it('should parse gasketBin if gasket custom command is set', async () => {
    mockGasket.config.command = 'docs';
    await ready(mockGasket);
    assert.equal(mockParse.mock.calls.length, 1);
  });

  it('should not parse gasketBin if gasket custom command is not set', async () => {
    await ready(mockGasket);
    assert.equal(mockParse.mock.calls.length, 0);
  });
});
