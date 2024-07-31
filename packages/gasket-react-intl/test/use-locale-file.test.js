import { jest } from '@jest/globals';
import { LocaleFileStatus } from '@gasket/intl';

const mockContext = {
  getStatus: jest.fn(),
  load: jest.fn(),
  messages: {
    'test.message': 'Test Message'
  }
};

jest.unstable_mockModule('react', () => {
  return {
    default: jest.requireActual('react'),
    useContext: jest.fn(() => mockContext)
  };
});

describe('useMessages', () => {
  let useMessages;

  beforeEach(async () => {
    mockContext.getStatus.mockReturnValue(LocaleFileStatus.loaded);

    useMessages = (await import('../lib/use-messages.js')).default;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the expected messages', () => {
    const result = useMessages();
    expect(result).toEqual({
      'test.message': 'Test Message'
    });
  });
});
