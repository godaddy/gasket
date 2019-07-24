const { describe, it } = require('mocha');
const sinon = require('sinon');
const assume = require('assume');
const prompt = require('../lib/prompt');

describe('prompt', function () {
  let mockContext, mockUtils, promptStub;

  beforeEach(() => {
    promptStub = sinon.stub();

    mockContext = {
      appName: 'bogus-app'
    };
    mockUtils = {
      prompt: promptStub
    };
  });

  it('is async function', function () {
    assume(prompt).to.be.an('asyncfunction');
  });

  it('does not prompt if gitInit set in context', async () => {
    mockContext.gitInit = false;
    await prompt({}, mockContext, mockUtils);

    mockContext.gitInit = true;
    await prompt({}, mockContext, mockUtils);

    assume(promptStub).not.called();
  });

  it('prompts if gitInit not set in context', async () => {
    promptStub.returns({ gitInit: true });
    await prompt({}, mockContext, mockUtils);

    assume(promptStub).is.called();
    assume(promptStub.args[0][0][0]).property('name', 'gitInit');
  });

  it('sets gitInit in updated context', async () => {
    promptStub.returns({ gitInit: true });
    const result = await prompt({}, mockContext, mockUtils);

    assume(result).not.equals(mockContext);
    assume(result).property('gitInit', true);
  });

  it('returns original context if no prompt', async () => {
    mockContext.gitInit = true;
    const result = await prompt({}, mockContext, mockUtils);

    assume(result).equals(mockContext);
  });
});
