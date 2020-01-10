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
  });
  it('is named properly', function () {
    assume(plugin.name).matches('@gasket/plugin-docs-graphs');
  });

  it('hooks the docsGenerate lifecycle', function () {
    assume(hook).is.an('asyncfunction');
  });

  it('provides proper metadata', async function () {
    const data = await hook({}, docsConfigSet);
    assume(data.name).equals('Lifecycle Flowchart');
    assume(data.description).equals('A flowchart detailing how lifecycles are interrelated.');
    assume(data.link).equals('/lifecycle-graphs.md');
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

  it('generates the LHS of the arrows from the correct attribute', async function () {
    const lc = docsConfigSet.lifecycles = [{
      name: 'Anakin',
      parent: 'Shmi',
      after: 'Midichlorian intervention',
      command: 'Bring balance to the Force',
      from: 'Tatooine'
    }, {
      name: 'Aang',
      after: 'The Fire nation attacked',
      command: 'Bring balance to the world',
      from: 'Southern Air Temple'
    }, {
      name: 'Frodo',
      command: 'Destroy the one ring',
      from: 'The Shire'
    }, {
      name: 'Paul',
      from: 'Caladan'
    }];

    const { targetRoot, link } = await hook({}, docsConfigSet);
    const content = await read(path.join(targetRoot, link), 'utf8');

    assume(content).matches(lc[0].parent + ' --> ' + lc[0].name);
    assume(content).matches(lc[1].after + ' --> ' + lc[1].name);
    const cmd = lc[2].command;
    assume(content).contains(`${cmd}-cmd(${cmd}) --> ${lc[2].name}`);
    assume(content).matches(lc[3].from + ' --> ' + lc[3].name);
  });

  it('adds styling tags if using a command as a source', async function () {
    docsConfigSet.lifecycles = [{
      name: 'Zhu Li',
      command: 'Do the thing'
    }];

    const { targetRoot, link } = await hook({}, docsConfigSet);
    const content = await read(path.join(targetRoot, link), 'utf8');

    assume(content).contains('style Do the thing-cmd fill: red;');
  });
});
