/* eslint-disable max-statements */
const pkgVersion = '2.2.0';
jest.mock('../../../../package.json', () => ({ version: pkgVersion }));

const cliVersion = require('../../../../src/scaffold/actions/cli-version');

describe('cliVersion', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      appName: 'my-app',
      appDescription: 'my cool app',
      presetInfos: [{
        name: '@gasket/bogus-preset',
        version: '3.2.1',
        package: {
          name: '@gasket/bogus-preset',
          version: '3.2.1'
        }
      }],
      warnings: []
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is decorated action', async () => {
    expect(cliVersion).toHaveProperty('wrapped');
  });

  it('adds active cliVersion to context', async () => {
    await cliVersion(mockContext);
    expect(mockContext).toHaveProperty('cliVersion');
  });

  it('adds cliVersionRequired to context', async () => {
    await cliVersion(mockContext);
    expect(mockContext).toHaveProperty('cliVersionRequired');
  });

  it('derives active cliVersion from own package', async () => {
    await cliVersion(mockContext);
    expect(mockContext).toHaveProperty('cliVersion', pkgVersion);
  });

  it('derives cliVersionRequired from own package', async () => {
    await cliVersion(mockContext);
    expect(mockContext).toHaveProperty('cliVersionRequired', `^${pkgVersion}`);
  });

  it('uses own cli version if not specified in preset', async () => {
    mockContext.presetInfos = [{
      package: {
        name: '@gasket/bogus-preset',
        version: '30.20.10',
        dependencies: {}
      }
    }];
    await cliVersion(mockContext);
    expect(mockContext).toHaveProperty('cliVersionRequired', `^${pkgVersion}`);
  });

  it('derives cli version from preset', async () => {
    mockContext.presetInfos = [{
      package: {
        name: '@gasket/bogus-preset',
        version: '30.20.10',
        dependencies: { '@gasket/cli': '^1.2.3' }
      }
    }];
    await cliVersion(mockContext);
    expect(mockContext).toHaveProperty('cliVersionRequired', `^1.2.3`);
  });

  it('derives minimum cli version from multiple presets', async () => {
    mockContext.presetInfos = [{
      package: {
        name: '@gasket/bogus-a-preset',
        version: '10.20.30',
        dependencies: { '@gasket/cli': '^1.3.4' }
      }
    }, {
      package: {
        name: '@gasket/bogus-b-preset',
        version: '10.20.30',
        dependencies: { '@gasket/cli': '^2.9.9' }
      }
    }, {
      package: {
        name: '@gasket/bogus-c-preset',
        version: '30.20.10',
        dependencies: { '@gasket/cli': '^1.2.3' }
      }
    }];
    await cliVersion(mockContext);
    expect(mockContext).toHaveProperty('cliVersionRequired', `^1.2.3`);
  });

  it('issues warning if global cli is not compatible with installed version', async () => {
    mockContext.presetInfos = [{
      package: {
        name: '@gasket/bogus-a-preset',
        version: '10.20.30',
        dependencies: { '@gasket/cli': '^1.2.3' }
      }
    }];
    await cliVersion(mockContext);
    expect(mockContext.warnings.length).toBeGreaterThanOrEqual(1);
    expect(mockContext.warnings).toContain(
      `Installed @gasket/cli@^1.2.3 ` +
      `which is not compatible with global version (${pkgVersion}) ` +
      `used to execute \`gasket create\``
    );
  });

  it('does not issue warning if global cli is compatible with installed version', async () => {
    mockContext.presetInfos = [{
      package: {
        name: '@gasket/bogus-a-preset',
        version: '10.20.30',
        dependencies: { '@gasket/cli': '^2.2.0' }
      }
    }];
    await cliVersion(mockContext);
    expect(mockContext.warnings).toHaveLength(0);
  });

  it('issues warning if cli version does not satisfy a preset', async () => {
    mockContext.presetInfos = [{
      package: {
        name: '@gasket/bogus-a-preset',
        version: '10.20.30',
        dependencies: { '@gasket/cli': '^2.3.4' }
      }
    }, {
      package: {
        name: '@gasket/bogus-b-preset',
        version: '10.20.30',
        dependencies: { '@gasket/cli': '^8.9.9' }
      }
    }, {
      package: {
        name: '@gasket/bogus-c-preset',
        version: '30.20.10',
        dependencies: { '@gasket/cli': '^2.1.2' }
      }
    }];
    await cliVersion(mockContext);
    expect(mockContext.warnings.length).toBeGreaterThanOrEqual(1);
    expect(mockContext.warnings).toContain(
      'Installed @gasket/cli@^2.1.2 for @gasket/bogus-c-preset@30.20.10 ' +
      'which does not satisfy version (^8.9.9) ' +
      'required by @gasket/bogus-b-preset@10.20.30'
    );
  });

  it('does not issue warning if cli version does satisfy a preset', async () => {
    mockContext.presetInfos = [{
      package: {
        name: '@gasket/bogus-a-preset',
        version: '10.20.30',
        dependencies: { '@gasket/cli': '^2.3.4' }
      }
    }, {
      package: {
        name: '@gasket/bogus-b-preset',
        version: '10.20.30',
        dependencies: { '@gasket/cli': '^2.9.9' }
      }
    }, {
      package: {
        name: '@gasket/bogus-c-preset',
        version: '30.20.10',
        dependencies: { '@gasket/cli': '^2.1.2' }
      }
    }];
    await cliVersion(mockContext);
    expect(mockContext.warnings).toHaveLength(0);
  });

  it('supports file path for preset cli version', async () => {
    mockContext.presetInfos = [{
      package: {
        name: '@gasket/bogus-a-preset',
        version: '10.20.30',
        dependencies: { '@gasket/cli': 'file:../../../gasket-cli' }
      }
    }, {
      package: {
        name: '@gasket/bogus-b-preset',
        version: '10.20.30',
        dependencies: { '@gasket/cli': '^2.9.9' }
      }
    }];
    await cliVersion(mockContext);
    expect(mockContext).toHaveProperty('cliVersionRequired', `file:../../../gasket-cli`);
  });

  it('shows warning spinner for any warnings', async () => {
    const warnStub = jest.fn();
    mockContext.presetInfos = [{
      package: {
        name: '@gasket/bogus-a-preset',
        version: '10.20.30',
        dependencies: { '@gasket/cli': '^2.3.4' }
      }
    }, {
      package: {
        name: '@gasket/bogus-b-preset',
        version: '10.20.30',
        dependencies: { '@gasket/cli': '^8.9.9' }
      }
    }, {
      package: {
        name: '@gasket/bogus-c-preset',
        version: '30.20.10',
        dependencies: { '@gasket/cli': '^2.1.2' }
      }
    }];
    await cliVersion.wrapped(mockContext, { warn: warnStub });
    expect(mockContext.warnings.length).toBeGreaterThanOrEqual(1);
    expect(warnStub).toHaveBeenCalledWith('CLI version mismatch');
  });
});
