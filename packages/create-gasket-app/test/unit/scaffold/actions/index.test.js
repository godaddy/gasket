describe('index', () => {
  it('exports expected actions', async () => {
    const actions = (await import('../../../../lib/scaffold/actions/index.js'));

    const expected = [
      'mkDir',
      'loadPreset',
      'globalPrompts',
      'setupPkg',
      'writePkg',
      'installModules',
      'linkModules',
      'writeGasketConfig',
      'presetPromptHooks',
      'presetConfigHooks',
      'promptHooks',
      'createHooks',
      'postCreateHooks',
      'generateFiles',
      'printReport'
    ];

    expect(expected.every(k => k in actions)).toBeTruthy();
    expect(Object.keys(actions).length).toEqual(expected.length);
  });
});
