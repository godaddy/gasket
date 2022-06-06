const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const path = require('path');
const mockDocsConfigSet = {
  root: '/path/to/app',
  docsRoot: '/path/to/app/.docs'
};

const writeFileStub = sinon.stub();
const readFileStub = sinon.stub();
const generateLicense = proxyquire('../../lib/utils/generate-license', {
  fs: {
    promises: {
      writeFile: writeFileStub,
      readFile: readFileStub
    }
  }
});

describe('Utils - generateLicense', () => {

  beforeEach(() => {
    writeFileStub.resetHistory();
  });

  it('writes LICENSE.md in docs root', async () => {
    await generateLicense(mockDocsConfigSet);
    assume(readFileStub.args[0][0]).eqls(path.join(__dirname, '..', '..', 'LICENSE.md'));
    assume(writeFileStub.getCall(0).args[0]).eqls(path.join(mockDocsConfigSet.docsRoot, 'LICENSE.md'));
  });
});
