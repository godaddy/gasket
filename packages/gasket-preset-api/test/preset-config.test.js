import preset from '../lib/index.js';

describe('presetConfig', () => {
  let mockContext, presetConfig;

  beforeEach(() => {
    mockContext = {};
    presetConfig = preset.hooks.presetConfig;
  });

  it('is an async function', () => {
    expect(typeof presetConfig).toBe('function');
    expect(presetConfig.constructor.name).toBe('AsyncFunction');
  });

  it('returns an object', async () => {
    const config = await presetConfig({}, mockContext);
    expect(typeof config).toBe('object');
  });

  it('has plugins', async () => {
    const config = await presetConfig({}, mockContext);
    expect(config).toHaveProperty('plugins');
    expect(config.plugins).toBeInstanceOf(Array);
  });

  it('has expected plugins in order', async () => {
    const config = await presetConfig({}, mockContext);
    const expected = [
      expect.objectContaining({ name: '@gasket/plugin-express' }),
      expect.objectContaining({ name: '@gasket/plugin-https' }),
      expect.objectContaining({ name: '@gasket/plugin-docs' }),
      expect.objectContaining({ name: '@gasket/plugin-docusaurus' }),
      expect.objectContaining({ name: '@gasket/plugin-response-data' }),
      expect.objectContaining({ name: '@gasket/plugin-winston' }),
      expect.objectContaining({ name: '@gasket/plugin-swagger' }),
      expect.objectContaining({ name: '@gasket/plugin-lint' })
    ];
    expect(config.plugins).toEqual(expected);
  });

  it('adds test plugin when provided', async () => {
    mockContext.testPlugins = ['@gasket/plugin-jest'];
    const config = await presetConfig({}, mockContext);
    expect(config.plugins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: '@gasket/plugin-jest' })
      ])
    );
  });

  it('adds typescript plugin when provided', async () => {
    mockContext.typescript = true;
    const config = await presetConfig({}, mockContext);
    expect(config.plugins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: '@gasket/plugin-typescript' })
      ])
    );
  });
});
