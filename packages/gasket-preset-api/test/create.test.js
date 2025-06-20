import { jest } from '@jest/globals';
import { createRequire } from 'module';
import preset from '../lib/index.js';
const require = createRequire(import.meta.url);
const { devDependencies } = require('../package.json');
const mockPkgAdd = jest.fn();
const mockFilesAdd = jest.fn();

describe('create', function () {
  let mockContext, createHook;

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: mockPkgAdd
      },
      files: {
        add: mockFilesAdd
      },
      typescript: false,
      packageManager: 'npm'
    };

    createHook = preset.hooks.create;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('adds the expected md files', async function () {
    await createHook({}, mockContext);
    expect(mockFilesAdd).toHaveBeenCalledWith(
      expect.stringMatching(/generator\/\*\.md$/)
    );
  });

  it('adds the expected js files', async function () {
    await createHook({}, mockContext);
    expect(mockFilesAdd).toHaveBeenCalledWith(
      expect.stringMatching(/generator\/\*\.js$/)
    );
  });

  it('adds the expected devDependencies', async function () {
    await createHook({}, mockContext);
    expect(mockPkgAdd).toHaveBeenCalledWith('devDependencies', {
      nodemon: devDependencies.nodemon
    });
  });

  it('adds the expected scripts', async function () {
    await createHook({}, mockContext);
    expect(mockPkgAdd).toHaveBeenCalledWith('scripts', {
      start: 'node server.js',
      local: 'nodemon server.js',
      preview: 'npm run start'
    });
  });

  it('adds scripts with yarn commands when packageManager is yarn', async function () {
    mockContext.packageManager = 'yarn';
    await createHook({}, mockContext);
    expect(mockPkgAdd).toHaveBeenCalledWith('scripts', {
      start: 'node server.js',
      local: 'nodemon server.js',
      preview: 'yarn start'
    });
  });

  it('adds scripts with pnpm commands when packageManager is pnpm', async function () {
    mockContext.packageManager = 'pnpm';
    await createHook({}, mockContext);
    expect(mockPkgAdd).toHaveBeenCalledWith('scripts', {
      start: 'node server.js',
      local: 'nodemon server.js',
      preview: 'pnpm start'
    });
  });

  it('does not add js files if typescript is true', async function () {
    mockContext.typescript = true;
    await createHook({}, mockContext);
    expect(mockFilesAdd).not.toHaveBeenCalledWith(
      expect.stringMatching(/generator\/\*\.js$/)
    );
  });
});
