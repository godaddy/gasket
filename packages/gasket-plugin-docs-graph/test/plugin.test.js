const path = require('path');
const read = require('util').promisify(require('fs').readFile);
const plugin = require('../');
const hook = plugin.hooks.docsGenerate;
const assume = require('assume');

describe('docs graph plugin', function () {
  let docsConfigSet;
  beforeEach(function () {
    docsConfigSet = {
      docsRoot: path.join(__dirname, 'fixtures'),
      lifecycles: []
    };
  })
  it('is named properly', function () {
    assume(plugin.name).equals('docs-graph');
  });

  it('hooks the docGraphs lifecycle', function () {
    assume(hook).is.an('asyncfunction');
  });

  it('provides proper metadata', async function () {
    const data = await hook({}, docsConfigSet);
    assume(data.name).equals('Lifecycle Flowchart');
    assume(data.description).equals('A flowchart detailing how lifecyles are interrelated.');
    assume(data.link).equals('/mermaid.md');
    assume(data.targetRoot).equals(path.join(__dirname, 'fixtures', 'generated-docs'));
  });

  it('provides a mermaid markdown block', async function () {
    const { targetRoot, link } = await hook({}, docsConfigSet);
    const content = await read(path.join(targetRoot, link));
    assume(content).startWith('```mermaid\n');
    assume(content).endsWith('\n```');
  });

  it('provides a left to right mermaid graph', async function () {
    const { targetRoot, link } = await hook({}, docsConfigSet);
    const content = await read(path.join(targetRoot, link));
    assume(content).matches(/graph LR;/);
  });

  it('uses the correct arrows depending on lifecycle method', async function () {
    docsConfigSet.lifecycles = [{
      parent: 'snap',
      name: 'crackle'
    }, {
      parent: 'crackle',
      name: 'pop',
      method: 'exec'
    }];

    const { targetRoot, link } = await hook({}, docsConfigSet);
    const content = await read(path.join(targetRoot, link));

    assume(content).matches('snap --> crackle;');
    assume(content).matches('crackle -- exec --> pop;');
  });

  it.skip('generates the LHS of the arrows from the correct attribute', async function () {
    docsConfigSet.lifecycles = [{
      name: 'Anakin',
      parent: 'Shmi',
      after: '',
      command: 'bring balance to the Force',
      from: 'Tatooine'
    }]

    const { targetRoot, link } = await hook({}, docsConfigSet);
    const content = await read(path.join(targetRoot, link));
  });
});
