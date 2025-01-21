import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { defaultHandler } from '../plugins/routes-plugin.js';

describe('Routes', () => {
  let mockRequest, mockResponse;
  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('defaultHandler should use expeced message', async () => {
    await defaultHandler(mockRequest, mockResponse);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Welcome to your default route...'
    });
  });
});
