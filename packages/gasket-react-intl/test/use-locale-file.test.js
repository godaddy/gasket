
import { LocaleFileStatus } from '@gasket/intl';

const mockContext = {
  getStatus: vi.fn(),
  load: vi.fn(),
  messages: {
    'test.message': 'Test Message'
  }
};

vi.mock('react', () => ({
  default: {
    createContext: vi.fn(),
    useContext: vi.fn(() => mockContext)
  },
  useContext: vi.fn(() => mockContext)
}));

describe('useMessages', () => {
  let useMessages;

  beforeEach(async () => {
    mockContext.getStatus.mockReturnValue(LocaleFileStatus.loaded);

    useMessages = (await import('../lib/use-messages.js')).default;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the expected messages', () => {
    const result = useMessages();
    expect(result).toEqual({
      'test.message': 'Test Message'
    });
  });
});
