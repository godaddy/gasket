

const mockAddCommand = vi.fn();
const mockParse = vi.fn();
const mockProcessCommand = vi.fn();

vi.mock('../lib/cli.js', () => {

  return {
    gasketBin: {
      addCommand: mockAddCommand,
      parse: mockParse
    },
    processCommand: mockProcessCommand.mockReturnValue({ command: 'test', hidden: false, isDefault: false })
  };
});

const ready = (await import('../lib/ready.js')).default;

describe('ready', () => {
  let mockGasket;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGasket = {
      execSync: vi.fn().mockReturnValue([{ id: 'test', description: 'test', action: vi.fn() }]),
      config: {
        env: 'development'
      }
    };
  });

  it('should be a function', () => {
    expect(ready).toEqual(expect.any(Function));
  });

  it('should parse gasketBin if gasket custom command is set', async () => {
    mockGasket.config.command = 'docs';
    await ready(mockGasket);
    expect(mockParse).toHaveBeenCalled();
  });

  it('should not parse gasketBin if gasket custom command is not set', async () => {
    await ready(mockGasket);
    expect(mockParse).not.toHaveBeenCalled();
  });
});
