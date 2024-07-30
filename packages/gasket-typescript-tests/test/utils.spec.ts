import { applyConfigOverrides, runShellCommand } from '@gasket/utils';
import { GasketConfig, GasketConfigDefinition } from '@gasket/core';

describe('@gasket/utils', function () {
  const perform = false;

  describe('applyConfigOverrides', function () {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example', version: '', description: '', hooks: {} }],
      root: '/',
      env: 'debug'
    };

    it('has expected API', function () {
      if (perform) {
        let result:GasketConfig;
        result = applyConfigOverrides(config, { env: 'test' });
        result = applyConfigOverrides(config, { env: 'test', commandId: 'test' });

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
});
