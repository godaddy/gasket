const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');
const JSON5 = require('json5');
const path = require('path');
const ConfigBuilder = require('../../../../src/scaffold/config-builder');

describe('write-gasket-config', () => {
  let sandbox, mockContext, writeGasketConfig;
  let writeStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

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

    writeStub = sandbox.stub();

    writeGasketConfig = proxyquire('../../../../src/scaffold/actions/write-gasket-config', {
      'fs/promises': {
        writeFile: writeStub
      },
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(writeGasketConfig).property('wrapped');
  });

  it('writes the gasket.config.js file under destination', async () => {
    writeStub.resolves();
    await writeGasketConfig(mockContext);
    assume(writeStub).is.calledWith(path.join(mockContext.dest, 'gasket.config.js'));
  });

  it('writes gasket.config.js with module.exports', async () => {
    writeStub.resolves();
    await writeGasketConfig(mockContext);
    const output = writeStub.args[0][1];
    assume(output).startsWith('module.exports = ');
  });

  it('writes pretty JSON5 from gasketConfig', async () => {
    writeStub.resolves();
    await writeGasketConfig(mockContext);
    const output = writeStub.args[0][1];
    const expected = JSON5.stringify(mockContext.gasketConfig, null, 2);
    assume(output).endsWith(expected + ';\n');
  });

  it('does not double-quote keys', async () => {
    writeStub.resolves();
    await writeGasketConfig(mockContext);
    const output = writeStub.args[0][1];
    assume(output).contains('plugins: {');
  });

  it('Adds preset to config', async () => {
    mockContext.presets = ['bogus-preset'];
    writeStub.resolves();
    await writeGasketConfig(mockContext);
    const output = writeStub.args[0][1];
    assume(output).contains('presets: [');
    assume(output).contains('\'bogus-preset\'');
  });

  it('Adds extra plugins to config', async () => {
    mockContext.plugins = ['bogus-plugin', 'another-plugin'];
    writeStub.resolves();
    await writeGasketConfig(mockContext);
    const output = writeStub.args[0][1];
    assume(output).contains('add: [');
    assume(output).contains('\'bogus-plugin\'');
    assume(output).contains('\'another-plugin\'');
  });

  it('outputs keys without quotes, strings with single-quotes', async () => {
    mockContext.gasketConfig.add("bogus", "double"); // eslint-disable-line quotes
    writeStub.resolves();
    await writeGasketConfig(mockContext);
    const output = writeStub.args[0][1];
    assume(output).contains('bogus: \'double\'');
  });
});
