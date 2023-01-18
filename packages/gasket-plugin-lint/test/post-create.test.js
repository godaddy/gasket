const mockMakerStub = jest.fn().mockImplementation((_, script) => script);

jest.mock('../lib/utils', () => ({
  makeSafeRunScript: mockMakerStub
}));

const postCreateHook = require('../lib').hooks.postCreate;

describe('postCreate hook', function () {
  let gasket, context, runScript;

  beforeEach(() => {
    gasket = {};
    context = {};
    runScript = jest.fn();
  });

  it('makes a safeRunScript function', async () => {
    await postCreateHook(gasket, context, { runScript });
    expect(mockMakerStub).toHaveBeenCalledWith(context, runScript);
  });

  it('safely attempts to run `lint:fix`', async () => {
    await postCreateHook(gasket, context, { runScript });
    expect(runScript).toHaveBeenCalledWith('lint:fix');
  });

  it('safely attempts to run `stylelint:fix`', async () => {
    await postCreateHook(gasket, context, { runScript });
    expect(runScript).toHaveBeenCalledWith('stylelint:fix');
  });
});
