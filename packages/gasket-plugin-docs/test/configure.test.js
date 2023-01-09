const configure = require('../lib/configure');

describe('configure', () => {
  const mockGasket = {
    config: {}
  };

  it('returns object', () => {
    const results = configure(mockGasket);
    expect(results).toBeInstanceOf(Object);
  });

  it('adds docs to config', () => {
    const results = configure(mockGasket);
    expect(results).toHaveProperty('docs');
  });

  it('merges user config with defaults', () => {
    const results = configure(mockGasket, { docs: { user: 'stuff' } });
    expect(results.docs).toEqual({
      user: 'stuff',
      outputDir: '.docs'
    });
  });

  it('user config overrides defaults', () => {
    const results = configure(mockGasket, { docs: { user: 'stuff', outputDir: 'custom' } });
    expect(results.docs).toEqual({
      user: 'stuff',
      outputDir: 'custom'
    });
  });
});
