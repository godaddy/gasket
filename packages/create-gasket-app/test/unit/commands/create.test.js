/* eslint-disable max-statements */

const mockDumpErrorContext = vi.fn();
const consoleErrorStub = vi.spyOn(console, 'error').mockImplementation(() => { });
const consoleWarnStub = vi.spyOn(console, 'warn').mockImplementation(() => { });
const processExitStub = vi.spyOn(process, 'exit').mockImplementation((code) => {
  throw new Error(`process.exit(${code})`);
});
const mkDirStub = vi.fn();
const loadTemplateStub = vi.fn();
const copyTemplateStub = vi.fn();
const customizeTemplateStub = vi.fn();
const installTemplateDepsStub = vi.fn();
const printReportStub = vi.fn();
const gitInitStub = vi.fn();

vi.mock('ora', () => () => ({ warn: vi.fn() }));
vi.mock('../../../lib/scaffold/dump-error-context.js', () => ({
  dumpErrorContext: mockDumpErrorContext
}));
vi.mock('../../../lib/scaffold/actions/mkdir.js', () => ({
  default: mkDirStub
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
vi.mock('../../../lib/scaffold/actions/print-report.js', () => ({
  default: printReportStub
}));
vi.mock('../../../lib/scaffold/actions/git-init.js', () => ({
  default: gitInitStub
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
    expect(consoleWarnStub).toHaveBeenCalledWith('Warning: At least one of the options is required: --template, --template-path');
    expect(processExitStub).toHaveBeenCalledWith(1);
  });

  it('executes expected actions', async () => {
    await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--template', '@gasket/template-nextjs-pages']);
    expect(mkDirStub).toHaveBeenCalled();
    expect(loadTemplateStub).toHaveBeenCalled();
    expect(copyTemplateStub).toHaveBeenCalled();
    expect(customizeTemplateStub).toHaveBeenCalled();
    expect(installTemplateDepsStub).toHaveBeenCalled();
    expect(gitInitStub).toHaveBeenCalled();
    expect(printReportStub).toHaveBeenCalled();
  });

  it('exits on action errors', async () => {
    mkDirStub.mockRejectedValueOnce(new Error('YOUR DRIVE EXPLODED!'));
    try {
      await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--template', '@gasket/template-nextjs-pages']);
    } catch (err) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(err.message).toEqual('YOUR DRIVE EXPLODED!');
    }
  });

  it('dumps log on errors', async () => {
    mkDirStub.mockRejectedValueOnce(new Error('YOUR DRIVE EXPLODED!'));
    try {
      await cmd.parseAsync(['node', 'gasket', 'create', 'myapp', '--template', '@gasket/template-nextjs-pages']);
    } catch (err) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(err.message).toEqual('YOUR DRIVE EXPLODED!');
      // eslint-disable-next-line jest/no-conditional-expect
      expect(mockDumpErrorContext).toHaveBeenCalled();
    }
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

      // Should run template-specific actions
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

      // Should run template-specific actions
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
  });
});
