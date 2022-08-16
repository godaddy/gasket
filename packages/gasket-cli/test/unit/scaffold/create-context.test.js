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
  let pkgHasStub;
  let filesAddStub;
  let context;
  let runtime;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    pkgAddStub = sinon.stub();
    pkgExtendStub = sinon.stub();
    pkgHasStub = sinon.stub().returns(true);
    filesAddStub = sinon.stub();
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

  it('passes through options for context.pkg.add', () => {
    const mockOptions = { bogus: true };
    runtime.pkg.add('name', 'legitimate-use-for-proxy', mockOptions);
    assume(pkgAddStub).is.calledWithMatch(
      'name',
      'legitimate-use-for-proxy',
      mockPlugin,
      mockOptions
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

  it('proxies context.pkg.has with return', () => {
    const result = runtime.pkg.has('name', 'legitimate-use-for-proxy');
    assume(pkgHasStub).is.calledWithMatch(
      'name',
      'legitimate-use-for-proxy'
    );

    assume(result).is.true();
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
  let results, argv, flags;

  beforeEach(() => {
    argv = ['my-app'];
    flags = { presets: ['@gasket/nextjs'] };
  });

  it('returns a create context object', () => {
    results = makeCreateContext([], flags);
    assume(results).instanceOf(CreateContext);
  });

  it('gets appName from arg values', () => {
    results = makeCreateContext(argv, flags);
    assume(results.appName).equals('my-app');
  });

  it('defaults the appName if no arg value', () => {
    results = makeCreateContext([], flags);
    assume(results.appName).equals('templated-app');
  });

  it('sets rawPresets from flags', () => {
    results = makeCreateContext(argv, { presets: ['@gasket/preset-bogus@^1.2.3'] });
    assume(results.rawPresets).deep.equals(['@gasket/preset-bogus@^1.2.3']);
  });

  it('sets rawPresets from flags with multiple entries', () => {
    results = makeCreateContext(argv, { presets: ['@gasket/preset-bogus@^1.2.3', '@gasket/preset-test@^3.1.2'] });
    assume(results.rawPresets).deep.equals(['@gasket/preset-bogus@^1.2.3', '@gasket/preset-test@^3.1.2']);
  });

  it('sets rawPresets to empty array if not defined', () => {
    results = makeCreateContext(argv, { 'preset-path': ['../bogus/path'] });
    assume(results.rawPresets).deep.equals([]);
  });

  it('sets localPresets from flags', () => {
    results = makeCreateContext(argv, { 'preset-path': ['../bogus/path'] });
    assume(results.localPresets).deep.equals(['../bogus/path']);
  });

  it('sets localPresets from flags with multiple entries', () => {
    results = makeCreateContext(argv, { 'preset-path': ['../bogus/path', '../test/path'] });
    assume(results.localPresets).deep.equals(['../bogus/path', '../test/path']);
  });

  it('sets localPresets to empty array if not defined', () => {
    results = makeCreateContext(argv, { presets: ['@gasket/preset-bogus@^1.2.3'] });
    assume(results.localPresets).deep.equals([]);
  });

  it('uses npmconfig from flags', () => {
    results = makeCreateContext(argv, { npmconfig: '/some/path/to/npmconfig', presets: ['@gasket/nextjs'] });
    assume(results.npmconfig).equals('/some/path/to/npmconfig');
  });

  it('npmconfig is always absolute', () => {
    results = makeCreateContext(argv, { npmconfig: '~/.npmconfig', presets: ['nextjs'] });
    assume(results.npmconfig).includes('/.npmconfig');
    assume(path.isAbsolute(results.npmconfig)).true();
  });

  it('handles if npmconfig if not set', () => {
    results = makeCreateContext(argv, { presets: ['nextjs'] });
    assume(results.npmconfig).falsey();
  });

  it('sets cwd from process', () => {
    results = makeCreateContext(argv, flags);
    assume(results.cwd).equals(process.cwd());
  });

  it('sets dest from cwd and appName', () => {
    results = makeCreateContext(argv, flags);
    assume(results.dest).equals(path.join(process.cwd(), 'my-app'));
  });

  it('sets relDest as relative to cwd', () => {
    results = makeCreateContext(argv, flags);
    assume(results.relDest).equals('./my-app');
  });

  it('sets pkgLinks from flags', () => {
    results = makeCreateContext(argv, { 'npm-link': ['@gasket/jest', 'gasket-plugin-some-user'], 'presets': ['godady'] });
    assume(results.pkgLinks).eqls(['@gasket/jest', 'gasket-plugin-some-user']);
  });

  it('sets plugins short names from flags', () => {
    results =
      makeCreateContext(argv, {
        plugins: ['@gasket/jest@^1.2.3', 'gasket-plugin-some-user', '@gasket/plugin-intl'],
        presets: ['@gasket/nextjs']
      });
    assume(results.plugins).eqls(['@gasket/jest', 'some-user', '@gasket/intl']);
  });

  it('sets rawPlugins from flags', () => {
    results =
      makeCreateContext(argv, {
        plugins: ['@gasket/jest@^1.2.3', 'gasket-plugin-some-user', '@gasket/plugin-intl'],
        presets: ['@gasket/nextjs']
      });
    assume(results.rawPlugins).eqls(['@gasket/jest@^1.2.3', 'gasket-plugin-some-user', '@gasket/plugin-intl']);
  });

  it('detects whether the target directory exists', () => {
    results = makeCreateContext(argv, flags);
    assume(results.extant).eqls(false);
  });

  it('notes if creating in an extant directory', () => {
    results = makeCreateContext(['test'], flags);
    assume(results.extant).eqls(true);
  });

  it('adds arrays for report messaging', () => {
    results = makeCreateContext(argv, flags);
    assume(results.messages).an('array');
    assume(results.warnings).an('array');
    assume(results.errors).an('array');
    assume(results.nextSteps).an('array');
  });

  it('adds set for reporting generated files', () => {
    results = makeCreateContext(argv, flags);
    assume(results.generatedFiles).a('set');
  });

  it('doesnt throw if preset found', () => {
    let error;
    try {
      results = makeCreateContext(argv, flags);
    } catch (err) {
      error = err;
    }

    assume(error).to.be.falsey();
  });

  it('doesnt throw if preset path found', () => {
    let error;
    try {
      results = makeCreateContext(argv, { 'preset-path': ['somePath'] });
    } catch (err) {
      error = err;
    }

    assume(error).to.be.falsey();
  });

  it('assigns values from config-file flag to context', () => {
    flags = { 'config-file': '../../test/unit/commands/test-ci-config.json' };
    results = makeCreateContext(argv, flags);
    assume(results.testSuite).eqls('mocha');
    assume(results.description).eqls('A basic gasket app');
    assume(results.package).eqls('npm');
  });

  it('assigns values from config flag to context', () => {
    flags = { config: '{"description":"A test app","package":"npm","testSuite":"fake"}' };
    results = makeCreateContext(argv, flags);
    assume(results.testSuite).eqls('fake');
    assume(results.description).eqls('A test app');
    assume(results.package).eqls('npm');
  });

  it('sets prompts from flags', () => {
    results = makeCreateContext(argv, { prompts: false });
    assume(results.prompts).false();
  });

});
