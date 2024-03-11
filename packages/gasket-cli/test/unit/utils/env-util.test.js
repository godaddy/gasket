const { parseEnvOption, handleEnvVars } = require('../../../src/utils/env-util');

describe('env-util', () => {

  describe('parseEnvOption', () => {
    it('parses env option with equal sign', () => {
      const argv = ['--env=prod'];
      const result = parseEnvOption(argv);
      expect(result).toEqual('prod');
    });

    it('parses env option without equal sign', () => {
      const argv = ['--env', 'prod'];
      const result = parseEnvOption(argv);
      expect(result).toEqual('prod');
    });
  });

  describe('handleEnvVars', () => {
    it('sets environment variables', () => {
      handleEnvVars({ env: 'prod', root: 'root', id: 'id', gasketConfig: 'gasket.config' });
      expect(process.env.GASKET_ENV).toEqual('prod');
      expect(process.env.GASKET_CONFIG).toEqual('gasket.config');
      expect(process.env.GASKET_ROOT).toEqual('root');
      expect(process.env.GASKET_COMMAND).toEqual('id');
    });

    it('does not override existing environment variables', () => {
      process.env.GASKET_ENV = 'local';
      handleEnvVars({ env: 'prod', root: 'root', id: 'id', gasketConfig: 'gasket.config' });
      expect(process.env.GASKET_ENV).toEqual('local');
    });
  });
});
