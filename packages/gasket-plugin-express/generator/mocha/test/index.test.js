import { expect } from 'chai';
import sinon from 'sinon';
import { defaultHandler } from '../plugins/routes-plugin.js';

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
