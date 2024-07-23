import { jest } from '@jest/globals';
import { createElement } from 'react';
import { render } from '@testing-library/react';
import { LocaleFileStatus } from '@gasket/helper-intl';

const useLocaleFile = jest.fn();

jest.unstable_mockModule('../src/use-locale-file.js', () => {
  return {
    default: useLocaleFile
  };
});

describe('LocaleFileRequired', function () {
  let LocaleFileRequired, wrapper;

  beforeEach(async () => {
    LocaleFileRequired = (await import('../src/locale-file-required.js')).default;
  });

  const doMount = (props) => {
    return createElement(LocaleFileRequired, { ...props }, 'MockComponent');
  };

  beforeEach(function () {
    useLocaleFile.mockClear();
  });

  describe('#render', function () {
    it('renders null if loading', function () {
      useLocaleFile.mockReturnValue(LocaleFileStatus.loading);
      wrapper = render(doMount({}));
      expect(wrapper.baseElement.textContent).toEqual('');
    });

    it('renders custom loader if loading', function () {
      useLocaleFile.mockReturnValue(LocaleFileStatus.loading);
      wrapper = render(doMount({ loading: 'loading...' }));
      expect(wrapper.baseElement.textContent).toEqual('loading...');
    });

    it('renders wrapped component if LOADED', function () {
      useLocaleFile.mockReturnValue(LocaleFileStatus.loaded);
      wrapper = render(doMount({ loading: 'loading...' }));
      expect(wrapper.baseElement.textContent).toContain('MockComponent');
    });

    it('renders wrapped component if ERROR', function () {
      useLocaleFile.mockReturnValue(LocaleFileStatus.error);
      wrapper = render(doMount({ loading: 'loading...' }));
      expect(wrapper.baseElement.textContent).toContain('MockComponent');
    });

    it('supports single localeFilePath', function () {
      useLocaleFile.mockReturnValue(LocaleFileStatus.loading);
      wrapper = render(doMount({ localeFilePath: 'bogus' }));
      expect(useLocaleFile).toHaveBeenCalledWith('bogus');
      expect(wrapper.baseElement.textContent).toEqual('');
    });

    it('supports multiple localeFilePath as array', function () {
      useLocaleFile.mockReturnValue(LocaleFileStatus.loading);
      wrapper = render(doMount({ localeFilePath: ['locales', 'locales/nested'] }));
      expect(useLocaleFile).toHaveBeenCalledWith('locales', 'locales/nested');
      expect(wrapper.baseElement.textContent).toEqual('');
    });
  });
});
