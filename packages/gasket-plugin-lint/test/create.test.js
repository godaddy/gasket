const mockMakeGatherDevDeps = jest.fn().mockImplementation(() => jest.fn());
const mockMakeRunScriptStr = jest.fn().mockImplementation(() => jest.fn());

const mockCodeStyles = {
  godaddy: { create: jest.fn() },
  standard: { create: jest.fn() },
  airbnb: { create: jest.fn() },
  none: { create: jest.fn() },
  common: { create: jest.fn() }
};

jest.mock('../lib/utils', () => {
  const mod = jest.requireActual('../lib/utils');

  return {
    ...mod,
    makeGatherDevDeps: mockMakeGatherDevDeps,
    makeRunScriptStr: mockMakeRunScriptStr
  };
});

jest.mock('../lib/code-styles', () => mockCodeStyles);

const createHook = require('../lib').hooks.create;
const createHookHandler = createHook.handler;

describe('create hook', function () {
  let gasket, context;

  beforeEach(() => {
    jest.clearAllMocks();
    gasket = {};
    context = { codeStyle: 'godaddy' };
  });

  it('has timing of last', () => {
    expect(createHook.timing).toHaveProperty('last', true);
  });

  it('makes a gatherDevDeps function for utils', async () => {
    await createHookHandler(gasket, context);
    expect(mockMakeGatherDevDeps).toHaveBeenCalled();
  });

  it('makes a runScriptStr function for utils', async () => {
    await createHookHandler(gasket, context);
    expect(mockMakeRunScriptStr).toHaveBeenCalled();
  });

  it('executes create for selected code style', async () => {
    await createHookHandler(gasket, context);
    expect(mockCodeStyles.godaddy.create).toHaveBeenCalled();
  });

  it('always executes create for common code style', async () => {
    await createHookHandler(gasket, context);
    await createHookHandler(gasket, { codeStyle: 'standard' });
    expect(mockCodeStyles.godaddy.create).toHaveBeenCalledTimes(1);
    expect(mockCodeStyles.standard.create).toHaveBeenCalledTimes(1);
    expect(mockCodeStyles.common.create).toHaveBeenCalledTimes(2);
  });

  it('does nothing if selected code style is none', async () => {
    await createHookHandler(gasket, { codeStyle: 'none' });
    expect(mockCodeStyles.common.create).not.toHaveBeenCalled();
  });

  it('does nothing if codeStyle or eslintConfig are not set', async () => {
    await createHookHandler(gasket, {});
    expect(mockCodeStyles.common.create).not.toHaveBeenCalled();
  });

  it('throws error if makeGatherDevDeps fails', async () => {
    mockMakeGatherDevDeps.mockImplementation(() => {
      throw new Error('Failed to create gatherDevDeps');
    });

    await expect(createHookHandler(gasket, context)).rejects.toThrow(
      'Failed to create gatherDevDeps'
    );
  });
});
