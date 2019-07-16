/* eslint-disable no-sync */

const { stub } = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');

describe('createNext', () => {
  let next, nextHandler, plugin;

  beforeEach(() => {
    nextHandler = { prepare: stub().resolves() };
    next = stub().returns(nextHandler);

    plugin = proxyquire('../', { next });
  });

  it('executes the `next` lifecycle', async function () {
    const gasket = mockGasketApi();
    await plugin.hooks.nextCreate(gasket, false);

    assume(gasket.exec).has.been.calledWith('next', nextHandler);
  });

  it('does not derive a webpack config if not running a dev server', async () => {
    await plugin.hooks.nextCreate(mockGasketApi(), false);

    const nextOptions = next.lastCall.args[0];
    assume(nextOptions.conf).to.not.haveOwnProperty('webpack');
  });
});

function mockGasketApi() {
  return {
    execWaterfall: stub().returnsArg(1),
    exec: stub().resolves({}),
    execSync: stub().returns([]),
    config: {
      webpack: {},  // user specified webpack config
      next: {}      // user specified next.js config
    },
    next: {}
  };
}
