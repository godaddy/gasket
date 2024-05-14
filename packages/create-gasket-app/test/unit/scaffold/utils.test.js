import { readConfig } from '../../../lib/scaffold/utils.js';

describe('Utils', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {};
  });

  afterEach(() => {
  });

  describe('readConfig', () => {
    it('adds values from config JSON string to context', () => {
      const flags = { config: '{"appDescription":"A test app","packageManager":"npm","unitTestSuite":"fake"}' };
      readConfig(mockContext, flags);
      expect(mockContext.unitTestSuite).toEqual('fake');
      expect(mockContext.appDescription).toEqual('A test app');
      expect(mockContext.packageManager).toEqual('npm');
    });

    it('adds values from configFile to context', () => {
      mockContext.cwd = './test/unit/commands';
      const flags = { configFile: './test-ci-config.json' };
      readConfig(mockContext, flags);
      expect(mockContext.unitTestSuite).toEqual('jest');
      expect(mockContext.appDescription).toEqual('A basic gasket app');
      expect(mockContext.packageManager).toEqual('npm');
    });
    it('does not add to context if no configFile/config flag', () => {
      readConfig(mockContext, {});
      expect(mockContext).toEqual({});
    });
  });
});
