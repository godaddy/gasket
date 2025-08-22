
import { render } from '@testing-library/react';
import { createElement } from 'react';

const htmleescape = vi.fn();

vi.mock('htmlescape', () => {
  return {
    default: htmleescape
  };
});

function MockComponent() {
  return createElement('div', {}, 'MockComponent');
}

describe('withMessagesProvider', () => {
  let withMessagesProvider, mockIntlManager, mockLocaleHandler;

  beforeEach(async () => {
    const mod = await import('../lib/with-messages-provider.js');
    withMessagesProvider = mod.withMessagesProvider;

    mockLocaleHandler = {
      getMessages: vi.fn(),
      loadStatics: vi.fn(),
      getAllMessages: vi.fn(),
      getStaticsRegister: vi.fn().mockReturnValue({})
    };

    mockIntlManager = {
      defaultLocaleFilePath: 'locales',
      getMessages: vi.fn(),
      handleLocale: vi.fn().mockReturnValue(mockLocaleHandler)
    };
  });

  it('adds display name', function () {
    const HOC = withMessagesProvider(mockIntlManager)(MockComponent);
    expect(HOC.displayName).toBe('withMessagesProvider(MockComponent)');
  });

  it('attaches wrapped component', function () {
    const HOC = withMessagesProvider(mockIntlManager)(MockComponent);
    expect(HOC.WrappedComponent).toBe(MockComponent);
  });

  it('hoists non-react statics', function () {
    const HOC = withMessagesProvider(mockIntlManager)(MockComponent);
    expect(HOC).not.toHaveProperty('bogus');
    MockComponent.bogus = 'BOGUS';
    const HOC2 = withMessagesProvider(mockIntlManager)(MockComponent);
    expect(HOC2).toHaveProperty('bogus', 'BOGUS');
    delete MockComponent.bogus;
  });

  describe('#render', () => {
    const locale = 'fr-FR';

    it('renders wrapped component', () => {
      const HOC = withMessagesProvider(mockIntlManager)(MockComponent);
      const wrapper = render(createElement(HOC, { locale }));
      expect(wrapper.baseElement.textContent).toContain('MockComponent');
    });

    it('inits and locale handler with locale prop', () => {
      const HOC = withMessagesProvider(mockIntlManager)(MockComponent);
      render(createElement(HOC, { locale }));
      expect(mockIntlManager.handleLocale).toHaveBeenCalledWith(locale);
    });

    it('does not call handler.loadStatics if no extra paths configured', () => {
      const HOC = withMessagesProvider(mockIntlManager)(MockComponent);
      render(createElement(HOC, { locale }));
      expect(mockLocaleHandler.loadStatics).not.toHaveBeenCalled();
    });

    it('calls handler.loadStatics with statics from options', () => {
      const HOC = withMessagesProvider(
        mockIntlManager,
        { staticLocaleFilePaths: ['locales', 'locales/nested'] }
      )(MockComponent);
      render(createElement(HOC, { locale }));
      expect(mockLocaleHandler.loadStatics)
        .toHaveBeenCalledWith('locales', 'locales/nested');
    });

    it('sets messages', () => {
      const HOC = withMessagesProvider(mockIntlManager)(MockComponent);
      render(createElement(HOC, { locale }));
      expect(mockLocaleHandler.getAllMessages).toHaveBeenCalled();
    });

    it('renders statics register', () => {
      const HOC = withMessagesProvider(mockIntlManager)(MockComponent);
      render(createElement(HOC, { locale }));
      expect(mockLocaleHandler.getStaticsRegister).toHaveBeenCalled();
      expect(htmleescape).toHaveBeenCalled();
    });
  });
});
