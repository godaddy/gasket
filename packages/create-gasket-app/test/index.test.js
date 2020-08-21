const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const path = require('path');

describe('create-gasket-app', function () {
  let forkStub, mockExecute;

  beforeEach(function () {
    forkStub = sinon.stub();

    mockExecute = (...args) => {
      const argvStub = sinon.stub(process, 'argv').get(() => ['node', 'bin', ...args]);
      proxyquire('../', { child_process: { fork: forkStub } });
      argvStub.restore();
    };
  });

  it('calls the @gasket/cli bin from node_modules', function () {
    mockExecute();
    assume(forkStub.args[0][0]).includes(path.join('node_modules', '.bin', 'gasket'));
  });

  it('passes the create arg', function () {
    mockExecute();
    assume(forkStub.args[0][1]).eqls(['create']);
  });

  it('passes through additional arguments', function () {
    mockExecute('-p', '@gasket/preset-nextjs');
    assume(forkStub.args[0][1]).eqls(['create', '-p', '@gasket/preset-nextjs']);
  });
});
