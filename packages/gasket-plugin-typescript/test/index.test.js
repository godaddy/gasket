const plugin = require('../lib/index');
const {
  name,
  version,
  description
} = require('../package.json');

describe('gasket-plugin-typescript', () => {

  describe('plugin', () => {
    it('should be an object', () => {
      expect(plugin).toBeInstanceOf(Object);
    });

    it('should have expected properties', () => {
      expect(plugin).toHaveProperty('name', name);
      expect(plugin).toHaveProperty('version', version);
      expect(plugin).toHaveProperty('description', description);
    });

    it('should have hooks', () => {
      expect(plugin).toHaveProperty('hooks');
      expect(plugin.hooks).toBeInstanceOf(Object);
    });

    it('should have no hooks', () => {
      expect(Object.keys(plugin.hooks)).toHaveLength(0);
    });
  });
});
