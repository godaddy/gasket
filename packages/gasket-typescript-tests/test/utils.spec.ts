import { applyConfigOverrides, runShellCommand, tryRequire } from '@gasket/utils';
import { GasketConfig } from '@gasket/engine';

describe('@gasket/utils', function () {
  const perform = false;

  describe('applyConfigOverrides', function () {
    const config: GasketConfig = { root: '/', env: 'debug' };

    it('has expected API', function () {
      if (perform) {
        let result:GasketConfig;
        result = applyConfigOverrides(config, { env: 'test' });
        result = applyConfigOverrides(config, { env: 'test', root: '/', commandId: 'test' });
        result = applyConfigOverrides(config, { env: 'test', localFile: 'local.config.js' });

        // @ts-expect-error
        result = applyConfigOverrides(config, { env: 'test', bogus: true });
        // @ts-expect-error
        result = applyConfigOverrides(config, {});
      }
    });
  });

  describe('runShellCommand', function () {
    it('has expected API', function () {
      if (perform) {
        let results: Promise<{ stdout: string }>;
        results = runShellCommand('cmd');
        results = runShellCommand('cmd', ['--flag']);
        results = runShellCommand('cmd', [], { signal: new AbortController().signal });
      }
    });
  });

  describe('tryRequire', function () {
    it('has expected API', function () {
      if (perform) {
        const results: object | null = tryRequire('path/to/module');
      }
    });
  });
});
