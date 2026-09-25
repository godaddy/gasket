const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const webpack = require('webpack');
const { RegisterPlugin, injectEntry } = require('../lib/utils/register-plugin');

const request = 'register!';

describe('injectEntry', () => {
  it('adds the request before the last module of each entry', () => {
    const entry = { main: { import: ['./a', './b'] }, other: { import: ['./c'] } };
    expect(injectEntry(entry, request, () => true)).toEqual({
      main: { import: ['./a', request, './b'] },
      other: { import: [request, './c'] }
    });
  });

  it('keeps other entry descriptor fields', () => {
    const entry = { main: { import: ['./a'], dependOn: ['shared'] } };
    expect(injectEntry(entry, request, () => true)).toEqual({
      main: { import: [request, './a'], dependOn: ['shared'] }
    });
  });

  it('skips entries the filter rejects', () => {
    const entry = { main: { import: ['./a'] }, other: { import: ['./b'] } };
    expect(injectEntry(entry, request, name => name === 'main')).toEqual({
      main: { import: [request, './a'] },
      other: { import: ['./b'] }
    });
  });

  it('skips descriptors without imports', () => {
    const entry = { shared: {} };
    expect(injectEntry(entry, request, () => true)).toEqual({ shared: {} });
  });

  it('wraps dynamic entries', async () => {
    const entry = jest.fn(async () => ({ main: { import: ['./a'] } }));
    const result = injectEntry(entry, request, () => true);
    expect(entry).not.toHaveBeenCalled();
    await expect(result()).resolves.toEqual({ main: { import: [request, './a'] } });
  });
});

describe('RegisterPlugin', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sw-register-'));
    await fs.writeFile(path.join(tmpDir, 'main.js'), 'console.log("main");');
    await fs.writeFile(path.join(tmpDir, 'other.js'), 'console.log("other");');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  function build(filter) {
    const compiler = webpack({
      mode: 'development',
      devtool: false,
      context: tmpDir,
      entry: { main: './main.js', other: './other.js' },
      output: { path: path.join(tmpDir, 'dist') },
      plugins: [new RegisterPlugin({ url: '/sw.js', scope: '/' }, filter)]
    });

    return new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err || stats.hasErrors()) return reject(err || new Error(stats.toString()));
        compiler.close(() => resolve(Promise.all([
          fs.readFile(path.join(tmpDir, 'dist/main.js'), 'utf8'),
          fs.readFile(path.join(tmpDir, 'dist/other.js'), 'utf8')
        ]).then(([main, other]) => ({ main, other }))));
      });
    });
  }

  it('bundles the registration script into every entry by default', async () => {
    const { main, other } = await build();
    for (const bundle of [main, other]) {
      expect(bundle).toContain(".register('/sw.js', { scope: '/' })");
    }
    expect(main).toContain('console.log("main")');
  });

  it('bundles the registration script into filtered entries only', async () => {
    const { main, other } = await build(name => name === 'main');
    expect(main).toContain(".register('/sw.js', { scope: '/' })");
    expect(other).not.toContain('serviceWorker');
  });
});
