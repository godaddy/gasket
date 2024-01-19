/* eslint-disable max-statements */
const path = require('path');
const makeCreateContext = require('../../../src/scaffold/create-context');
const { CreateContext } = makeCreateContext;

describe('CreateRuntime', () => {
  let mockContext;
  let mockPlugin;
  let pkgAddStub;
  let pkgExtendStub;
  let pkgHasStub;
  let filesAddStub;
  let context;
  let runtime;

  beforeEach(() => {
    pkgAddStub =jest.fn();
    pkgExtendStub =jest.fn();
    pkgHasStub =jest.fn().mockReturnValue(true);
    filesAddStub =jest.fn();
    mockPlugin = { name: 'mockPlugin' };

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      preset: 'gasket-preset-bogus',
      plugins: ['@gasket/plugin-bogus-A', '@gasket/plugin-bogus-B'],
      pkg: {
        add: pkgAddStub,
        extend: pkgExtendStub,
        has: pkgHasStub
      },
      files: {
        add: filesAddStub
      }
    };

    context = new CreateContext(mockContext);
    runtime = context.runWith(mockPlugin);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('has all properties of the inner context', () => {
    Object.keys(mockContext).forEach(key => {
      if (key === 'pkg' || key === 'files') return;
      expect(runtime[key]).toEqual(context[key]);
    });
  });

  it('proxies set for ordinary properties', () => {
    const { appName, preset } = runtime;

    runtime.appName = 'proxied';
    runtime.preset = 'proxy-preset';

    expect(runtime.appName).toEqual('proxied');
    expect(runtime.appName).not.toEqual(appName);
    expect(runtime.preset).toEqual('proxy-preset');
    expect(runtime.preset).not.toEqual(preset);
  });

  it('silently refuses to set { files, pkg, source }', () => {
    const { files, pkg, source } = runtime;

    runtime.files = '';
    runtime.pkg = '';
    runtime.source = '';

    expect(runtime.files).toEqual(files);
    expect(runtime.pkg).toEqual(pkg);
    expect(runtime.source).toEqual(source);
  });

  it('sets the source to be the plugin provided', () => {
    expect(runtime.source).toEqual(mockPlugin);
  });

  it('proxies to another files object', () => {
    expect(runtime.files).not.toEqual(mockContext.files);
  });

  it('proxies to another pkg object', () => {
    expect(runtime.files).not.toEqual(mockContext.files);
  });

  it('invokes context.pkg.add with source plugin', () => {
    runtime.pkg.add('name', 'legitimate-use-for-proxy');
    expect(pkgAddStub).toHaveBeenCalledWith(
      'name',
      'legitimate-use-for-proxy',
      mockPlugin,
      expect.undefined
    );
  });

  it('passes through options for context.pkg.add', () => {
    const mockOptions = { bogus: true };
    runtime.pkg.add('name', 'legitimate-use-for-proxy', mockOptions);
    expect(pkgAddStub).toHaveBeenCalledWith(
      'name',
      'legitimate-use-for-proxy',
      mockPlugin,
      mockOptions
    );
  });

  it('invokes context.pkg.extend with source plugin', () => {
    const extension = { name: 'legitimate-use-for-proxy' };
    runtime.pkg.extend(extension);
    expect(pkgExtendStub).toHaveBeenCalledWith(
      extension,
      mockPlugin
    );
  });

  it('proxies context.pkg.has with return', () => {
    const result = runtime.pkg.has('name', 'legitimate-use-for-proxy');
    expect(pkgHasStub).toHaveBeenCalledWith(
      'name',
      'legitimate-use-for-proxy'
    );

    expect(result).toBeTruthy();
  });

  it('invokes context.files.add with source plugin', () => {
    const globs = ['foo/bar/bazz', 'buzz/fizz/foo'];
    runtime.files.add(...globs);
    expect(filesAddStub).toHaveBeenCalledWith({
      globs,
      source: mockPlugin
    });
  });
});

describe('makeCreateContext', () => {
  let results, argv, flags;

  beforeEach(() => {
    argv = ['my-app'];
    flags = { presets: ['@gasket/nextjs'] };
  });

  it('returns a create context object', () => {
    results = makeCreateContext([], flags);
    expect(results).toBeInstanceOf(CreateContext);
  });

  it('gets appName from arg values', () => {
    results = makeCreateContext(argv, flags);
    expect(results.appName).toEqual('my-app');
  });

  it('defaults the appName if no arg value', () => {
    results = makeCreateContext([], flags);
    expect(results.appName).toEqual('templated-app');
  });

  it('sets rawPresets from flags', () => {
    results = makeCreateContext(argv, { presets: ['@gasket/preset-bogus@^1.2.3'] });
    expect(results.rawPresets).toEqual(['@gasket/preset-bogus@^1.2.3']);
  });

  it('sets rawPresets from flags with multiple entries', () => {
    results = makeCreateContext(argv, { presets: ['@gasket/preset-bogus@^1.2.3', '@gasket/preset-test@^3.1.2'] });
    expect(results.rawPresets).toEqual(['@gasket/preset-bogus@^1.2.3', '@gasket/preset-test@^3.1.2']);
  });

  it('sets rawPresets to empty array if not defined', () => {
    results = makeCreateContext(argv, { 'preset-path': ['../bogus/path'] });
    expect(results.rawPresets).toEqual([]);
  });

  it('sets localPresets from flags', () => {
    results = makeCreateContext(argv, { 'preset-path': ['../bogus/path'] });
    expect(results.localPresets).toEqual(['../bogus/path']);
  });

  it('sets localPresets from flags with multiple entries', () => {
    results = makeCreateContext(argv, { 'preset-path': ['../bogus/path', '../test/path'] });
    expect(results.localPresets).toEqual(['../bogus/path', '../test/path']);
  });

  it('sets localPresets to empty array if not defined', () => {
    results = makeCreateContext(argv, { presets: ['@gasket/preset-bogus@^1.2.3'] });
    expect(results.localPresets).toEqual([]);
  });

  it('uses npmconfig from flags', () => {
    results = makeCreateContext(argv, { npmconfig: '/some/path/to/npmconfig', presets: ['@gasket/nextjs'] });
    expect(results.npmconfig).toEqual('/some/path/to/npmconfig');
  });

  it('npmconfig is always absolute', () => {
    results = makeCreateContext(argv, { npmconfig: '~/.npmconfig', presets: ['nextjs'] });
    expect(results.npmconfig).toContain('/.npmconfig');
    expect(path.isAbsolute(results.npmconfig)).toBeTruthy();
  });

  it('handles if npmconfig if not set', () => {
    results = makeCreateContext(argv, { presets: ['nextjs'] });
    expect(results.npmconfig).toBeFalsy();
  });

  it('sets cwd from process', () => {
    results = makeCreateContext(argv, flags);
    expect(results.cwd).toEqual(process.cwd());
  });

  it('sets dest from cwd and appName', () => {
    results = makeCreateContext(argv, flags);
    expect(results.dest).toEqual(path.join(process.cwd(), 'my-app'));
  });

  it('sets relDest as relative to cwd', () => {
    results = makeCreateContext(argv, flags);
    expect(results.relDest).toEqual('./my-app');
  });

  it('sets pkgLinks from flags', () => {
    results = makeCreateContext(argv, { 'npm-link': ['@gasket/jest', 'gasket-plugin-some-user'], 'presets': ['godady'] });
    expect(results.pkgLinks).toEqual(['@gasket/jest', 'gasket-plugin-some-user']);
  });

  it('sets plugins short names from flags', () => {
    results =
      makeCreateContext(argv, {
        plugins: ['@gasket/jest@^1.2.3', 'gasket-plugin-some-user', '@gasket/plugin-intl'],
        presets: ['@gasket/nextjs']
      });
    expect(results.plugins).toEqual(['@gasket/jest', 'some-user', '@gasket/intl']);
  });

  it('sets rawPlugins from flags', () => {
    results =
      makeCreateContext(argv, {
        plugins: ['@gasket/jest@^1.2.3', 'gasket-plugin-some-user', '@gasket/plugin-intl'],
        presets: ['@gasket/nextjs']
      });
    expect(results.rawPlugins).toEqual(['@gasket/jest@^1.2.3', 'gasket-plugin-some-user', '@gasket/plugin-intl']);
  });

  it('detects whether the target directory exists', () => {
    results = makeCreateContext(argv, flags);
    expect(results.extant).toEqual(false);
  });

  it('notes if creating in an extant directory', () => {
    results = makeCreateContext(['test'], flags);
    expect(results.extant).toEqual(true);
  });

  it('adds arrays for report messaging', () => {
    results = makeCreateContext(argv, flags);
    expect(results.messages).toBeInstanceOf(Array);
    expect(results.warnings).toBeInstanceOf(Array);
    expect(results.errors).toBeInstanceOf(Array);
    expect(results.nextSteps).toBeInstanceOf(Array);
  });

  it('adds set for reporting generated files', () => {
    results = makeCreateContext(argv, flags);
    expect(results.generatedFiles).toBeInstanceOf(Set);
  });

  it('doesnt throw if preset found', () => {
    let error;
    try {
      results = makeCreateContext(argv, flags);
    } catch (err) {
      error = err;
    }

    expect(error).toBeFalsy();
  });

  it('doesnt throw if preset path found', () => {
    let error;
    try {
      results = makeCreateContext(argv, { 'preset-path': ['somePath'] });
    } catch (err) {
      error = err;
    }

    expect(error).toBeFalsy();
  });

  it('assigns values from config-file flag to context', () => {
    flags = { 'config-file': './test/unit/commands/test-ci-config.json' };
    results = makeCreateContext(argv, flags);
    expect(results.testSuite).toEqual('jest');
    expect(results.appDescription).toEqual('A basic gasket app');
    expect(results.packageManager).toEqual('npm');
  });

  it('assigns values from config flag to context', () => {
    flags = { config: '{"description":"A test app","package":"npm","testSuite":"fake"}' };
    results = makeCreateContext(argv, flags);
    expect(results.testSuite).toEqual('fake');
    expect(results.description).toEqual('A test app');
    expect(results.package).toEqual('npm');
  });

  it('sets prompts from flags', () => {
    results = makeCreateContext(argv, { prompts: false });
    expect(results.prompts).toBeFalsy();
  });

});
