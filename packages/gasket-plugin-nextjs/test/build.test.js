const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire').noCallThru();

const { stub } = sinon;

describe('build', function () {
  let createConfigStub, builderStub, execStub, loggerStub;

  const getMockedBuildHook = function (imports = {}) {
    createConfigStub = stub();
    builderStub = stub();
    execStub = stub().resolves({ stdout: 'Status: Enabled' });
    loggerStub = {
      info: stub()
    };

    return proxyquire('../lib/build', {
      './config': {
        createConfig: createConfigStub
      },
      'next/dist/build': {
        default: builderStub
      },
      'child_process': {
        exec: execStub
      },
      'util': { promisify: () => execStub },
      ...imports
    });
  };

  it('does not build for local command', async function () {
    const buildHook = getMockedBuildHook();
    await buildHook({ command: { id: 'local' }, logger: loggerStub });
    assume(builderStub).not.called();
  });

  it('uses current next build', async function () {
    const buildHook = getMockedBuildHook();
    await buildHook({ command: { id: 'build' }, logger: loggerStub });
    assume(builderStub).called();
  });

  it('supports older gasket.command format', async function () {
    const buildHook = getMockedBuildHook();
    await buildHook({ command: 'local', logger: loggerStub });
    assume(builderStub).not.called();
  });

  it('checks telemetry status', async function () {
    const buildHook = getMockedBuildHook();
    await buildHook({ command: 'local', logger: loggerStub });
    assume(execStub.args[0][0]).eqls('npx next telemetry status');
  });

  it('disables telemetry', async function () {
    const buildHook = getMockedBuildHook();
    await buildHook({ command: 'local', logger: loggerStub });
    assume(execStub).called(2);
  });
});
