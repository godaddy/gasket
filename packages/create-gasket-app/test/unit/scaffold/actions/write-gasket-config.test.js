import { jest } from '@jest/globals';
import path from 'path';

const mockWriteStub = jest.fn();

jest.unstable_mockModule('fs/promises', () => ({
  writeFile: mockWriteStub.mockResolvedValue()
}));
const writeGasketConfig = (await import('../../../../lib/scaffold/actions/write-gasket-config')).default;
const { ConfigBuilder } = await import('../../../../lib/scaffold/config-builder');

describe('write-gasket-config', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      cwd: '/some/path',
      dest: '/some/path/my-app',
      gasketConfig: new ConfigBuilder({
        plugins: [{ pluginBogus: '@gasket/plugin-bogus' }]
      }),
      generatedFiles: new Set(),
      errors: []
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is decorated action', async () => {
    expect(writeGasketConfig).toHaveProperty('wrapped');
  });

  it('writes the gasket.js file under destination', async () => {
    await writeGasketConfig({ context: mockContext });
    expect(mockWriteStub).toHaveBeenCalledWith(path.join(mockContext.dest, 'gasket.js'), expect.any(String), 'utf8');
  });

  it('writes gasket.js with export default', async () => {
    await writeGasketConfig({ context: mockContext });
    const output = mockWriteStub.mock.calls[0][1];
    expect(output).toContain('export default');
  });

  it('writes @gasket/core import', async () => {
    await writeGasketConfig({ context: mockContext });
    const output = mockWriteStub.mock.calls[0][1];
    expect(output).toContain('import { makeGasket } from \'@gasket/core\';');
  });

  it('writes gasket.js with makeGasket', async () => {
    await writeGasketConfig({ context: mockContext });
    const output = mockWriteStub.mock.calls[0][1];
    expect(output).toContain('makeGasket(');
  });

  it('does not double-quote keys', async () => {
    await writeGasketConfig({ context: mockContext });
    const output = mockWriteStub.mock.calls[0][1];
    expect(output).toContain('plugins:');
  });

  it('writes filename', async () => {
    await writeGasketConfig({ context: mockContext });
    const output = mockWriteStub.mock.calls[0][1];
    expect(output).toContain('filename: import.meta.filename');
  });

  it('outputs keys without quotes, strings with single-quotes', async () => {
    mockContext.gasketConfig.add("bogus", "double"); // eslint-disable-line quotes
    await writeGasketConfig({ context: mockContext });
    const output = mockWriteStub.mock.calls[0][1];
    expect(output).toContain('bogus: \'double\'');
  });

  it('writes plugin imports', async () => {
    mockContext.gasketConfig.fields.plugins = ['pluginBogus', 'pluginBogus2'];
    mockContext.gasketConfig.fields.pluginImports = {
      pluginBogus: '@gasket/plugin-bogus',
      pluginBogus2: '@gasket/plugin-bogus2'
    };
    await writeGasketConfig({ context: mockContext });
    const output = mockWriteStub.mock.calls[0][1];
    expect(output).toContain('import pluginBogus from \'@gasket/plugin-bogus\';');
    expect(output).toContain('import pluginBogus2 from \'@gasket/plugin-bogus2\';');
    expect(output.match(/\[(\s.*)+\]/)[0]).toBe('[\n\t\tpluginBogus,\n\t\tpluginBogus2\n\xa0\xa0]');
  });

  it('writes non-plugin imports', async () => {
    mockContext.gasketConfig.fields.imports = {
      bogus: '@bogus'
    };
    await writeGasketConfig({ context: mockContext });
    const output = mockWriteStub.mock.calls[0][1];
    expect(output).toContain('import bogus from \'@bogus\';');
  });

  it('writes expressions', async () => {
    mockContext.gasketConfig.fields.expressions = ['const bogus = 1;'];
    await writeGasketConfig({ context: mockContext });
    const output = mockWriteStub.mock.calls[0][1];
    expect(output).toContain('const bogus = 1;');
  });

  it('writes injection assignments', async () => {
    mockContext.gasketConfig.fields.injectionAssignments = {
      bogus: 'bogus'
    };
    await writeGasketConfig({ context: mockContext });
    const output = mockWriteStub.mock.calls[0][1];
    expect(output).toContain('bogus: bogus');
  });

  it('cleans up fields', async () => {
    await writeGasketConfig({ context: mockContext });
    expect(mockContext.gasketConfig.fields.imports).toBeUndefined();
    expect(mockContext.gasketConfig.fields.pluginImports).toBeUndefined();
    expect(mockContext.gasketConfig.fields.expressions).toBeUndefined();
    expect(mockContext.gasketConfig.fields.injectionAssignments).toBeUndefined();
  });
});
