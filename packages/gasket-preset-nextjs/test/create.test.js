import { jest } from '@jest/globals';
import create from '../lib/create.js';

describe('create', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      files: {
        add: jest.fn()
      }
    };
  });

  it('adds generator files', async () => {
    create(null, mockContext);
    expect(mockContext.files.add).toHaveBeenCalledWith(expect.stringMatching(/generator\/\*$/));
  });
});
