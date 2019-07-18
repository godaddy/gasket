/* eslint-disable max-statements */

const path = require('path');
const assume = require('assume');
const {
  assumeGasketExec,
  dirs,
  vacuumApp
} = require('../../helpers');

const appName = 'cmds-app';
const appDir = path.join(dirs.create, appName);

describe('app commands', function () {
  // Create in CI might be quite slow – 5 minutes.
  this.timeout(60 * 1000 * 5);

  before(async function () {
    const gasketCreate = assumeGasketExec({
      setup: vacuumApp(appName),
      argv: ['create', appName, '--preset-path', path.join(dirs.packages, 'ci-basic-preset')],
      spawnWith: { cwd: dirs.create }
    });

    await gasketCreate();
  });

  after(vacuumApp(appName));

  let ctx, stdout;

  async function runCommand(cmd, ...args) {
    return await assumeGasketExec({
      argv: [cmd, ...args],
      spawnWith: {
        cwd: appDir,
        env: {
          ...process.env,
          NODE_PATH: path.join(appDir, 'node_modules')
        }
      }
    })();
  }

  async function runCommandNoModules(cmd, ...args) {
    return await assumeGasketExec({
      argv: [cmd, ...args],
      spawnWith: {
        cwd: appDir
      }
    })();
  }

  describe('build', () => {
    before(async function () {
      ctx = await runCommand('build');
      stdout = ctx.stdout;
    });

    it('should exit with zero exit code', () => {
      // Assert it exited with the proper code
      const { code } = ctx;
      assume(code).equals(0);
    });

    it('executes init lifecycle', () => {
      assume(stdout).includes('basic init');
    });

    it('does not execute configure lifecycle', () => {
      assume(stdout).not.includes('basic configure');
    });

    it('executes build lifecycle', () => {
      assume(stdout).includes('basic build');
    });

    it('should exit(1) modules do not resolve', async () => {
      const result = await runCommandNoModules('build');
      assume(result.code).equals(1);
    });
  });

  describe('start', () => {
    before(async function () {
      ctx = await runCommand('start');
      stdout = ctx.stdout;
    });

    it('should exit with zero exit code', () => {
      // Assert it exited with the proper code
      const { code } = ctx;
      assume(code).equals(0);
    });

    it('executes init lifecycle', () => {
      assume(stdout).includes('basic init');
    });

    it('executes configure lifecycle', () => {
      assume(stdout).includes('basic configure');
    });

    it('executes start lifecycle', () => {
      assume(stdout).includes('basic start');
    });

    it('defaults env to development', () => {
      assume(stdout).includes('env=development');
    });

    it('sets env from flag', async () => {
      const result = await runCommand('start', '--env', 'test');
      assume(result.stdout).includes('env=test');
    });

    it('should exit(1) modules do not resolve', async () => {
      const result = await runCommandNoModules('start');
      assume(result.code).equals(1);
    });
  });

  describe('local', () => {
    before(async function () {
      ctx = await runCommand('local');
      stdout = ctx.stdout;
    });

    it('should exit with zero exit code', () => {
      // Assert it exited with the proper code
      const { code } = ctx;
      assume(code).equals(0);
    });

    it('executes init lifecycle', () => {
      assume(stdout).includes('basic init command=local');
    });

    it('executes configure lifecycle', () => {
      assume(stdout).includes('basic configure command=local');
    });

    it('executes build lifecycle', () => {
      assume(stdout).includes('basic build command=local');
    });

    it('executes start lifecycle', () => {
      assume(stdout).includes('basic start command=local');
    });

    it('sets env to local', () => {
      assume(stdout).includes('env=local');
    });

    it('should exit(1) modules do not resolve', async () => {
      const result = await runCommandNoModules('local');
      assume(result.code).equals(1);
    });
  });
});
