const mockWriteStub = jest.fn();

jest.mock('fs', () => ({
  promises: {
    writeFile: mockWriteStub
  }
}));
const writeGasketConfig = require('../../../../src/scaffold/actions/write-gasket-config');
const JSON5 = require('json5');
const path = require('path');
const ConfigBuilder = require('../../../../src/scaffold/config-builder');

describe('write-gasket-config', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      cwd: '/some/path',
      dest: '/some/path/my-app',
      gasketConfig: new ConfigBuilder({
        plugins: {
          presets: ['default']
        }
      }),
      generatedFiles: new Set()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is decorated action', async () => {
    expect(writeGasketConfig).toHaveProperty('wrapped');
  });

  it('writes the gasket.config.js file under destination', async () => {
    mockWriteStub.mockResolvedValue();
    await writeGasketConfig(mockContext);
    expect(mockWriteStub).toHaveBeenCalledWith(path.join(mockContext.dest, 'gasket.config.js'), expect.any(String), 'utf8');
  });

  it('writes gasket.config.js with module.exports', async () => {
    mockWriteStub.mockResolvedValue();
    await writeGasketConfig(mockContext);
    const output = mockWriteStub.mock.calls[0][1];
    expect(output).toContain('module.exports = ');
  });

  it('writes pretty JSON5 from gasketConfig', async () => {
    mockWriteStub.mockResolvedValue();
    await writeGasketConfig(mockContext);
    const output = mockWriteStub.mock.calls[0][1];
    const expected = JSON5.stringify(mockContext.gasketConfig, null, 2);
    expect(output).toContain(expected + ';\n');
  });

  it('does not double-quote keys', async () => {
    mockWriteStub.mockResolvedValue();
    await writeGasketConfig(mockContext);
    const output = mockWriteStub.mock.calls[0][1];
    expect(output).toContain('plugins: {');
  });

  it('Adds preset to config', async () => {
    mockContext.presets = ['bogus-preset'];
    mockWriteStub.mockResolvedValue();
    await writeGasketConfig(mockContext);
    const output = mockWriteStub.mock.calls[0][1];
    expect(output).toContain('presets: [');
    expect(output).toContain('\'bogus-preset\'');
  });

  it('Adds extra plugins to config', async () => {
    mockContext.plugins = ['bogus-plugin', 'another-plugin'];
    mockWriteStub.mockResolvedValue();
    await writeGasketConfig(mockContext);
    const output = mockWriteStub.mock.calls[0][1];
    expect(output).toContain('add: [');
    expect(output).toContain('\'bogus-plugin\'');
    expect(output).toContain('\'another-plugin\'');
  });

  it('outputs keys without quotes, strings with single-quotes', async () => {
    mockContext.gasketConfig.add("bogus", "double"); // eslint-disable-line quotes
    mockWriteStub.mockResolvedValue();
    await writeGasketConfig(mockContext);
    const output = mockWriteStub.mock.calls[0][1];
    expect(output).toContain('bogus: \'double\'');
  });
});
