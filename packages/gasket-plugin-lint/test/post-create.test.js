const { describe, it } = require('mocha');
const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const makerStub = sinon.stub().callsFake((_, script) => script);

const postCreateHook = proxyquire('../lib', {
  './utils': {
    makeSafeRunScript: makerStub
  }
}).hooks.postCreate;

describe('postCreate hook', function () {
  let gasket, context, runScript;

  beforeEach(() => {
    gasket = {};
    context = {};
    runScript = sinon.stub();
  });

  it('makes a safeRunScript function', async () => {
    await postCreateHook(gasket, context, { runScript });
    assume(makerStub).calledWith(context, runScript);
  });

  it('safely attempts to run `lint:fix`', async () => {
    await postCreateHook(gasket, context, { runScript });
    assume(runScript).calledWith('lint:fix');
  });

  it('safely attempts to run `stylelint:fix`', async () => {
    await postCreateHook(gasket, context, { runScript });
    assume(runScript).calledWith('stylelint:fix');
  });
});
