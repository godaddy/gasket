/* eslint-disable max-nested-callbacks, max-len */
const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { readFile } = require('fs').promises;
const path = require('path');
const { promisify } = require('util');

const template = readFile(path.join(__dirname, '..', 'generator', 'index.html'), 'utf8');

const mockDocsConfigSet = {
  app: {
    name: 'test-app',
    description: 'Some test app',
    link: 'README.md#overview',
    targetRoot: '/path/to/app/.docs/test-app'
  },
  root: '/path/to/app',
  docsRoot: '/path/to/app/.docs'
};

const readFileStub = sinon.stub().resolves('mock-content');
const writeFileStub = sinon.stub();
const copyFileStub = sinon.stub();
const mkdirpStub = sinon.stub().resolves('/path/to/app');

describe('generateIndex', () => {
  let generateContent, globSpy;

  beforeEach(() => {
    generateContent = proxyquire('../lib/generate-content', {
      fs: {
        promises: {
          readFile: readFileStub.resolves(template),
          writeFile: writeFileStub,
          copyFile: copyFileStub
        }
      },
      mkdirp: mkdirpStub,
      util: {
        promisify: f => {
          globSpy = sinon.spy(promisify(f));
          return globSpy;
        }
      }
    });
    writeFileStub.resetHistory();
  });

  it('reads index.html template', async () => {
    await generateContent({}, mockDocsConfigSet);
    assume(readFileStub.getCall(0).args[0]).includes(path.join('generator', 'index.html'));
  });

  it('renders main stylesheet tag', async () => {
    await generateContent({}, mockDocsConfigSet);
    const results = writeFileStub.getCall(0).args[1];

    assume(results).includes(`styles/gasket.css`);
  });

  it('renders theme stylesheet tag', async () => {
    await generateContent({ theme: 'dark' }, mockDocsConfigSet);
    const results = writeFileStub.getCall(0).args[1];

    assume(results).includes(`//unpkg.com/docsify/lib/themes/dark.css`);
  });

  it('theme can be a css file', async () => {
    await generateContent({ theme: '../my/custom.css' }, mockDocsConfigSet);
    const results = writeFileStub.getCall(0).args[1];

    assume(results).includes(`<link rel="stylesheet" href="../my/custom.css">`);
  });

  it('renders custom stylesheets tags', async () => {
    const stylesheets = ['style1.css', 'https://styles2.css'];
    await generateContent({ stylesheets }, mockDocsConfigSet);
    const results = writeFileStub.getCall(0).args[1];

    stylesheets.forEach(style => {
      assume(results).includes(`<link rel="stylesheet" href="${style}">`);
    });
  });

  it('renders main script tags', async () => {
    await generateContent({}, mockDocsConfigSet);
    const results = writeFileStub.getCall(0).args[1];

    assume(results).includes(`//unpkg.com/docsify/lib/docsify.min.js`);
  });

  it('renders custom script tags', async () => {
    const scripts = ['style1.js', 'https://styles2.js'];
    await generateContent({ scripts }, mockDocsConfigSet);
    const results = writeFileStub.getCall(0).args[1];

    scripts.forEach(script => {
      assume(results).includes(`<script src="${script}"></script>`);
    });
  });

  it('writes index.html in docs root', async () => {
    await generateContent({}, mockDocsConfigSet);
    assume(writeFileStub.getCall(0).args[0]).eqls(path.join(mockDocsConfigSet.docsRoot, 'index.html'));
  });

  it('copies remaining generator files', async () => {
    await generateContent({}, mockDocsConfigSet);
    assume(copyFileStub.getCall(0).args[0]).includes('favicon.ico');
  });
});
