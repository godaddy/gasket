const assume = require('assume');

describe('index', () => {
  it('exports expected actions', () => {
    const actions = require('../../../../src/scaffold/actions');

    const expected = [
      'mkDir',
      'loadPreset',
      'cliVersion',
      'globalPrompts',
      'setupPkg',
      'writePkg',
      'installModules',
      'linkModules',
      'writeGasketConfig',
      'loadPkgForDebug',
      'promptHooks',
      'createHooks',
      'postCreateHooks',
      'generateFiles',
      'applyPresetConfig',
      'printReport',
    ];

    assume(expected.every(k => k in actions)).is.true();
    assume(Object.keys(actions).length).equals(expected.length);
  });
});
