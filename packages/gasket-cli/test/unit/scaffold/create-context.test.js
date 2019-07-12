/* eslint-disable max-statements */

const path = require('path');
const assume = require('assume');
const sinon = require('sinon');
const makeCreateContext = require('../../../src/scaffold/create-context');
const { CreateContext } = makeCreateContext;

describe('CreateRuntime', () => {
  let mockContext;
  let sandbox;
  let mockPlugin;
  let pkgAddStub;
  let pkgExtendStub;
  let filesAddStub;
  let context;
  let runtime;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    pkgAddStub = sinon.stub();
    pkgExtendStub = sinon.stub();
    filesAddStub = sinon.stub();
    mockPlugin = { name: 'mockPlugin' };

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      preset: 'bogus-preset',
      plugins: ['bogus-A-plugin', 'bogus-B-plugin'],
      pkg: {
        add: pkgAddStub,
        extend: pkgExtendStub
      },
      files: {
        add: filesAddStub
      }
    };

    context = new CreateContext(mockContext);
    runtime = context.runWith(mockPlugin);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('has all properties of the inner context', () => {
    Object.keys(mockContext).forEach(key => {
      if (key === 'pkg' || key === 'files') return;
      assume(runtime[key]).equals(context[key]);
    });
  });

  it('proxies set for ordinary properties', () => {
    const { appName, preset } = runtime;

    runtime.appName = 'proxied';
    runtime.preset = 'proxy-preset';

    assume(runtime.appName).equals('proxied');
    assume(runtime.appName).not.equals(appName);
    assume(runtime.preset).equals('proxy-preset');
    assume(runtime.preset).not.equals(preset);
  });

  it('silently refuses to set { files, pkg, source }', () => {
    const { files, pkg, source } = runtime;

    runtime.files = '';
    runtime.pkg = '';
    runtime.source = '';

    assume(runtime.files).equals(files);
    assume(runtime.pkg).equals(pkg);
    assume(runtime.source).equals(source);
  });

  it('sets the source to be the plugin provided', () => {
    assume(runtime.source).equals(mockPlugin);
  });

  it('proxies to another files object', () => {
    assume(runtime.files).not.equals(mockContext.files);
  });

  it('proxies to another pkg object', () => {
    assume(runtime.files).not.equals(mockContext.files);
  });

  it('invokes context.pkg.add with source plugin', () => {
    runtime.pkg.add('name', 'legitimate-use-for-proxy');
    assume(pkgAddStub).is.calledWithMatch(
      'name',
      'legitimate-use-for-proxy',
      mockPlugin
    );
  });

  it('invokes context.pkg.extend with source plugin', () => {
    const extension = { name: 'legitimate-use-for-proxy' };
    runtime.pkg.extend(extension);
    assume(pkgExtendStub).is.calledWithMatch(
      extension,
      mockPlugin
    );
  });

  it('invokes context.files.add with source plugin', () => {
    const globs = ['foo/bar/bazz', 'buzz/fizz/foo'];
    runtime.files.add(...globs);
    assume(filesAddStub).is.calledWithMatch({
      globs,
      source: mockPlugin
    });
  });
});

describe('makeCreateContext', () => {
  let results, argv;

  beforeEach(() => {
    argv = ['my-app'];
  });

  it('returns a create context object', () => {
    results = makeCreateContext();
    assume(results).instanceOf(CreateContext);
  });

  it('gets appName from arg values', () => {
    results = makeCreateContext(argv);
    assume(results.appName).equals('my-app');
  });

  it('defaults the appName if no arg value', () => {
    results = makeCreateContext();
    assume(results.appName).equals('templated-app');
  });

  it('defaults preset', () => {
    results = makeCreateContext(argv);
    assume(results.rawPresets).deep.equals(['default']);
  });

  it('sets rawPresets from flags', () => {
    results = makeCreateContext(argv, { presets: ['@gasket/bogus-preset@^1.2.3'] });
    assume(results.rawPresets).deep.equals(['@gasket/bogus-preset@^1.2.3']);
  });

  it('set presetPath from flags', () => {
    results = makeCreateContext(argv, { 'preset-path': '../bogus/path' });
    assume(results.presetPath).equals('../bogus/path');
  });

  it('sets rawPresets to null if presetPath set', () => {
    results = makeCreateContext(argv, { 'preset-path': '../bogus/path' });
    assume(results.rawPresets).equals(null);
  });

  it('uses npmconfig from flags', () => {
    results = makeCreateContext(argv, { npmconfig: '/some/path/to/npmconfig' });
    assume(results.npmconfig).equals('/some/path/to/npmconfig');
  });

  it('sets cwd from process', () => {
    results = makeCreateContext(argv);
    assume(results.cwd).equals(process.cwd());
  });

  it('sets dest from cwd and appName', () => {
    results = makeCreateContext(argv);
    assume(results.dest).equals(path.join(process.cwd(), 'my-app'));
  });

  it('sets relDest as relative to cwd', () => {
    results = makeCreateContext(argv);
    assume(results.relDest).equals('./my-app');
  });

  it('sets pkgLinks from flags', () => {
    results = makeCreateContext(argv, { 'npm-link': ['jest', 'some-user-plugin'] });
    assume(results.pkgLinks).eqls(['jest', 'some-user-plugin']);
  });

  it('sets plugins short names from flags', () => {
    results = makeCreateContext(argv, { plugins: ['jest@^1.2.3', 'some-user-plugin', '@gasket/intl-plugin'] });
    assume(results.plugins).eqls(['jest', 'some-user-plugin', 'intl']);
  });

  it('sets rawPlugins from flags', () => {
    results = makeCreateContext(argv, { plugins: ['jest@^1.2.3', 'some-user-plugin', '@gasket/intl-plugin'] });
    assume(results.rawPlugins).eqls(['jest@^1.2.3', 'some-user-plugin', '@gasket/intl-plugin']);
  });

  it('detects whether the target directory exists', () => {
    results = makeCreateContext(argv);
    assume(results.extant).eqls(false);
  });

  it('notes if creating in an extant directory', () => {
    results = makeCreateContext(['test']);
    assume(results.extant).eqls(true);
  });

  it('adds arrays for report messaging', () => {
    results = makeCreateContext(argv);
    assume(results.messages).an('array');
    assume(results.warnings).an('array');
    assume(results.errors).an('array');
    assume(results.nextSteps).an('array');
  });

  it('adds set for reporting generated files', () => {
    results = makeCreateContext(argv);
    assume(results.generatedFiles).a('set');
  });
});
