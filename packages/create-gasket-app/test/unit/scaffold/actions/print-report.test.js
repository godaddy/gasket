
const printReport = (await import('../../../../lib/scaffold/actions/print-report')).default;

describe('printReport', () => {
  let mockContext, logStub;

  beforeEach(async () => {
    logStub = vi.spyOn(console, 'log');

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      plugins: [],
      generatedFiles: new Set(),
      messages: [],
      warnings: [],
      errors: [],
      nextSteps: []
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('is decorated action', async () => {
    expect(printReport).toHaveProperty('wrapped');
  });

  it('outputs banner', async function () {
    printReport({ context: mockContext });
    expect(logStub).toHaveBeenCalledWith(expect.stringContaining(
      (await import('../../../../lib/utils/logo')).logo
    ));
  });

  it('outputs warning and error count', function () {
    printReport({ context: mockContext });
    expect(logStub).toHaveBeenNthCalledWith(1, expect.stringContaining('0 warnings'));
    expect(logStub).toHaveBeenNthCalledWith(1, expect.stringContaining('0 errors'));

    mockContext.warnings = ['one', 'two'];
    mockContext.errors = ['one'];
    logStub.mockClear();
    printReport({ context: mockContext });
    expect(logStub).toHaveBeenNthCalledWith(1, expect.stringContaining('2 warnings'));
    expect(logStub).toHaveBeenNthCalledWith(1, expect.stringContaining('1 errors'));

  });

  it('outputs titles as Space Case', function () {
    printReport({ context: mockContext });
    expect(logStub.mock.calls[2][0]).toContain('App Name');
    expect(logStub.mock.calls[5][0]).toContain('Output');
  });

  it('outputs content with indentation', function () {
    printReport({ context: mockContext });
    expect(logStub).toHaveBeenCalledWith('  my-app');
    expect(logStub).toHaveBeenCalledWith('  /some/path/my-app');
  });

  it('outputs sections with content', function () {
    mockContext.warnings = ['one', 'two'];
    printReport({ context: mockContext });
    expect(logStub.mock.calls[8][0]).toContain('Warnings');
    expect(logStub).toHaveBeenNthCalledWith(10, '  one');
    expect(logStub).toHaveBeenNthCalledWith(11, '  two');
  });

  it('does not output sections with no content', function () {
    printReport({ context: mockContext });
    expect(logStub).not.toHaveBeenCalledWith('Warnings');
  });

  it('outputs sorted generated files', function () {
    mockContext.generatedFiles.add('zebra');
    mockContext.generatedFiles.add('apple');
    mockContext.generatedFiles.add('.secret');
    printReport({ context: mockContext });
    const concatOutput = logStub.mock.calls.reduce((acc, cur) => acc + cur, '');
    expect(concatOutput).toContain('.secret  apple  zebra');
  });
});
