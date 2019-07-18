/* eslint-disable max-statements */

const path = require('path');
const assume = require('assume');
const fs = require('fs');
const {
  assumeGasketExec,
  dirs,
  vacuumApp
} = require('../../helpers');

describe('gasket create', function () {
  // Create in CI might be quite slow – 5 minutes.
  this.timeout(60 * 1000 * 5);

  describe('without <appname>', () => {
    it('should exit(2)', assumeGasketExec({
      argv: ['create'],
      assert: ({ code }) => assume(code).equals(2)
    }));

    it('should output useful help', assumeGasketExec({
      argv: ['create'],
      assert: ({ stderr, stdout }) => {
        assume(stdout).equals('');
        assume(stderr).includes('Missing 1 required arg');
        assume(stderr).includes('appname');
      }
    }));
  });

  describe('gasket create myapp', () => {
    let ctx, stdout;

    before(async function idempotentCreate() {
      const gasketCreate = assumeGasketExec({
        setup: vacuumApp('myapp'),
        argv: ['create', 'myapp', '--preset-path', path.join(dirs.packages, 'ci-basic-preset')],
        spawnWith: { cwd: dirs.create }
      });

      ctx = await gasketCreate();
      stdout = ctx.stdout;
    });

    after(vacuumApp('myapp'));

    it('should exit with zero exit code', () => {
      // Assert it exited with the proper code
      const { code } = ctx;
      assume(code).equals(0);
    });

    it('installs node modules', () => {
      const filePath = path.join(dirs.create, 'myapp', 'node_modules');
      // eslint-disable-next-line no-sync
      assume(fs.existsSync(filePath)).equals(true);
    });

    describe('stdout', () => {

      it('outputs expected files', () => {
        const expectedFiles = [
          'gasket.config.js',
          'package.json',
          '.gitattributes',
          '.gitignore',
          'README.md',
          'styles/app.css'
        ];
        for (const text of expectedFiles) {
          assume(stdout).includes(text, `stdout for "gasket create" missing: ${text}`);
        }
      });

      it('outputs expected prompts', () => {
        const expected = [
          'What is your app description',
          'Which packager would you like to use',
          'Do you want a git repo to be initialized',
          'Choose your unit test suite'
        ];
        for (const text of expected) {
          assume(stdout).includes(text, `stdout for "gasket create" missing: ${text}`);
        }
      });

      it('outputs report', () => {
        const expected = [
          'Finished with 0 warnings and 0 errors',
          'App Name',
          'Output',
          'Generated Files'
        ];
        for (const text of expected) {
          assume(stdout).includes(text, `stdout for "gasket create" missing: ${text}`);
        }
      });

      it('all expected files are written', () => {
        const re = /Generated Files\n((.+\n)+)/;
        const expected = stdout.match(re)[1].split('\n').map(l => l.trim());
        for (const file of expected) {
          const filePath = path.join(dirs.create, 'myapp', file);
          // eslint-disable-next-line no-sync
          assume(fs.existsSync(filePath)).equals(true);
        }
      });
    });

    describe('package.json', () => {
      let pkg;

      before(() => {
        pkg = require(path.join(dirs.create, 'myapp', 'package.json'));
      });

      it('is a valid object', () => {
        // Assert we got a valid package.json
        assume(pkg).is.an('object');
      });

      it('has name and description', () => {
        assume(pkg).property('name', 'myapp');
        assume(pkg).property('description', 'A basic gasket app');
      });

      it('has expected dependencies', () => {
        assume(pkg).property('dependencies');
        assume(pkg.dependencies).property('@gasket/ci-basic-preset');
        assume(pkg.dependencies).property('@gasket/cli');
        assume(pkg.dependencies).property('left-pad');
      });

      it('has expected devDependencies', () => {
        assume(pkg).property('devDependencies');
        assume(pkg.devDependencies).property('right-pad');
      });

      it('has expected scripts', () => {
        assume(pkg).property('scripts');
        assume(pkg.scripts).property('ping', 'echo pong');
      });
    });

    describe('postCreate', () => {

      it('lifecycle is executed', () => {
        assume(stdout).includes('basic postCreate');
      });

      it('scripts can be run', () => {
        assume(stdout).includes('ping');
        assume(stdout).includes('pong');
      });
    });
  });

  describe('with plugins', () => {
    let ctx, stdout, pkg, gasketCfg;

    before(async function () {
      const gasketCreate = assumeGasketExec({
        setup: vacuumApp('with-plugins'),
        argv: ['create', 'with-plugins',
          '--preset-path', path.join(dirs.packages, 'ci-basic-preset'),
          '--plugins', `@gasket/ci-add-plugin@file:${path.join(dirs.packages, 'ci-add-plugin')}`
        ],
        spawnWith: { cwd: dirs.create }
      });

      ctx = await gasketCreate();
      stdout = ctx.stdout;

      if (ctx.code) {
        throw new Error(ctx.stderr);
      }

      pkg = require(path.join(dirs.create, 'with-plugins', 'package.json'));
      gasketCfg = require(path.join(dirs.create, 'with-plugins', 'gasket.config'));
    });

    describe('from flags', () => {

      it('added to package.json dependencies', () => {
        assume(pkg.dependencies).property('@gasket/ci-add-plugin');
      });

      it('added to gasket.config.js plugins', () => {
        assume(gasketCfg.plugins).is.an('object');
        assume(gasketCfg.plugins.add).to.include('ci-add');
      });
    });

    describe('added by prompt', () => {

      it('have prompt lifecycle executed', () => {
        assume(stdout).includes('extra prompt');
      });

      it('added to package.json dependencies', () => {
        assume(pkg.dependencies).property('@gasket/ci-extra-plugin');
      });

      it('added to gasket.config.js plugins', () => {
        assume(gasketCfg.plugins).is.an('object');
        assume(gasketCfg.plugins.add).to.include('ci-extra');
      });
    });

    after(vacuumApp('with-plugins'));
  });
});
