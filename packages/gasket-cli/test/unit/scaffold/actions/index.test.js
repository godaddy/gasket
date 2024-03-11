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
      'printReport'
    ];

    expect(expected.every(k => k in actions)).toBeTruthy();
    expect(Object.keys(actions).length).toEqual(expected.length);
  });
});
