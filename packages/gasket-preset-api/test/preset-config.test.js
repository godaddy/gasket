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
      expect.objectContaining({ name: '@gasket/plugin-https' }),
      expect.objectContaining({ name: '@gasket/plugin-winston' })
    ];
    expect(config.plugins).toEqual(expect.arrayContaining(expected));
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

  describe('adds server framework plugin', () => {
    it('express', async () => {
      mockContext.server = 'express';
      const config = await presetConfig({}, mockContext);
      expect(config.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: '@gasket/plugin-express' })
        ])
      );
    });

    it('fastify', async () => {
      mockContext.server = 'fastify';
      const config = await presetConfig({}, mockContext);
      expect(config.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: '@gasket/plugin-fastify' })
        ])
      );
    });
  });
});
