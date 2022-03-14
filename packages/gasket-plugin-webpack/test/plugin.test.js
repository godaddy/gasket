const { stub } = require('sinon');
const assume = require('assume');
const plugin = require('../lib/index');
const { devDependencies } = require('../package');

describe('Plugin', () => {

  it('is an object', () => {
    assume(plugin).is.an('object');
  });

  it('has expected name', () => {
    assume(plugin).to.have.property('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'metadata'
    ];

    assume(plugin).to.have.property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).is.length(expected.length);
  });
});

describe('create hook', () => {
  let mockContext;
  beforeEach(() => {

    mockContext = {
      pkg: {
        add: stub(),
        has: stub()
      }
    };
  });

  it('adds appropriate devDependencies', async function () {
    await plugin.hooks.create({}, mockContext);

    assume(mockContext.pkg.add).calledWith('devDependencies', {
      webpack: devDependencies.webpack
    });
  });
});
