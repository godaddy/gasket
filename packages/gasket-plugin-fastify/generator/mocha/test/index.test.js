import { expect } from 'chai';
import sinon from 'sinon';
import { defaultHandler } from '../plugins/routes-plugin.js';

describe('Routes', () => {
  let mockRequest, mockResponse, sendSpy;

  beforeEach(() => {
    mockRequest = {};
    sendSpy = sinon.spy();
    mockResponse = {
      statusCode: 200,
      send: sendSpy
    };
  });

  it('defaultHandler should use expected message', async () => {
    await defaultHandler(mockRequest, mockResponse);
    expect(sendSpy.calledWith({
      message: 'Welcome to your default route...'
    })).to.be.true;
  });
});
