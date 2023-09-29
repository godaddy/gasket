const path = require('path');
const { readFile: read } = require('fs').promises;
const plugin = require('../lib/plugin');

const hook = plugin.hooks.docsGenerate;

describe('docs graph plugin', () => {
  let docsConfigSet;
  beforeEach(() => {
    docsConfigSet = {
      docsRoot: path.join(__dirname, 'fixtures'),
      lifecycles: []
    };
  });
  it('is named properly', () => {
    expect(plugin.name).toMatch('@gasket/plugin-docs-graphs');
  });

  it('hooks the docsGenerate lifecycle', () => {
    expect(hook).toEqual(expect.any(Function));
  });

  it('provides proper metadata', async () => {
    const data = await hook({}, docsConfigSet);
    expect(data.name).toEqual('Lifecycle Flowchart');
    expect(data.description).toEqual(
      'A flowchart detailing how lifecycles are interrelated.'
    );
    expect(data.link).toEqual('/lifecycle-graphs.md');
    expect(data.targetRoot).toEqual(
      path.join(__dirname, 'fixtures', 'generated-docs')
    );
  });

  it('provides a mermaid markdown block', async () => {
    const { targetRoot, link } = await hook({}, docsConfigSet);
    const content = await read(path.join(targetRoot, link), 'utf-8');
    expect(content).toMatch(/^```mermaid\n/);
    expect(content).toMatch(/\n```$/);
  });

  it('provides a left to right mermaid graph', async () => {
    const { targetRoot, link } = await hook({}, docsConfigSet);
    const content = await read(path.join(targetRoot, link), 'utf-8');
    expect(content).toMatch(/graph LR;/);
  });

  it('uses the correct arrows depending on lifecycle method', async () => {
    docsConfigSet.lifecycles = [
      {
        parent: 'snap',
        name: 'crackle'
      },
      {
        parent: 'crackle',
        name: 'pop',
        method: 'exec'
      }
    ];

    const { targetRoot, link } = await hook({}, docsConfigSet);
    const content = await read(path.join(targetRoot, link), 'utf-8');

    expect(content).toMatch('snap --> crackle;');
    expect(content).toMatch('crackle -- exec --> pop;');
  });

  it('supports deprecated lifecycles', async () => {
    docsConfigSet.lifecycles = [
      {
        parent: 'snap',
        name: 'crackle'
      },
      {
        parent: 'crackle',
        name: 'pop',
        deprecated: true,
        method: 'exec'
      }
    ];

    const { targetRoot, link } = await hook({}, docsConfigSet);
    const content = await read(path.join(targetRoot, link), 'utf-8');

    expect(content).toContain('snap --> crackle;');
    expect(content).toContain('crackle -- exec --> pop["pop (deprecated)"];');
  });

  it('generates the LHS of the arrows from the correct attribute', async () => {
    const lc = (docsConfigSet.lifecycles = [
      {
        name: 'Anakin',
        parent: 'Shmi',
        after: 'Midichlorian intervention',
        command: 'Bring balance to the Force',
        from: 'Tatooine'
      },
      {
        name: 'Aang',
        after: 'The Fire nation attacked',
        command: 'Bring balance to the world',
        from: 'Southern Air Temple'
      },
      {
        name: 'Frodo',
        command: 'Destroy the one ring',
        from: 'The Shire'
      },
      {
        name: 'Paul',
        from: 'Caladan'
      }
    ]);

    const { targetRoot, link } = await hook({}, docsConfigSet);
    const content = await read(path.join(targetRoot, link), 'utf8');

    expect(content).toMatch(`${lc[0].parent} --> ${lc[0].name}`);
    expect(content).toMatch(`${lc[1].after} --> ${lc[1].name}`);
    const cmd = lc[2].command;
    expect(content).toContain(`${cmd}-cmd(${cmd}) --> ${lc[2].name}`);
    expect(content).toMatch(`${lc[3].from} --> ${lc[3].name}`);
  });

  it('adds styling tags if using a command as a source', async () => {
    docsConfigSet.lifecycles = [
      {
        name: 'Zhu Li',
        command: 'Do the thing'
      }
    ];

    const { targetRoot, link } = await hook({}, docsConfigSet);
    const content = await read(path.join(targetRoot, link), 'utf8');

    expect(content).toContain('style Do the thing-cmd fill: red;');
  });
});
