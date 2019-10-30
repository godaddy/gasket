const { describe, it } = require('mocha');
const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const codeStyles = require('../lib/code-styles');

const makeGatherDevDeps = sinon.stub().callsFake((_, script) => script);
const makeRunScriptStr = sinon.stub().callsFake((_, script) => script);
const mockCodeStyles = Object.keys(codeStyles).reduce((acc, cur) => ({ ...acc, [cur]: { create: sinon.stub() } }), {});

const createHook = proxyquire('../lib', {
  './utils': {
    makeGatherDevDeps,
    makeRunScriptStr
  },
  './code-styles': mockCodeStyles
}).hooks.create;

const createHookHandler = createHook.handler;

describe('create hook', function () {
  let gasket, context;

  beforeEach(() => {
    sinon.resetHistory();
    gasket = {};
    context = { codeStyle: 'godaddy' };
  });

  it('has timing of last', () => {
    assume(createHook.timing).property('last', true);
  });

  it('makes a gatherDevDeps function for utils', async () => {
    await createHookHandler(gasket, context);
    assume(makeGatherDevDeps).calledWith(context);
  });

  it('makes a runScriptStr function for utils', async () => {
    await createHookHandler(gasket, context);
    assume(makeGatherDevDeps).calledWith(context);
  });

  it('executes create for selected code style', async () => {
    await createHookHandler(gasket, context);
    assume(mockCodeStyles.godaddy.create).called();
  });

  it('always executes create for common code style', async () => {
    await createHookHandler(gasket, context);
    await createHookHandler(gasket, { codeStyle: 'standard' });
    await createHookHandler(gasket, { codeStyle: 'other' });
    assume(mockCodeStyles.godaddy.create).called(1);
    assume(mockCodeStyles.standard.create).called(1);
    assume(mockCodeStyles.other.create).called(1);
    assume(mockCodeStyles.common.create).called(3);
  });

  it('does nothing if selected code style is none', async () => {
    await createHookHandler(gasket, { codeStyle: 'none' });
    assume(mockCodeStyles.common.create).not.called();
  });

  it('does nothing if codeStyle or eslintConfig are not set', async () => {
    await createHookHandler(gasket, {});
    assume(mockCodeStyles.common.create).not.called();
  });

  it('sets codeStyle to other if eslintConfig is set', async () => {
    await createHookHandler(gasket, { eslintConfig: 'bogus' });
    assume(mockCodeStyles.other.create).called();
    assume(mockCodeStyles.common.create).called();
  });
});
