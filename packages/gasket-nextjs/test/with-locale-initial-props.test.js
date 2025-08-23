
import { createElement } from 'react';

const mockResolveGasketData = vi.fn();
vi.mock('@gasket/data', () => ({ resolveGasketData: mockResolveGasketData }));

const { withLocaleInitialProps } = await import('../lib/with-locale-initial-props.js');

describe('withLocaleInitialProps', () => {
  let mockGasket, MockComponent;

  beforeEach(() => {
    mockResolveGasketData.mockResolvedValue({
      intl: { locale: 'en-US' }
    });
    mockGasket = { actions: { getIntlLocale: vi.fn() } };
    MockComponent = ({ children }) => createElement('div', null, children);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject locale', async () => {
    const HocMockComponent = withLocaleInitialProps(mockGasket)(MockComponent);
    const results = await HocMockComponent.getInitialProps({ ctx: { req: {} } });

    expect(results).toEqual({ locale: 'en-US' });
  });

  it('works with app context', async () => {
    const appCtxReq = {};
    const HocMockComponent = withLocaleInitialProps(mockGasket)(MockComponent);
    await HocMockComponent.getInitialProps({ ctx: { req: appCtxReq } });

    expect(mockResolveGasketData).toHaveBeenCalledWith(mockGasket, appCtxReq);
  });

  it('works with page context', async () => {
    const pageCtxReq = {};
    const HocMockComponent = withLocaleInitialProps(mockGasket)(MockComponent);
    await HocMockComponent.getInitialProps({ req: pageCtxReq });

    expect(mockResolveGasketData).toHaveBeenCalledWith(mockGasket, pageCtxReq);
  });

  it('works with browser context', async () => {
    // eslint-disable-next-line no-undefined
    const browserCtxReq = undefined;
    const HocMockComponent = withLocaleInitialProps(mockGasket)(MockComponent);
    await HocMockComponent.getInitialProps({});

    expect(mockResolveGasketData).toHaveBeenCalledWith(mockGasket, browserCtxReq);
  });
});
