import preboot from '../lib/preboot.js';

describe('preboot', () => {
  let mockGasket, mockLoad, mockHandler, mockIntlMgr;

  beforeEach(() => {
    mockLoad = vi.fn().mockResolvedValue();
    mockHandler = { load: mockLoad };
    mockIntlMgr = {
      locales: ['en-US', 'fr', 'de'],
      handleLocale: vi.fn().mockReturnValue(mockHandler)
    };
    mockGasket = {
      config: {
        intl: { experimentalImportAttributes: true }
      },
      actions: {
        getIntlManager: vi.fn().mockResolvedValue(mockIntlMgr)
      }
    };
  });

  it('calls load for every locale', async () => {
    await preboot(mockGasket);
    expect(mockIntlMgr.handleLocale).toHaveBeenCalledTimes(3);
    expect(mockLoad).toHaveBeenCalledTimes(3);
  });

  it('awaits all locale loads before resolving', async () => {
    let resolveLoad;
    mockLoad.mockReturnValueOnce(new Promise(res => { resolveLoad = res; }));

    const done = preboot(mockGasket).then(() => 'resolved');
    await Promise.resolve();
    expect(await Promise.race([done, Promise.resolve('pending')])).toBe('pending');

    resolveLoad();
    expect(await done).toBe('resolved');
  });

  it('does nothing when experimentalImportAttributes is not set', async () => {
    delete mockGasket.config.intl.experimentalImportAttributes;
    await preboot(mockGasket);
    expect(mockGasket.actions.getIntlManager).not.toHaveBeenCalled();
  });

  it('does nothing when intl config is absent', async () => {
    delete mockGasket.config.intl;
    await preboot(mockGasket);
    expect(mockGasket.actions.getIntlManager).not.toHaveBeenCalled();
  });
});
