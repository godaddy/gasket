/** @jest-environment node */



const mockCookieStore = {
  getAll: vi.fn().mockReturnValue([
    { name: 'cookie1', value: 'value1' },
    { name: 'cookie2', value: 'value2' }
  ])
};

const mockCookies = vi.fn()
  .mockReturnValue(mockCookieStore);

const mockHeaderEntires = [
  ['header1', 'value1'],
  ['header2', 'value2']
];

const mockHeaderStore = {
  entries: vi.fn().mockReturnValue(mockHeaderEntires)
};


const mockHeaders = vi.fn()
  .mockReturnValue(mockHeaderStore);

vi.mock('next/headers', () => {
  return {
    cookies: mockCookies,
    headers: mockHeaders
  };
});

describe('request', () => {
  let request;

  beforeAll(async () => {
    // must be dynamic to avoid hoisting static import to the top
    request = await import('../../lib/server/request').then((module) => module.request);
  });

  beforeEach(() => {
    mockHeaders.mockReturnValue({ entries: vi.fn().mockReturnValue(mockHeaderEntires) });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns same instance for repeat request', async () => {
    const results1 = await request();
    const results2 = await request();
    expect(results1).toBe(results2);
  });

  it('returns unique instance when headers differ', async () => {
    mockHeaders.mockReturnValueOnce({ entries: vi.fn().mockReturnValueOnce([]) });

    const results1 = await request();
    const results2 = await request();
    expect(results1).not.toBe(results2);
  });

  it('cookies is an object', async () => {
    const results = await request();
    expect(results).toEqual(expect.objectContaining({
      cookies: {
        cookie1: 'value1',
        cookie2: 'value2'
      }
    }));
  });

  it('headers is an object', async () => {
    const results = await request();
    expect(results).toEqual(expect.objectContaining({
      headers: {
        header1: 'value1',
        header2: 'value2'
      }
    }));
  });

  it('has query if passed', async () => {
    const query = { query1: 'value1', query2: 'value2' };
    const results = await request(query);
    expect(results).toEqual(expect.objectContaining({ query }));
  });

  it('no query if not passed', async () => {
    const results = await request();
    expect(results).not.toHaveProperty('query');
  });

  it('allows query to be URLSearchParams', async () => {
    const query = new URLSearchParams({ query1: 'value1', query2: 'value2' });
    const results = await request(query);
    expect(results).toEqual(expect.objectContaining({ query: { query1: 'value1', query2: 'value2' } }));
  });
});
