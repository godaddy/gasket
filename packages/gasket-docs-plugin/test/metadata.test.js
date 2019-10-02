const assume = require('assume');
const metadata = require('../lib/metadata');

describe('metadata', () => {
  const mockGasket = {
    config: {
      docs: {
        outputDir: '.docs'
      }
    }
  };

  const mockMeta = {
    bogus: true
  };

  it('returns object', () => {
    const results = metadata(mockGasket, mockMeta);
    assume(results).is.an('object');
  });

  it('includes initial meta', () => {
    const results = metadata(mockGasket, mockMeta);
    assume(results).property('bogus', true);
  });

  it('includes commands', () => {
    const results = metadata(mockGasket, mockMeta);
    assume(results.commands).lengthOf(1);
    assume(results.commands[0]).property('name', 'docs');
  });

  it('includes lifecycles', () => {
    const results = metadata(mockGasket, mockMeta);
    assume(results.lifecycles).lengthOf(2);
    assume(results.lifecycles[0]).property('name', 'docsSetup');
    assume(results.lifecycles[0]).property('link');
    assume(results.lifecycles[0]).property('description');
    assume(results.lifecycles[0]).property('command');
    assume(results.lifecycles[1]).property('name', 'docsView');
    assume(results.lifecycles[1]).property('link');
    assume(results.lifecycles[1]).property('description');
    assume(results.lifecycles[1]).property('command');
  });

  it('includes structures with configured outputDir', () => {
    const results = metadata(mockGasket, mockMeta);
    assume(results.structures).lengthOf(1);
    assume(results.structures[0]).property('name', mockGasket.config.docs.outputDir);
    assume(results.structures[0]).property('description');
  });
});
