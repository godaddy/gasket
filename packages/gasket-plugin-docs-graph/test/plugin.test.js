const plugin = require('../');
const hook = plugin.hooks.docsGenerate;
const assume = require('assume');

describe('docs graph plugin', function () {
  it('is named properly', function () {
    assume(plugin.name).equals('docs-graph');
  });

  it('hooks the docGraphs lifecycle', function () {
    assume(hook).is.an('asyncfunction');
  });

  it.skip('provides names the graph properly', function () {
    const { name } = hook({}, { lifecycles: [] });
    assume(name).equals('Lifecycles');
  });

  it.skip('provides a mermaid markdown block', function () {
    const { content } = hook({}, { lifecycles: [] });
    assume(content).startWith('```mermaid\n');
    assume(content).endsWith('\n```');
  });

  it.skip('provides a left to right mermaid graph', function () {
    const { content } = hook({}, { lifecycles: [] });
    assume(content).matches(/graph LR;/);
  });

  it.skip('uses the correct arrows depending on lifecycle method', function () {
    const { content } = hook({}, {
      lifecycles: [{
        parent: 'snap',
        name: 'crackle'
      }, {
        parent: 'crackle',
        name: 'pop',
        method: 'exec'
      }]
    });

    assume(content).contains('snap --> crackle;');
    assume(content).contains('crackle -- exec --> pop;');
  });

  it.skip('generates the LHS of the arrows from the correct attribute', function () {
    const { content } = hook({}, {
      lifecycles: [{
        name: 'Anakin',
        parent: 'Shmi',
        after: '',
        command: 'bring balance to the Force',
        from: 'Tatooine'
      }]
    });
  });
});
