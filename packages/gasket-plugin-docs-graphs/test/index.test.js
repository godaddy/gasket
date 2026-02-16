import { describe, it, expect, beforeEach } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFile as read } from 'fs/promises';
import { createRequire } from 'node:module';
import plugin from '../lib/index.js';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

const hook = plugin.hooks.docsGenerate;

describe('docs graph plugin', function () {
  let mockGasket, docsConfigSet;
  beforeEach(function () {
    docsConfigSet = {
      docsRoot: path.join(dirName, 'fixtures'),
      lifecycles: []
    };
    mockGasket = {
      config: {}
    };
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
  });

  it('hooks the docsGenerate lifecycle', function () {
    expect(hook).toEqual(expect.any(Function));
  });

  it('provides proper metadata', async function () {
    const data = await hook(mockGasket, docsConfigSet);
    expect(data.name).toEqual('Lifecycle Flowchart');
    expect(data.description).toEqual('A flowchart detailing how lifecycles are interrelated.');
    expect(data.link).toEqual('/lifecycle-graphs.md');
    expect(data.targetRoot).toEqual(path.join(dirName, 'fixtures', 'generated-docs'));
  });

  it('provides a mermaid markdown block', async function () {
    const { targetRoot, link } = await hook(mockGasket, docsConfigSet);
    const content = await read(path.join(targetRoot, link), 'utf-8');
    expect(content).toMatch(/^```mermaid\n/);
    expect(content).toMatch(/\n```$/);
  });

  it('provides a left to right mermaid graph', async function () {
    const { targetRoot, link } = await hook(mockGasket, docsConfigSet);
    const content = await read(path.join(targetRoot, link), 'utf-8');
    expect(content).toMatch(/graph LR;/);
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

    const { targetRoot, link } = await hook(mockGasket, docsConfigSet);
    const content = await read(path.join(targetRoot, link), 'utf-8');

    expect(content).toMatch('snap --> crackle;');
    expect(content).toMatch('crackle -- exec --> pop;');
  });

  it('supports deprecated lifecycles', async function () {
    docsConfigSet.lifecycles = [{
      parent: 'snap',
      name: 'crackle'
    }, {
      parent: 'crackle',
      name: 'pop',
      deprecated: true,
      method: 'exec'
    }];

    const { targetRoot, link } = await hook(mockGasket, docsConfigSet);
    const content = await read(path.join(targetRoot, link), 'utf-8');

    expect(content).toContain('snap --> crackle;');
    expect(content).toContain('crackle -- exec --> pop["pop (deprecated)"];');
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

    const { targetRoot, link } = await hook(mockGasket, docsConfigSet);
    const content = await read(path.join(targetRoot, link), 'utf8');

    expect(content).toMatch(lc[0].parent + ' --> ' + lc[0].name);
    expect(content).toMatch(lc[1].after + ' --> ' + lc[1].name);
    const cmd = lc[2].command;
    expect(content).toContain(`${cmd}-cmd(${cmd}) --> ${lc[2].name}`);
    expect(content).toMatch(lc[3].from + ' --> ' + lc[3].name);
  });

  it('adds styling tags if using a command as a source', async function () {
    docsConfigSet.lifecycles = [{
      name: 'Zhu Li',
      command: 'Do the thing'
    }];

    const { targetRoot, link } = await hook(mockGasket, docsConfigSet);
    const content = await read(path.join(targetRoot, link), 'utf8');

    expect(content).toContain('style Do the thing-cmd fill: red;');
  });

  it('does not generate graphs if docs.graphs is false', async function () {
    mockGasket.config.docs = { graphs: false };
    const results = await hook(mockGasket, docsConfigSet);
    expect(results).toBeUndefined();
  });
});
