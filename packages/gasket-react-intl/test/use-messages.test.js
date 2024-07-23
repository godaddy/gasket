import { jest } from '@jest/globals';
import { LocaleFileStatus } from '@gasket/helper-intl';

const mockContext = {
  getStatus: jest.fn(),
  load: jest.fn(),
  messages: {}
};

jest.unstable_mockModule('react', () => {
  return {
    default: jest.requireActual('react'),
    useContext: jest.fn(() => mockContext)
  };
});

describe('useLocaleFile', () => {
  let useLocaleFile;

  beforeEach(async () => {
    mockContext.getStatus.mockReturnValue(LocaleFileStatus.loaded);

    useLocaleFile = (await import('../src/use-locale-file.js')).default;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the expected status', () => {
    const result = useLocaleFile('locales');
    expect(result).toEqual(LocaleFileStatus.loaded);

    mockContext.getStatus.mockReturnValue(LocaleFileStatus.notLoaded);

    const result2 = useLocaleFile('locales');
    expect(result2).toEqual(LocaleFileStatus.notLoaded);
  });

  it('calls getStatus with single path', () => {
    useLocaleFile('locales');
    expect(mockContext.getStatus).toHaveBeenCalledWith('locales');
  });

  it('calls getStatus with multiple paths', () => {
    useLocaleFile('locales', 'locales/nexted', 'locales/:locale/grouped');
    expect(mockContext.getStatus).toHaveBeenCalledWith('locales', 'locales/nexted', 'locales/:locale/grouped');
  });

  it('does not dispatch load if status loaded', () => {
    useLocaleFile('locales');
    expect(mockContext.load).not.toHaveBeenCalled();
  });

  it('dispatches load if status not loaded', () => {
    mockContext.getStatus.mockReturnValue(LocaleFileStatus.notLoaded);
    useLocaleFile('locales');
    expect(mockContext.load).toHaveBeenCalledWith('locales');
  });

  it('dispatches load if status not loaded for multiple paths', () => {
    mockContext.getStatus.mockReturnValue(LocaleFileStatus.notLoaded);
    useLocaleFile('locales', 'locales/nexted', 'locales/:locale/grouped');
    expect(mockContext.load).toHaveBeenCalledWith('locales', 'locales/nexted', 'locales/:locale/grouped');
  });
});
