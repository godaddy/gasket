import { jest } from '@jest/globals';
import { defaultHandler } from '../../routes';

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
