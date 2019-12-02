const assume = require('assume');
const configure = require('../lib/configure');

describe('configure', () => {
  const mockGasket = {
    config: {}
  };

  it('returns object', () => {
    const results = configure(mockGasket);
    assume(results).is.an('object');
  });

  it('adds docs to config', () => {
    const results = configure(mockGasket);
    assume(results).property('docs');
  });

  it('merges user config with defaults', () => {
    const results = configure(mockGasket, { docs: { user: 'stuff' } });
    assume(results.docs).eqls({
      user: 'stuff',
      outputDir: '.docs'
    });
  });

  it('user config overrides defaults', () => {
    const results = configure(mockGasket, { docs: { user: 'stuff', outputDir: 'custom' } });
    assume(results.docs).eqls({
      user: 'stuff',
      outputDir: 'custom'
    });
  });
});
