const mockMakeGatherDevDeps = jest.fn().mockImplementation(() => jest.fn());
const mockMakeRunScriptStr = jest.fn().mockImplementation(() => jest.fn());
const mockCodeStyles = {
  godaddy: { create: jest.fn() },
  standard: { create: jest.fn() },
  airbnb: { create: jest.fn() },
  other: { create: jest.fn() },
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
    expect(mockMakeGatherDevDeps).toHaveBeenCalledWith(context);
  });

  it('makes a runScriptStr function for utils', async () => {
    await createHookHandler(gasket, context);
    expect(mockMakeGatherDevDeps).toHaveBeenCalledWith(context);
  });

  it('executes create for selected code style', async () => {
    await createHookHandler(gasket, context);
    expect(mockCodeStyles.godaddy.create).toHaveBeenCalled();
  });

  it('always executes create for common code style', async () => {
    await createHookHandler(gasket, context);
    await createHookHandler(gasket, { codeStyle: 'standard' });
    await createHookHandler(gasket, { codeStyle: 'other' });
    expect(mockCodeStyles.godaddy.create).toHaveBeenCalledTimes(1);
    expect(mockCodeStyles.standard.create).toHaveBeenCalledTimes(1);
    expect(mockCodeStyles.other.create).toHaveBeenCalledTimes(1);
    expect(mockCodeStyles.common.create).toHaveBeenCalledTimes(3);
  });

  it('does nothing if selected code style is none', async () => {
    await createHookHandler(gasket, { codeStyle: 'none' });
    expect(mockCodeStyles.common.create).not.toHaveBeenCalled();
  });

  it('does nothing if codeStyle or eslintConfig are not set', async () => {
    await createHookHandler(gasket, {});
    expect(mockCodeStyles.common.create).not.toHaveBeenCalled();
  });

  it('sets codeStyle to other if eslintConfig is set', async () => {
    await createHookHandler(gasket, { eslintConfig: 'bogus' });
    expect(mockCodeStyles.other.create).toHaveBeenCalled();
    expect(mockCodeStyles.common.create).toHaveBeenCalled();
  });

  it('sets codeStyle to other if stylelintConfig is set', async () => {
    await createHookHandler(gasket, { stylelintConfig: 'bogus' });
    expect(mockCodeStyles.other.create).toHaveBeenCalled();
    expect(mockCodeStyles.common.create).toHaveBeenCalled();
  });
});
