import {defaultHeader} from '../plugins/routes-plugin.js';
import { vi, describe, expect, beforeEach, it } from 'vitest';

describe('Routes', () => {
  let mockRequest, mockResponse;
  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
  });

  it('defaultHeader should use expected message', async () => {
    await defaultHeader(mockRequest, mockResponse);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Welcome to your default route...'
    });
  });
});