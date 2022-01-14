const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');

describe('mkdir', () => {
  let sandbox, mockContext, mkDir;
  let mkdirStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockContext = {
      cwd: '/some/path',
      dest: '/some/path/my-app',
      relDest: './my-app',
      extant: false,
      destOverride: true,
      errors: []
    };

    mkdirStub = sandbox.stub();

    mkDir = proxyquire('../../../../src/scaffold/actions/mkdir', {
      'fs/promises': {
        mkdir: mkdirStub
      },
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(mkDir).property('wrapped');
  });

  it('Makes a directory with context.dest', async () => {
    mkdirStub.resolves();
    await mkDir(mockContext);
    assume(mkdirStub).is.calledWith(mockContext.dest);
  });

  it('Rejects with message if directory was not allowed to be overwritten', async () => {
    try {
      await mkDir({ ...mockContext, extant: true, destOverride: false });
    } catch (e) {
      assume(e.message).includes('was not allowed to be overwritten');
    }
  });

  it('Does not create a directory if allowed to override an existing one', async () => {
    mkdirStub.resolves();
    await mkDir({ ...mockContext, extant: true, destOverride: true });
    assume(mkdirStub.called).is.false();
  });

  it('Rejects with original error for other issues', async () => {
    const mockError = { code: 'BOGUS' };
    mkdirStub.rejects(mockError);
    try {
      await mkDir(mockContext);
    } catch (e) {
      assume(e).to.equals(mockError);
    }
  });
});
