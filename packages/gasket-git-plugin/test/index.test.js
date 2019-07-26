const { describe, it } = require('mocha');
const assume = require('assume');
const plugin = require('../lib');

describe('plugin', () => {

  it('is an object', () => {
    assume(plugin).is.an('object');
  });

  it('has expected name', () => {
    assume(plugin).to.have.property('name', 'git');
  });

  it('has expected hooks', () => {
    const expected = [
      'prompt',
      'create',
      'postCreate'
    ];

    assume(plugin).to.have.property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).is.length(expected.length);
  });
});
