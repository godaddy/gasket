/* eslint-disable max-nested-callbacks, max-len, no-sync */

// hoisting requires the order below
const mockReadFileStub = jest.fn();
const mockWriteFileStub = jest.fn();
const mockCopyFileStub = jest.fn();
const mockMkdirpStub = jest.fn().mockResolvedValue('/path/to/app');

jest.mock('fs', () => {
  const mod = jest.requireActual('fs');
  const promises = {
    readFile: mockReadFileStub,
    writeFile: mockWriteFileStub,
    copyFile: mockCopyFileStub
  };
  return {
    ...mod,
    promises
  };
});
jest.mock('mkdirp', () => mockMkdirpStub);

const path = require('path');
const fs = require('fs');

// Use readFileSync to avoid jest hoisting of the promise methods
const mockTemplate = fs.readFileSync(path.join(__dirname, '..', 'generator', 'index.html'), 'utf8');
const generateContent = require('../lib/generate-content');

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

describe('generateIndex', () => {

  beforeEach(() => {
    mockReadFileStub.mockResolvedValue(mockTemplate);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('reads index.html template', async () => {
    await generateContent({}, mockDocsConfigSet);
    expect(mockReadFileStub.mock.calls[0][0]).toContain(path.join('generator', 'index.html'));
  });

  it('renders main stylesheet tag', async () => {
    await generateContent({}, mockDocsConfigSet);
    const results = mockWriteFileStub.mock.calls[0][1];

    expect(results).toContain(`styles/gasket.css`);
  });

  it('renders theme stylesheet tag', async () => {
    await generateContent({ theme: 'dark' }, mockDocsConfigSet);
    const results = mockWriteFileStub.mock.calls[0][1];

    expect(results).toContain(`//unpkg.com/docsify/lib/themes/dark.css`);
  });

  it('theme can be a css file', async () => {
    await generateContent({ theme: '../my/custom.css' }, mockDocsConfigSet);
    const results = mockWriteFileStub.mock.calls[0][1];

    expect(results).toContain(`<link rel="stylesheet" href="../my/custom.css">`);
  });

  it('renders custom stylesheets tags', async () => {
    const stylesheets = ['style1.css', 'https://styles2.css'];
    await generateContent({ stylesheets }, mockDocsConfigSet);
    const results = mockWriteFileStub.mock.calls[0][1];

    stylesheets.forEach(style => {
      expect(results).toContain(`<link rel="stylesheet" href="${style}">`);
    });
  });

  it('renders main script tags', async () => {
    await generateContent({}, mockDocsConfigSet);
    const results = mockWriteFileStub.mock.calls[0][1];

    expect(results).toContain(`//unpkg.com/docsify/lib/docsify.min.js`);
  });

  it('renders custom script tags', async () => {
    const scripts = ['style1.js', 'https://styles2.js'];
    await generateContent({ scripts }, mockDocsConfigSet);
    const results = mockWriteFileStub.mock.calls[0][1];

    scripts.forEach(script => {
      expect(results).toContain(`<script src="${script}"></script>`);
    });
  });

  it('writes index.html in docs root', async () => {
    await generateContent({}, mockDocsConfigSet);
    expect(mockWriteFileStub.mock.calls[0][0]).toEqual(path.join(mockDocsConfigSet.docsRoot, 'index.html'));
  });

  it('copies remaining generator files', async () => {
    await generateContent({}, mockDocsConfigSet);
    expect(mockCopyFileStub.mock.calls[0][0]).toContain('favicon.ico');
  });
});
