import { vi, expect } from 'vitest';
import { defaultHandler } from '../plugins/routes-plugin.js';

describe('Routes', () => {
  let mockRequest, mockResponse;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      statusCode: 200,
      send: vi.fn()
    };
  });

  it('defaultHeader should use expected message', async () => {
    await defaultHandler(mockRequest, mockResponse);
    expect(mockResponse.send).toHaveBeenCalledWith({
      message: 'Welcome to your default route...'
    });
  });
});