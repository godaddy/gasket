import { expect } from 'chai';
import sinon from 'sinon';
import { defaultHandler } from '../routes/index.js';

describe('Routes', () => {
  let mockRequest, mockResponse, jsonSpy;

  beforeEach(() => {
    mockRequest = {};
    jsonSpy = sinon.spy();
    mockResponse = {
      status: () => mockResponse,
      json: jsonSpy
    };
  });

  it('defaultHandler should use expected message', async () => {
    await defaultHandler(mockRequest, mockResponse);
    expect(jsonSpy.calledWith({
      message: 'Welcome to your default route...'
    })).to.be.true;
  });
});
