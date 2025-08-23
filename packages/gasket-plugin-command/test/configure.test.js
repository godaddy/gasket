

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

const configure = ((await import('../lib/configure.js')).default).handler;

describe('configure', () => {
  let mockGasket, mockConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGasket = {
      execSync: vi.fn().mockReturnValue([{ id: 'test', description: 'test', action: vi.fn() }]),
      config: {
        env: 'development'
      }
    };
    mockConfig = {
      commands: {
        test: {
          extra: 'test-only'
        }
      }
    };
  });

  it('should be a function', () => {
    expect(configure).toEqual(expect.any(Function));
  });

  it('adds command id to config if gasket command', () => {
    process.argv = ['node', '/path/to/gasket.js', 'test'];
    const result = configure(mockGasket, mockConfig);
    expect(result).toEqual(expect.objectContaining({ command: 'test' }));
  });

  it('applies command overrides', () => {
    process.argv = ['node', '/path/to/gasket.js', 'test'];
    expect(mockConfig).toHaveProperty('commands');
    const result = configure(mockGasket, mockConfig);
    expect(result).toEqual(expect.objectContaining({ extra: 'test-only' }));
    expect(result).not.toHaveProperty('commands');
  });
});
