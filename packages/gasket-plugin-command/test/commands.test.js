import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import commands from '../lib/commands';

describe('commands', () => {
  let mockGasket;

  beforeEach(() => {
    mockGasket = {
      exec: mock.fn()
    };
  });

  it('should be a function', () => {
    assert.equal(typeof commands, 'function');
  });

  it('should have id, description, and action properties', () => {
    const { id, description, action } = commands(mockGasket);
    assert.equal(id, 'build');
    assert.equal(description, 'Gasket build command');
    assert.equal(typeof action, 'function');
  });

  it('action should call gasket.exec build', async () => {
    const { action } = commands(mockGasket);
    await action();
    assert.equal(mockGasket.exec.mock.calls.length, 1);
    assert.deepEqual(mockGasket.exec.mock.calls[0].arguments, ['build']);
  });
});
