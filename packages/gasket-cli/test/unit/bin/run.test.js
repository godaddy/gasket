const mockNameMethod = jest.fn();
const mockDescriptionMethod = jest.fn();
const mockVersionMethod = jest.fn();
const mockParseAsync = jest.fn();
const mockInit = jest.fn();
const mockProcessCommand = jest.fn();
const mockAddCommand = jest.fn();
const mockCreateCommand = {
  id: 'create',
  description: 'Create a new Gasket project',
  args: [
    {
      name: 'appname',
      description: 'Name of the Gasket application to create',
      required: true
    }
  ],
  options: [
    {
      name: 'presets',
      short: 'p',
      description: 'Initial Gasket preset(s) to use',
      parse: jest.fn()
    }
  ],
  action: jest.fn()
};

jest.mock('../../../lib/init', () => mockInit);
jest.mock('../../../package.json', () => ({ description: 'mockDescription', version: 'mockVersion' }));
jest.mock('../../../lib/commands/create', () => mockCreateCommand);
jest.mock('../../../lib/utils', () => ({
  processCommand: mockProcessCommand.mockReturnValue('mockCommand')
}));
jest.mock('commander', () => ({
  Command: jest.fn().mockImplementation(() => ({
    name: mockNameMethod.mockReturnThis(),
    description: mockDescriptionMethod.mockReturnThis(),
    command: jest.fn().mockReturnThis(),
    option: jest.fn().mockReturnThis(),
    version: mockVersionMethod.mockReturnThis(),
    addHelpText: jest.fn().mockReturnThis(),
    addCommand: mockAddCommand.mockReturnThis(),
    parseAsync: mockParseAsync.mockResolvedValue(true),
    optsWithGlobals: jest.fn().mockReturnValue({ gasketConfig: 'gasket.config' })
  }))
}));

const { Command } = require('commander');

describe('run', () => {

  beforeEach(() => {
    jest.replaceProperty(process, 'argv', ['node', 'gasket']);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('creates program', async () => {
    await require('../../../bin/run');
    expect(Command).toHaveBeenCalled();
  });

  it('defines gasketBin', async () => {
    await require('../../../bin/run');
    expect(mockNameMethod).toHaveBeenCalledWith('gasket');
    expect(mockDescriptionMethod).toHaveBeenCalledWith('mockDescription');
    expect(mockVersionMethod).toHaveBeenCalledWith('mockVersion');
  });

  it('adds create command', async () => {
    await require('../../../bin/run');
    expect(mockProcessCommand).toHaveBeenCalledWith(mockCreateCommand);
    expect(mockAddCommand).toHaveBeenCalled();
  });

  it('exits early for create command', async () => {
    jest.replaceProperty(process, 'argv', ['node', 'gasket', 'create']);
    await require('../../../bin/run');
    expect(mockParseAsync).toHaveBeenCalled();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('exits early for --version flag', async () => {
    jest.replaceProperty(process, 'argv', ['node', 'gasket', '--version']);
    await require('../../../bin/run');
    expect(mockParseAsync).toHaveBeenCalled();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('exits early for -V flag', async () => {
    jest.replaceProperty(process, 'argv', ['node', 'gasket', '-V']);
    await require('../../../bin/run');
    expect(mockParseAsync).toHaveBeenCalled();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('exits early for --help flag', async () => {
    jest.replaceProperty(process, 'argv', ['node', 'gasket', '--help']);
    await require('../../../bin/run');
    expect(mockParseAsync).toHaveBeenCalled();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('calls init for other commands', async () => {
    jest.replaceProperty(process, 'argv', ['node', 'gasket', 'build']);
    await require('../../../bin/run');
    expect(mockInit).toHaveBeenCalled();
  });

  it('passes args to init', async () => {
    jest.replaceProperty(process, 'argv', ['node', 'gasket', 'build']);
    await require('../../../bin/run');
    expect(mockInit).toHaveBeenCalledWith({
      id: 'build',
      config: {
        bin: expect.any(Object),
        root: process.cwd(),
        options: { gasketConfig: 'gasket.config' }
      },
      argv: ['node', 'gasket', 'build']
    });
  });
});
