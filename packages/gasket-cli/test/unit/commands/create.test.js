/* eslint-disable max-statements */
const mockDumpErrorContext = jest.fn();
const consoleErrorStub = jest.spyOn(console, 'error').mockImplementation(() => { });
const mockActionStubs = {
  mkDir: jest.fn(),
  loadPreset: jest.fn(),
  cliVersion: jest.fn(),
  globalPrompts: jest.fn(),
  setupPkg: jest.fn(),
  writePkg: jest.fn(),
  installModules: jest.fn(),
  linkModules: jest.fn(),
  writeGasketConfig: jest.fn(),
  loadPkgForDebug: jest.fn(),
  promptHooks: jest.fn(),
  createHooks: jest.fn(),
  generateFiles: jest.fn(),
  postCreateHooks: jest.fn(),
  applyPresetConfig: jest.fn(),
  printReport: jest.fn(),
  readConfig: jest.fn()
};
mockActionStubs.writePkg.update = jest.fn();
mockActionStubs.installModules.update = jest.fn();
mockActionStubs.linkModules.update = jest.fn();

jest.mock('ora', () => () => ({ warn: jest.fn() }));
jest.mock('../../../src/scaffold/dump-error-context', () => mockDumpErrorContext);
jest.mock('../../../src/scaffold/actions', () => mockActionStubs);

const CreateCommand = require('../../../src/commands/create');

describe('create', function () {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('executes expected bootstrap actions', async () => {
    const cmd = new CreateCommand(['myapp', '--presets=nextjs']);
    await cmd.run();

    expect(mockActionStubs.mkDir).toHaveBeenCalled();
    expect(mockActionStubs.loadPreset).toHaveBeenCalled();
    expect(mockActionStubs.globalPrompts).toHaveBeenCalled();
    expect(mockActionStubs.setupPkg).toHaveBeenCalled();
    expect(mockActionStubs.writePkg).toHaveBeenCalled();
    expect(mockActionStubs.installModules).toHaveBeenCalled();
    expect(mockActionStubs.linkModules).toHaveBeenCalled();
    expect(mockActionStubs.postCreateHooks).toHaveBeenCalled();
  });

  it('skips bootstrap actions with --no-bootstrap', async () => {
    const cmd = new CreateCommand(['myapp', '--no-bootstrap', '--presets=nextjs']);
    await cmd.run();

    expect(mockActionStubs.mkDir).not.toHaveBeenCalled();
  });

  it('executes loadPkgForDebug with --no-bootstrap', async () => {
    const cmd = new CreateCommand(['myapp', '--no-bootstrap', '--presets=nextjs']);
    await cmd.run();

    expect(mockActionStubs.loadPkgForDebug).toHaveBeenCalled();
  });

  it('executes expected generate actions', async () => {
    const cmd = new CreateCommand(['myapp', '--presets=nextjs']);
    await cmd.run();

    expect(mockActionStubs.promptHooks).toHaveBeenCalled();
    expect(mockActionStubs.createHooks).toHaveBeenCalled();
    expect(mockActionStubs.generateFiles).toHaveBeenCalled();
    expect(mockActionStubs.writeGasketConfig).toHaveBeenCalled();
    expect(mockActionStubs.writePkg).toHaveBeenCalled();
    expect(mockActionStubs.installModules).toHaveBeenCalled();
    expect(mockActionStubs.linkModules).toHaveBeenCalled();
    expect(mockActionStubs.writePkg.update).toHaveBeenCalled();
    expect(mockActionStubs.installModules.update).toHaveBeenCalled();
    expect(mockActionStubs.linkModules.update).toHaveBeenCalled();
  });

  it('skips generate actions with --no-generate', async () => {
    const cmd = new CreateCommand(['myapp', '--no-generate', '--presets=nextjs']);
    await cmd.run();

    expect(mockActionStubs.promptHooks).not.toHaveBeenCalled();
  });

  it('does not execute loadPkgForDebug with --no-bootstrap --no-generate', async () => {
    const cmd = new CreateCommand(['myapp', '--no-bootstrap', '--no-generate', '--presets=nextjs']);
    await cmd.run();

    expect(mockActionStubs.loadPkgForDebug).not.toHaveBeenCalled();
  });

  it('executes printReport', async () => {
    const cmd = new CreateCommand(['myapp', '--presets=nextjs']);
    await cmd.run();

    expect(mockActionStubs.printReport).toHaveBeenCalled();
  });

  it('exits on action errors', async () => {
    mockActionStubs.mkDir.mockRejectedValueOnce(new Error('YOUR DRIVE EXPLODED!'));
    const cmd = new CreateCommand(['myapp', '--presets=nextjs']);
    try {
      await cmd.run();
    } catch (e) {
      expect(e.message).toContain('YOUR DRIVE EXPLODED!');
    }
  });

  it('dumps log on errors', async () => {
    mockActionStubs.mkDir.mockRejectedValueOnce(new Error('YOUR DRIVE EXPLODED!'));
    const cmd = new CreateCommand(['myapp', '--presets=nextjs']);
    try {
      await cmd.run();
    } catch (e) {
      expect(mockDumpErrorContext).toHaveBeenCalled();
    }
  });

  it('prints exit message', async () => {
    mockActionStubs.mkDir.mockRejectedValueOnce(new Error('YOUR DRIVE EXPLODED!'));
    const cmd = new CreateCommand(['myapp', '--presets=nextjs']);
    try {
      await cmd.run();
    } catch (e) {
      expect(consoleErrorStub).toHaveBeenCalled();
    }
  });

  it('prints exit message when no preset found', async () => {
    const cmd = new CreateCommand(['myapp']);
    try {
      await cmd.run();
    } catch (e) {
      expect(consoleErrorStub).toHaveBeenCalled();
    }
  });

  it('expands comma separated flag inputs to array', () => {
    const result = CreateCommand.flags.plugins.parse('a,b,c');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('prints an error if both --config and --config-file are provided', async () => {
    const cmd = new CreateCommand(['myapp', '--config={}', '--config-file=../../test/unit/commands/test-ci-config.json']);
    try {
      await cmd.run();
    } catch (e) {
      expect(e.message).toContain('--config-file= cannot also be provided when using --config=');
    }
  });
});
