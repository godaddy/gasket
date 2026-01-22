/* eslint-disable max-statements */
import path from 'path';
const { CreateContext, makeCreateContext } = await import('../../../lib/scaffold/create-context');

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
    pkgAddStub = vi.fn();
    pkgExtendStub = vi.fn();
    pkgHasStub = vi.fn().mockReturnValue(true);
    filesAddStub = vi.fn();
    mockPlugin = { name: 'mockPlugin' };

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      template: '@gasket/template-test',
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
    vi.clearAllMocks();
  });

  it('has all properties of the inner context', () => {
    Object.keys(mockContext).forEach(key => {
      if (key === 'pkg' || key === 'files') return;
      expect(runtime[key]).toEqual(context[key]);
    });
  });

  it('proxies set for ordinary properties', () => {
    const { appName } = runtime;

    try {
      runtime.appName = 'proxied';
    } catch {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(runtime.appName).toEqual('proxied');
      // eslint-disable-next-line jest/no-conditional-expect
      expect(runtime.appName).not.toEqual(appName);
    }
  });

  it('silently refuses to set { files, pkg, source }', () => {
    const { files, pkg, source } = runtime;

    try {
      runtime.files = '';
      runtime.pkg = '';
      runtime.source = '';
    } catch {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(runtime.files).toEqual(files);
      // eslint-disable-next-line jest/no-conditional-expect
      expect(runtime.pkg).toEqual(pkg);
      // eslint-disable-next-line jest/no-conditional-expect
      expect(runtime.source).toEqual(source);
    }
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
    flags = { template: '@gasket/template-nextjs-pages' };
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

  it('sets template from flags', () => {
    results = makeCreateContext(argv, { template: '@gasket/template-nextjs-pages' });
    expect(results.template).toEqual('@gasket/template-nextjs-pages');
  });

  it('sets templatePath from flags', () => {
    results = makeCreateContext(argv, { templatePath: '../bogus/path' });
    expect(results.templatePath).toEqual('../bogus/path');
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
    const dest = path.join(process.cwd(), 'my-app');
    const expected = `.${path.sep}${path.relative(process.cwd(), dest)}`;
    results = makeCreateContext(argv, flags);
    expect(results.relDest).toEqual(expected);
  });

  it('sets pkgLinks from flags', () => {
    results = makeCreateContext(argv, { npmLink: ['@gasket/jest', 'gasket-plugin-some-user'], template: '@gasket/template-nextjs-pages' });
    expect(results.pkgLinks).toEqual(['@gasket/jest', 'gasket-plugin-some-user']);
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

  it('doesnt throw if template found', () => {
    let error;
    try {
      results = makeCreateContext(argv, flags);
    } catch (err) {
      error = err;
    }

    expect(error).toBeFalsy();
  });

  it('doesnt throw if template path found', () => {
    let error;
    try {
      results = makeCreateContext(argv, { templatePath: 'somePath' });
    } catch (err) {
      error = err;
    }

    expect(error).toBeFalsy();
  });

  it('assigns values from configFile flag to context', () => {
    flags = { configFile: './test/unit/commands/test-ci-config.json' };
    results = makeCreateContext(argv, flags);
    expect(results.unitTestSuite).toEqual('jest');
    expect(results.integrationTestSuite).toEqual('cypress');
    expect(results.appDescription).toEqual('A basic gasket app');
    expect(results.packageManager).toEqual('npm');
  });

  it('assigns values from config flag to context', () => {
    flags = { config: '{"description":"A test app","package":"npm","unitTestSuite":"fake"}' };
    results = makeCreateContext(argv, flags);
    expect(results.unitTestSuite).toEqual('fake');
    expect(results.description).toEqual('A test app');
    expect(results.package).toEqual('npm');
  });

  it('sets prompts from flags', () => {
    results = makeCreateContext(argv, { prompts: false });
    expect(results.prompts).toBeFalsy();
  });
});
