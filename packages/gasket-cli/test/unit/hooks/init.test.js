const path = require('path');
const proxyquire = require('proxyquire').noCallThru();
const { match, stub } = require('sinon');
const assume = require('assume');

const BaseCommand = require('../../../src/command');
const gasketConfigFile = require('../../fixtures/gasket.config');
const defaultConfig = require('../../../src/config/defaults');
const packageJSON = require('../../../package.json');

describe('The init hook', () => {
  let init, GasketPluginEngine, gasket, metrics, Metrics;
  let oclifConfig;

  beforeEach(() => {
    oclifConfig = {
      warn: stub()
    };

    gasket = { exec: stub().resolves(), config: { plugins: { add: [] } } };
    GasketPluginEngine = stub().returns(gasket);
    metrics = { report: stub().resolves() };
    Metrics = stub().returns(metrics);

    init = proxyquire('../../../src/hooks/init', {
      '@gasket/plugin-engine': GasketPluginEngine,
      '../metrics': Metrics,
      './default-plugins': ['foo']
    });
  });

  afterEach(function () {
    defaultConfig.plugins = {
      presets: ['default']
    };
  });

  it('instantiates plugin engine with default plugins', async () => {
    await runInit();

    assume(GasketPluginEngine).is.calledWith({
      plugins: {
        presets: [],
        add: ['foo']
      },
      root: process.cwd()
    });
  });

  it('has default plugins added to package json', async () => {
    assume(packageJSON.dependencies).haveOwnProperty('@gasket/command-plugin');
    assume(packageJSON.dependencies).haveOwnProperty('@gasket/lifecycle-plugin');
  });

  it('attaches the Gasket plugin engine to the Oclif context', async () => {
    await runInit({
      argv: ['--config', path.join(__dirname, '../../fixtures/gasket.config.js')]
    });

    assume(oclifConfig).property('gasket', gasket);
  });

  it('reports metrics in initialization', async () => {
    await runInit({
      argv: ['--config', path.join(__dirname, '../../fixtures/gasket.config.js')]
    });

    assume(metrics.report).is.called(1);
  });

  it('loads the `gasket.config.js` config file if present', async () => {
    const root = path.join(__dirname, '../../fixtures');

    await runInit({ argv: ['--root', root] });

    assume(GasketPluginEngine).is.calledWith({
      ...gasketConfigFile,
      root
    });
  });

  it('uses a default config if there is no config file', async () => {
    await runInit();

    assume(GasketPluginEngine).is.calledWith({
      ...defaultConfig,
      root: match.string
    });
  });

  it('does not swallow errors in the gasket config', async () => {
    try {
      await runInit({
        argv: [
          '--config',
          path.join(__dirname, '../../fixtures/gasket.config.with-error.js')
        ]
      });
    } catch (err) {
      assume(err).is.instanceOf(Error);
      return;
    }

    throw new Error('Configuration error was swallowed');
  });

  it('adds files in `{root}/plugins` as plugins', async () => {
    const root = path.join(__dirname, '../../fixtures/with-plugins');

    await runInit({
      argv: ['--root', root]
    });

    assume(GasketPluginEngine).is.calledWith({
      root,
      plugins: {
        presets: ['default'],
        add: [path.join(root, './plugins/custom-plugin'), 'foo']
      }
    });
  });

  it('executes an initOclif event', async () => {
    await runInit();

    assume(gasket.exec).is.calledWith('initOclif', {
      oclifConfig,
      BaseCommand
    });
  });

  async function runInit({ argv = [] } = {}) {
    return await init({
      id: 'build',
      config: oclifConfig,
      argv
    });
  }
});
