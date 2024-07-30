/* eslint-disable max-statements, jest/no-conditional-expect */
import { jest } from '@jest/globals';

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
  presetPromptHooks: jest.fn(),
  presetConfigHooks: jest.fn(),
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
jest.unstable_mockModule('../../../lib/scaffold/dump-error-context.js', () => ({
  dumpErrorContext: mockDumpErrorContext
}));
jest.unstable_mockModule('../../../lib/scaffold/actions/index.js', () => mockActionStubs);
jest.unstable_mockModule('@gasket/core', () => ({
  makeGasket: jest.fn()
}));


const CreateCommand = (await import('../../../lib/commands/create.js')).createCommand;
const { Command } = await import('commander');
const { processCommand } = await import('../../../lib/utils/index.js');

describe('create', function () {
  let cmdOptions;
  const cmd = (() => {
    const program = new Command();
    program.name('gasket');
    program.exitOverride();
    const { command } = processCommand(CreateCommand);
    program.addCommand(command);
    program.hook('preAction', (_, actionCommand) => { cmdOptions = actionCommand.opts(); });
    return program;
  })();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should force GASKE_ENV to create', async () => {
    await cmd.parseAsync(['node', 'gasket', 'create', 'myapp']);
    expect(process.env.GASKET_ENV).toEqual('create');
  });

  it('should have expected args', () => {
    const args = cmd.commands[0]._args;
    expect(CreateCommand.args.length).toEqual(args.length);
    CreateCommand.args.forEach((arg, index) => {
      expect(arg.name).toEqual(args[index]._name);
      expect(arg.description).toEqual(args[index].description);
      expect(arg.required).toEqual(args[index].required);
    });
  });

  it('should have expected options', () => {
    const options = cmd.commands[0].options;
    expect(CreateCommand.options.length).toEqual(options.length);

    CreateCommand.options.forEach((option, index) => {
      if (!option.short) {
        if (!options[index].long) expect(`--${option.name}`).toEqual(options[index].short);
      }

      if (option.short) {
        expect(`--${option.name}`).toEqual(options[index].long);
        expect(`-${option.short}`).toEqual(options[index].short);
      }

      if (option.default) expect(option.default).toEqual(options[index].defaultValue);
      if (option.parse) expect(option.parse).toEqual(options[index].parseArg);
      expect(option.description).toEqual(options[index].description);
    });
  });

  it('allows for shorthand options', async () => {
    await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '-p', 'nextjs,react']);
    expect(cmdOptions.presets).toEqual(['nextjs', 'react']);
  });

  it('allows for longhand options', async () => {
    await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--presets', 'nextjs,react']);
    expect(cmdOptions.presets).toEqual(['nextjs', 'react']);
  });

  it('executes expected actions', async () => {
    await cmd.parseAsync(['node', 'gasket', 'create', 'myapp']);
    expect(mockActionStubs.loadPreset).toHaveBeenCalled();
    expect(mockActionStubs.globalPrompts).toHaveBeenCalled();
    expect(mockActionStubs.mkDir).toHaveBeenCalled();
    expect(mockActionStubs.setupPkg).toHaveBeenCalled();
    expect(mockActionStubs.writePkg).toHaveBeenCalled();
    expect(mockActionStubs.installModules).toHaveBeenCalled();
    expect(mockActionStubs.linkModules).toHaveBeenCalled();
    expect(mockActionStubs.presetPromptHooks).toHaveBeenCalled();
    expect(mockActionStubs.presetConfigHooks).toHaveBeenCalled();
    expect(mockActionStubs.promptHooks).toHaveBeenCalled();
    expect(mockActionStubs.createHooks).toHaveBeenCalled();
    expect(mockActionStubs.generateFiles).toHaveBeenCalled();
    expect(mockActionStubs.writeGasketConfig).toHaveBeenCalled();
    expect(mockActionStubs.postCreateHooks).toHaveBeenCalled();
    expect(mockActionStubs.printReport).toHaveBeenCalled();
  });

  it('exits on action errors', async () => {
    mockActionStubs.mkDir.mockRejectedValueOnce(new Error('YOUR DRIVE EXPLODED!'));
    try {
      await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--presets=nextjs']);
    } catch (err) {
      expect(err.message).toEqual('YOUR DRIVE EXPLODED!');
    }
  });

  it('dumps log on errors', async () => {
    mockActionStubs.mkDir.mockRejectedValueOnce(new Error('YOUR DRIVE EXPLODED!'));
    try {
      await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--presets=nextjs']);
    } catch (err) {
      expect(err.message).toEqual('YOUR DRIVE EXPLODED!');
      expect(mockDumpErrorContext).toHaveBeenCalled();
    }
  });

  it('prints exit message', async () => {
    mockActionStubs.mkDir.mockRejectedValueOnce(new Error('YOUR DRIVE EXPLODED!'));
    try {
      await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--presets=nextjs']);
    } catch (err) {
      expect(err.message).toEqual('YOUR DRIVE EXPLODED!');
      expect(consoleErrorStub).toHaveBeenCalled();
    }
  });

  it('prints exit message when no preset found', async () => {
    mockActionStubs.loadPreset.mockRejectedValueOnce(new Error('No preset found'));
    try {
      await cmd.parseAsync(['node', 'gasket', 'create', 'myapp']);
    } catch (err) {
      expect(err.message).toEqual('No preset found');
    }
  });

  it('expands comma separated flag inputs to array', async () => {
    await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--presets', 'nextjs,react,redux']);
    expect(cmdOptions.presets).toEqual(['nextjs', 'react', 'redux']);
  });

  it('prints an error if both --config and --config-file are provided', async () => {
    const writeSpy = jest.spyOn(process.stderr, 'write').mockImplementation((err) => err);
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((err) => err);
    await cmd.parseAsync(
      ['node', 'gasket', 'create', 'myapp', '--config={}', '--config-file=../../test/unit/commands/test-ci-config.json']
    );
    expect(writeSpy).toHaveBeenCalledWith(
      `error: option '--config-file [config-file]' cannot be used with option '--config [config]'\n`
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
