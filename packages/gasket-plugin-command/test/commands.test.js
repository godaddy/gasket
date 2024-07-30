import { jest } from '@jest/globals';
import commands from '../lib/commands';

describe('commands', () => {
  let mockGasket;

  beforeEach(() => {
    mockGasket = {
      exec: jest.fn()
    };
  });

  it('should be a function', () => {
    expect(commands).toEqual(expect.any(Function));
  });

  it('should have id, description, and action properties', () => {
    const { id, description, action } = commands(mockGasket);
    expect(id).toEqual('build');
    expect(description).toEqual('Gasket build command');
    expect(action).toEqual(expect.any(Function));
  });

  it('action should call gasket.exec build', async () => {
    const { action } = commands(mockGasket);
    await action();
    expect(mockGasket.exec).toHaveBeenCalledWith('build');
  });
});
