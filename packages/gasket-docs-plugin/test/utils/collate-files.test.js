/* eslint-disable max-nested-callbacks, max-len */
const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const path = require('path');

const readFileStub = sinon.stub().resolves('mock-content');
const writeFileStub = sinon.stub();
const copyFileStub = sinon.stub();
const mkdirpStub = sinon.stub();
const rimrafStub = sinon.stub();
const collateFiles = proxyquire('../../lib/utils/collate-files', {
  fs: {
    readFile: readFileStub,
    writeFile: writeFileStub,
    copyFile: copyFileStub
  },
  mkdirp: mkdirpStub,
  rimraf: rimrafStub,
  util: {
    promisify: f => f
  }
});

const processModuleSpy = sinon.spy(collateFiles, 'processModule');
const { processModule } = collateFiles;

const mockLocalTransform = {
  test: /README\.md$/,
  handler: sinon.stub().callsFake(f => f + '-local')
};

const mockGlobalTransform = {
  test: /\.md$/,
  handler: sinon.stub().callsFake(f => f + '-global')
};

const mockDocsConfigSet = {
  app: {
    name: 'test-app',
    description: 'Some test app',
    link: 'README.md#overview',
    sourceRoot: '/path/to/app',
    targetRoot: '/path/to/app/.docs/test-app',
    files: [
      'README.md'
    ]
  },
  plugins: [{
    name: 'example-plugin',
    link: 'README.md',
    sourceRoot: '/path/to/node_modules/example-plugin',
    targetRoot: '/path/to/app/.docs/test-app/plugins/example-plugin',
    files: [
      'README.md',
      'deep/file.txt',
      'deep/er/image.svg',
      'docs/API.md'
    ],
    transforms: [
      mockLocalTransform
    ]
  }],
  presets: [{
    name: 'example-preset',
    link: 'README.md',
    sourceRoot: '/path/to/node_modules/example-plugin',
    targetRoot: '/path/to/app/.docs/test-app/presets/example-preset',
    files: [
      'README.md'
    ]
  }],
  modules: [{
    name: 'example-module',
    link: 'README.md',
    sourceRoot: '/path/to/node_modules/example-module',
    targetRoot: '/path/to/app/.docs/test-app/modules/example-module',
    files: [
      'README.md'
    ]
  }],
  transforms: [
    mockGlobalTransform
  ],
  root: '/path/to/app',
  docsRoot: '/path/to/app/.docs'
};

describe('Utils - collateFiles', () => {
  let mockDocConfig;

  beforeEach(() => {
    mockDocConfig = mockDocsConfigSet.plugins[0];
    sinon.resetHistory();
  });

  it('makes output dir', async () => {
    await collateFiles(mockDocsConfigSet);
    assume(mkdirpStub).calledWith(mockDocsConfigSet.docsRoot);
  });

  it('cleans output dir', async () => {
    await collateFiles(mockDocsConfigSet);
    assume(rimrafStub).calledWith(mockDocsConfigSet.docsRoot + '/*');
  });

  it('processes app docConfig', async () => {
    await collateFiles(mockDocsConfigSet);
    assume(processModuleSpy).calledWith(mockDocsConfigSet.app);
  });

  it('processes all moduleDocConfigs', async () => {
    await collateFiles(mockDocsConfigSet);
    assume(processModuleSpy).calledWith(mockDocsConfigSet.plugins[0]);
    assume(processModuleSpy).calledWith(mockDocsConfigSet.presets[0]);
    assume(processModuleSpy).calledWith(mockDocsConfigSet.modules[0]);
  });

  describe('processModule', () => {

    it('makes target dirs', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      assume(mkdirpStub).calledWith(mockDocConfig.targetRoot);
      assume(mkdirpStub).calledWith(path.join(mockDocConfig.targetRoot, 'deep'));
      assume(mkdirpStub).calledWith(path.join(mockDocConfig.targetRoot, 'deep', 'er'));
    });

    it('copies files that do not need transformed', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      const { files, sourceRoot, targetRoot } = mockDocConfig;
      const filename = files[1];
      const expectedSource = path.join(sourceRoot, filename);
      const expectedTarget = path.join(targetRoot, filename);
      assume(copyFileStub).calledWith(expectedSource, expectedTarget);
    });

    it('does not copy files that need transformed', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      const { files, sourceRoot, targetRoot } = mockDocConfig;
      const filename = files[0];
      const expectedSource = path.join(sourceRoot, filename);
      const expectedTarget = path.join(targetRoot, filename);
      assume(copyFileStub).not.calledWith(expectedSource, expectedTarget);
    });

    it('loads content of transforming files', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      const { files, sourceRoot } = mockDocConfig;
      const filename = files[0];
      const expectedSource = path.join(sourceRoot, filename);
      assume(readFileStub).calledWith(expectedSource);
    });

    it('writes transformed files', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      const { files, targetRoot } = mockDocConfig;
      const filename = files[0];
      const expectedTarget = path.join(targetRoot, filename);
      assume(writeFileStub).calledWith(expectedTarget);
    });

    it('executes local transforms for files', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      assume(mockLocalTransform.handler).called(1);
      assume(writeFileStub).calledWithMatch(sinon.match.string, /-local/);
    });

    it('executes global transforms for files', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      assume(mockGlobalTransform.handler).called(2);
      assume(writeFileStub).calledWithMatch(sinon.match.string, /-global/);
    });

    it('executes local transforms before global', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      assume(writeFileStub).calledWithMatch(sinon.match.string, /-local-global/);
    });

    it('does not apply transforms that do not pass test', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      // modifies only README.md files
      assume(mockLocalTransform.handler).called(1);
      // modifies all .md files
      assume(mockGlobalTransform.handler).called(2);
    });

    it('transform handler passed expected arguments', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      const { files } = mockDocConfig;
      const filename = files[0];
      assume(mockGlobalTransform.handler).calledWithMatch('mock-content', {
        filename,
        docsConfig: mockDocConfig,
        docsConfigSet: mockDocsConfigSet
      });
    });
  });
});
