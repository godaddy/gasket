// const expect = require('expect');
const metadata = require('../lib/metadata');
const { defaultConfig } = require('../lib/configure');

describe('metadata', () => {
  const mockGasket = {
    config: {
      docs: {
        outputDir: '.my-docs'
      }
    }
  };

  const mockMeta = {
    bogus: true
  };

  it('returns object', () => {
    const results = metadata(mockGasket, mockMeta);
    expect(results).toBeInstanceOf(Object);
  });

  it('includes initial meta', () => {
    const results = metadata(mockGasket, mockMeta);
    expect(results).toHaveProperty('bogus', true);
  });

  it('includes commands', () => {
    const results = metadata(mockGasket, mockMeta);
    expect(results.commands).toHaveLength(1);
    expect(results.commands[0]).toHaveProperty('name', 'docs');
  });

  it('includes lifecycles', () => {
    const results = metadata(mockGasket, mockMeta);
    expect(results.lifecycles).toHaveLength(3);
    expect(results.lifecycles[0]).toHaveProperty('name', 'docsSetup');
    expect(results.lifecycles[0]).toHaveProperty('link');
    expect(results.lifecycles[0]).toHaveProperty('description');
    expect(results.lifecycles[0]).toHaveProperty('command');
    expect(results.lifecycles[1]).toHaveProperty('name', 'docsView');
    expect(results.lifecycles[1]).toHaveProperty('link');
    expect(results.lifecycles[1]).toHaveProperty('description');
    expect(results.lifecycles[1]).toHaveProperty('command');
    expect(results.lifecycles[2]).toHaveProperty('name', 'docsGenerate');
    expect(results.lifecycles[2]).toHaveProperty('link');
    expect(results.lifecycles[2]).toHaveProperty('description');
    expect(results.lifecycles[2]).toHaveProperty('command');
  });

  it('includes structures with configured outputDir', () => {
    const results = metadata(mockGasket, mockMeta);
    expect(results.structures).toHaveLength(1);
    expect(results.structures[0]).toHaveProperty('name', mockGasket.config.docs.outputDir + '/');
    expect(results.structures[0]).toHaveProperty('description');
  });

  it('falls back to defaults if not configured', () => {
    delete mockGasket.config.docs;
    const results = metadata(mockGasket, mockMeta);
    expect(results).toBeInstanceOf(Object);
    expect(results.structures[0]).toHaveProperty('name', defaultConfig.outputDir + '/');
  });
});
