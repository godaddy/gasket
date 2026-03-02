/* eslint-disable max-statements */

const mockDumpErrorContext = vi.fn();
const consoleErrorStub = vi.spyOn(console, 'error').mockImplementation(() => { });
const consoleWarnStub = vi.spyOn(console, 'warn').mockImplementation(() => { });
const processExitStub = vi.spyOn(process, 'exit').mockImplementation((code) => {
  throw new Error(`process.exit(${code})`);
});
const mkDirStub = vi.fn();
const loadPresetStub = vi.fn();
const loadTemplateStub = vi.fn();
const copyTemplateStub = vi.fn();
const customizeTemplateStub = vi.fn();
const installTemplateDepsStub = vi.fn();
const globalPromptsStub = vi.fn();
const setupPkgStub = vi.fn();
const writePkgStub = vi.fn();
const installModulesStub = vi.fn();
const linkModulesStub = vi.fn();
const writeGasketConfigStub = vi.fn();
const presetPromptHooksStub = vi.fn();
const presetConfigHooksStub = vi.fn();
const promptHooksStub = vi.fn();
const createHooksStub = vi.fn();
const generateFilesStub = vi.fn();
const postCreateHooksStub = vi.fn();
const printReportStub = vi.fn();
const gitInitStub = vi.fn();

writePkgStub.update = vi.fn();
installModulesStub.update = vi.fn();
linkModulesStub.update = vi.fn();

vi.mock('ora', () => () => ({ warn: vi.fn() }));
vi.mock('../../../lib/scaffold/dump-error-context.js', () => ({
  dumpErrorContext: mockDumpErrorContext
}));
vi.mock('../../../lib/scaffold/actions/mkdir.js', () => ({
  default: mkDirStub
}));
vi.mock('../../../lib/scaffold/actions/load-preset.js', () => ({
  default: loadPresetStub
}));
vi.mock('../../../lib/scaffold/actions/load-template.js', () => ({
  default: loadTemplateStub
}));
vi.mock('../../../lib/scaffold/actions/copy-template.js', () => ({
  default: copyTemplateStub
}));
vi.mock('../../../lib/scaffold/actions/customize-template.js', () => ({
  default: customizeTemplateStub
}));
vi.mock('../../../lib/scaffold/actions/install-template-deps.js', () => ({
  default: installTemplateDepsStub
}));
vi.mock('../../../lib/scaffold/actions/global-prompts.js', () => ({
  default: globalPromptsStub
}));
vi.mock('../../../lib/scaffold/actions/setup-pkg.js', () => ({
  default: setupPkgStub
}));
vi.mock('../../../lib/scaffold/actions/write-pkg.js', () => ({
  default: writePkgStub
}));
vi.mock('../../../lib/scaffold/actions/install-modules.js', () => ({
  default: installModulesStub
}));
vi.mock('../../../lib/scaffold/actions/link-modules.js', () => ({
  default: linkModulesStub
}));
vi.mock('../../../lib/scaffold/actions/write-gasket-config.js', () => ({
  default: writeGasketConfigStub
}));
vi.mock('../../../lib/scaffold/actions/preset-prompt-hooks.js', () => ({
  default: presetPromptHooksStub
}));
vi.mock('../../../lib/scaffold/actions/preset-config-hooks.js', () => ({
  default: presetConfigHooksStub
}));
vi.mock('../../../lib/scaffold/actions/prompt-hooks.js', () => ({
  default: promptHooksStub
}));
vi.mock('../../../lib/scaffold/actions/create-hooks.js', () => ({
  default: createHooksStub
}));
vi.mock('../../../lib/scaffold/actions/generate-files.js', () => ({
  default: generateFilesStub
}));
vi.mock('../../../lib/scaffold/actions/post-create-hooks.js', () => ({
  default: postCreateHooksStub
}));
vi.mock('../../../lib/scaffold/actions/print-report.js', () => ({
  default: printReportStub
}));
vi.mock('../../../lib/scaffold/actions/git-init.js', () => ({
  default: gitInitStub
}));
vi.mock('@gasket/core', () => ({
  makeGasket: vi.fn()
}));


const CreateCommand = (await import('../../../lib/commands/create.js')).createCommand;
const { Command, Option } = await import('commander');

describe('create', function () {
  let cmdOptions;
  let cmd;

  beforeEach(() => {
    const program = new Command();
    program.name('gasket');
    program.exitOverride();

    const createCmd = program
      .command(CreateCommand.id)
      .description(CreateCommand.description)
      .action(CreateCommand.action);

    // Add arguments
    if (CreateCommand.args) {
      CreateCommand.args.forEach(arg => {
        createCmd.argument(
          arg.required ? `<${arg.name}>` : `[${arg.name}]`,
          arg.description
        );
      });
    }

    // Add options
    if (CreateCommand.options) {
      CreateCommand.options.forEach(optionDef => {
        const format = optionDef.type !== 'boolean' ? ` [${optionDef.name}]` : '';
        const flags = optionDef.short
          ? `-${optionDef.short}, --${optionDef.name}${format}`
          : `--${optionDef.name}${format}`;

        const option = new Option(flags, optionDef.description);

        if (optionDef.parse) option.argParser(optionDef.parse);
        if (optionDef.default) option.default(optionDef.default);
        if (optionDef.conflicts) option.conflicts(optionDef.conflicts);
        if (optionDef.hidden) option.hideHelp();

        createCmd.addOption(option);
      });
    }

    program.hook('preAction', (_, actionCommand) => { cmdOptions = actionCommand.opts(); });
    cmd = program;
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clean up environment variable that might be set by the command
    delete process.env.GASKET_ENV;
  });

  it('should force GASKE_ENV to create', async () => {
    await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--template', '@gasket/template-nextjs']);
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
        // eslint-disable-next-line jest/no-conditional-expect
        if (!options[index].long) expect(`--${option.name}`).toEqual(options[index].short);
      }

      if (option.short) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(`--${option.name}`).toEqual(options[index].long);
        // eslint-disable-next-line jest/no-conditional-expect
        expect(`-${option.short}`).toEqual(options[index].short);
      }

      // eslint-disable-next-line jest/no-conditional-expect
      if (option.default) expect(option.default).toEqual(options[index].defaultValue);
      // eslint-disable-next-line jest/no-conditional-expect
      if (option.parse) expect(option.parse).toEqual(options[index].parseArg);
      expect(option.description).toEqual(options[index].description);
    });
  });

  it('exits and logs warning if no option is provided', async () => {
    try {
      await cmd.parseAsync(['node', 'gasket', 'create', 'myapp']);
    } catch {
      // Commander will throw when process.exit is called
    }
    expect(consoleWarnStub).toHaveBeenCalledWith(
      'Warning: At least one option is required: --template (preferred), --template-path, ' +
        '--presets (deprecated), or --preset-path (deprecated).'
    );
    expect(processExitStub).toHaveBeenCalledWith(1);
  });

  it('allows for shorthand options', async () => {
    await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '-p', 'nextjs,react']);
    expect(cmdOptions.presets).toEqual(['nextjs', 'react']);
  });

  it('allows for longhand options', async () => {
    await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--presets', 'nextjs,react']);
    expect(cmdOptions.presets).toEqual(['nextjs', 'react']);
  });

  it('warns that presets are deprecated when using --presets', async () => {
    await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--presets', '@gasket/preset-nextjs']);
    const deprecationCalls = consoleWarnStub.mock.calls.filter(call => call[0]?.includes?.('Presets are deprecated'));
    expect(deprecationCalls.length).toBeGreaterThan(0);
  });

  it('executes expected actions', async () => {
    await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--presets', '@gasket/preset-nextjs']);
    expect(loadPresetStub).toHaveBeenCalled();
    expect(globalPromptsStub).toHaveBeenCalled();
    expect(mkDirStub).toHaveBeenCalled();
    expect(setupPkgStub).toHaveBeenCalled();
    expect(writePkgStub).toHaveBeenCalled();
    expect(installModulesStub).toHaveBeenCalled();
    expect(linkModulesStub).toHaveBeenCalled();
    expect(presetPromptHooksStub).toHaveBeenCalled();
    expect(presetConfigHooksStub).toHaveBeenCalled();
    expect(promptHooksStub).toHaveBeenCalled();
    expect(createHooksStub).toHaveBeenCalled();
    expect(generateFilesStub).toHaveBeenCalled();
    expect(writeGasketConfigStub).toHaveBeenCalled();
    expect(postCreateHooksStub).toHaveBeenCalled();
    expect(printReportStub).toHaveBeenCalled();
  });

  it('exits on action errors', async () => {
    mkDirStub.mockRejectedValueOnce(new Error('YOUR DRIVE EXPLODED!'));
    try {
      await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--presets=nextjs']);
    } catch (err) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(err.message).toEqual('YOUR DRIVE EXPLODED!');
    }
  });

  it('dumps log on errors', async () => {
    mkDirStub.mockRejectedValueOnce(new Error('YOUR DRIVE EXPLODED!'));
    try {
      await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--presets=nextjs']);
    } catch (err) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(err.message).toEqual('YOUR DRIVE EXPLODED!');
      // eslint-disable-next-line jest/no-conditional-expect
      expect(mockDumpErrorContext).toHaveBeenCalled();
    }
  });

  it('prints exit message', async () => {
    mkDirStub.mockRejectedValueOnce(new Error('YOUR DRIVE EXPLODED!'));
    try {
      await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--presets=nextjs']);
    } catch (err) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(err.message).toEqual('YOUR DRIVE EXPLODED!');
      // eslint-disable-next-line jest/no-conditional-expect
      expect(consoleErrorStub).toHaveBeenCalled();
    }
  });

  it('prints exit message when no preset found', async () => {
    loadPresetStub.mockRejectedValueOnce(new Error('No preset found'));
    try {
      await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--presets', 'some-preset']);
    } catch (err) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(err.message).toEqual('No preset found');
    }
  });

  it('expands comma separated flag inputs to array', async () => {
    await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--presets', 'nextjs,react,redux']);
    expect(cmdOptions.presets).toEqual(['nextjs', 'react', 'redux']);
  });

  it('prints an error if both --config and --config-file are provided', async () => {
    const writeSpy = vi.spyOn(process.stderr, 'write').mockImplementation((err) => err);

    let commanderError;
    try {
      await cmd.parseAsync(
        ['node', 'gasket', 'create', 'myapp', '--config={}', '--config-file=../../test/unit/commands/test-ci-config.json']
      );
    } catch (err) {
      commanderError = err;
    }

    // Commander throws when conflicting options are detected with exitOverride()
    expect(commanderError.code).toBe('commander.conflictingOption');

    expect(writeSpy).toHaveBeenCalledWith(
      `error: option '--config-file [config-file]' cannot be used with option '--config [config]'\n`
    );
  });

  describe('template functionality', () => {
    it('uses template path when --template is provided', async () => {
      await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--template', '@gasket/template-nextjs']);

      // Should skip preset processing
      expect(globalPromptsStub).not.toHaveBeenCalled();
      expect(loadPresetStub).not.toHaveBeenCalled();
      expect(setupPkgStub).not.toHaveBeenCalled();
      expect(writePkgStub).not.toHaveBeenCalled();
      expect(installModulesStub).not.toHaveBeenCalled();
      expect(linkModulesStub).not.toHaveBeenCalled();

      // Should only run template-specific actions
      expect(mkDirStub).toHaveBeenCalled();
      expect(loadTemplateStub).toHaveBeenCalled();
      expect(copyTemplateStub).toHaveBeenCalled();
      expect(customizeTemplateStub).toHaveBeenCalled();
      expect(installTemplateDepsStub).toHaveBeenCalled();
      expect(gitInitStub).toHaveBeenCalled();
      expect(printReportStub).toHaveBeenCalled();
    });

    it('uses template path when --template-path is provided', async () => {
      await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--template-path', '/path/to/local/template']);

      // Should skip preset processing
      expect(globalPromptsStub).not.toHaveBeenCalled();
      expect(loadPresetStub).not.toHaveBeenCalled();
      expect(setupPkgStub).not.toHaveBeenCalled();

      // Should only run template-specific actions
      expect(mkDirStub).toHaveBeenCalled();
      expect(loadTemplateStub).toHaveBeenCalled();
      expect(copyTemplateStub).toHaveBeenCalled();
      expect(customizeTemplateStub).toHaveBeenCalled();
      expect(installTemplateDepsStub).toHaveBeenCalled();
      expect(gitInitStub).toHaveBeenCalled();
      expect(printReportStub).toHaveBeenCalled();
    });

    it('handles template errors gracefully', async () => {
      loadTemplateStub.mockRejectedValueOnce(new Error('Template installation failed'));

      await expect(
        cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--template', '@gasket/template-invalid'])
      ).rejects.toThrow('Template installation failed');

      expect(mockDumpErrorContext).toHaveBeenCalled();
      expect(consoleErrorStub).toHaveBeenCalled();
    });

    it('passes template option to context', async () => {
      await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--template', '@gasket/template-nextjs']);

      const loadTemplateCall = loadTemplateStub.mock.calls[0];
      expect(loadTemplateCall[0]).toHaveProperty('context');
      expect(loadTemplateCall[0].context).toHaveProperty('template', '@gasket/template-nextjs');
    });

    it('passes template-path option to context', async () => {
      await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--template-path', '/local/template']);

      const loadTemplateCall = loadTemplateStub.mock.calls[0];
      expect(loadTemplateCall[0]).toHaveProperty('context');
      expect(loadTemplateCall[0].context).toHaveProperty('templatePath', '/local/template');
    });

    it('prioritizes template over presets when both are provided', async () => {
      await cmd.parseAsync([
        'node', 'gasket', 'create', 'myapp',
        '--template', '@gasket/template-nextjs',
        '--presets', 'nextjs'
      ]);

      // Should use template path, not preset path
      expect(loadTemplateStub).toHaveBeenCalled();
      expect(copyTemplateStub).toHaveBeenCalled();
      expect(customizeTemplateStub).toHaveBeenCalled();
      expect(installTemplateDepsStub).toHaveBeenCalled();
      expect(gitInitStub).toHaveBeenCalled();
      expect(loadPresetStub).not.toHaveBeenCalled();
      expect(globalPromptsStub).not.toHaveBeenCalled();
    });
  });
});
