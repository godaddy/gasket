const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const path = require('path');

describe('buildManifest', function () {
  let mockGasket, buildManifest, writeFileStub;

  beforeEach(function () {
    mockGasket = {
      logger: {
        log: sinon.stub(),
        warning: sinon.stub(),
        error: sinon.stub()
      },
      config: {
        intl: {
          basePath: '',
          defaultPath: '/locales',
          defaultLocale: 'en-US',
          locales: ['en-US', 'fr-FR', 'fr-CH'],
          localesMap: {
            'fr-CH': 'fr-FR'
          },
          localesDir: path.join(__dirname, 'fixtures', 'locales'),
          manifestFilename: 'mock-manifest.json'
        }
      }
    };

    writeFileStub = sinon.stub().callsFake((...args) => {
      args[args.length - 1](null, true);
    });

    buildManifest = proxyquire('../lib/build-manifest', {
      fs: {
        writeFile: writeFileStub
      }
    });
  });

  afterEach(function () {
    sinon.restore();
  });

  const getOutput = () => JSON.parse(writeFileStub.getCall(0).args[1]);

  it('writes a json file in the locales dir', async function () {
    const expected = path.join(__dirname, 'fixtures', 'locales', 'mock-manifest.json');
    await buildManifest(mockGasket);
    assume(writeFileStub).called();
    assume(writeFileStub.getCall(0).args[0]).equals(expected);
  });

  it('logs error if failed to write manifest', async function () {
    writeFileStub.throws(new Error('Bad things man'));
    await assume(() => buildManifest(mockGasket)).to.throwAsync();
    assume(mockGasket.logger.error).calledWithMatch('build:locales: Unable to write locales manifest');
  });

  it('logs warning if no locale files found', async function () {
    mockGasket.config.intl.localesDir = 'bogus';
    await buildManifest(mockGasket);
    assume(mockGasket.logger.warning).calledWithMatch('build:locales: No locale files found');
  });

  it('includes expected properties in output', async function () {
    await buildManifest(mockGasket);
    const output = getOutput();
    const keys = Object.keys(output);
    assume(keys).eqls([
      'basePath', 'defaultPath', 'defaultLocale', 'locales', 'localesMap', 'paths'
    ]);
  });

  it('associates content hashes to locale path', async function () {
    await buildManifest(mockGasket);
    const output = getOutput();
    assume(output.paths).property('locales/en-US.json', '10decbe');
    assume(output.paths).property('locales/extra/en-US.json', 'ff5a352');
  });

  it('does not include any existing manifest in paths', async function () {
    await buildManifest(mockGasket);
    const output = getOutput();
    assume(output.paths).not.property('mock-manifest.json');
  });

  it('includes expected files in paths', async function () {
    await buildManifest(mockGasket);
    const output = getOutput();
    assume(output.paths).eqls({
      'locales/en-US.json': '10decbe',
      'locales/extra/en-US.json': 'ff5a352',
      'locales/extra/fr-FR.json': '2155926',
      'locales/fr-FR.json': '21047f1'
    });
  });
});
