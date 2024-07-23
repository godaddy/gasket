import { jest } from '@jest/globals';
import React, { createElement } from 'react';
import { render } from '@testing-library/react';
import { LocaleFileStatus } from '@gasket/helper-intl';

const useLocaleFile = jest.fn();

const componentType = (component) => component.$$typeof;

jest.unstable_mockModule('../src/use-locale-file.js', () => {
  return {
    default: useLocaleFile
  };
});

/**
 *
 */
function MockComponent() {
  return createElement('div', {}, 'MockComponent');
}

describe('withLocaleFileRequired', function () {
  let withLocaleFileRequired, wrapper;

  beforeEach(async () => {
    withLocaleFileRequired = (await import('../src/with-locale-file-required.js')).default;
  });

  const doMount = (paths, props) => {
    const HOC = withLocaleFileRequired(paths, props)(MockComponent);
    return createElement(HOC);
  };

  beforeEach(function () {
    useLocaleFile.mockClear();
  });


  it('adds display name', function () {
    const HOC = withLocaleFileRequired()(MockComponent);
    expect(HOC.displayName).toBe('withLocaleFileRequired(MockComponent)');
  });

  it('attaches wrapped component', function () {
    const HOC = withLocaleFileRequired()(MockComponent);
    expect(HOC.WrappedComponent).toBe(MockComponent);
  });

  it('adds display name with ForwardRef', function () {
    const HOC = withLocaleFileRequired('locales', { forwardRef: true })(
      MockComponent
    );
    expect(HOC.displayName).toBe(
      'ForwardRef(withLocaleFileRequired/MockComponent))'
    );
  });

  it('hoists non-react statics', function () {
    const HOC = withLocaleFileRequired()(MockComponent);
    expect(HOC).not.toHaveProperty('bogus');
    MockComponent.bogus = 'BOGUS';
    const HOC2 = withLocaleFileRequired()(MockComponent);
    expect(HOC2).toHaveProperty('bogus', 'BOGUS');
    delete MockComponent.bogus;
  });

  it('can wrap with forwardRef', () => {
    const HOC = withLocaleFileRequired('locales', {
      forwardRef: false
    })(MockComponent);

    const ForwardHOC = withLocaleFileRequired('locales', {
      forwardRef: true
    })(MockComponent);

    const expectedType = componentType(React.forwardRef(() => {}));

    expect(componentType(HOC)).not.toEqual(expectedType);
    expect(componentType(ForwardHOC)).toEqual(expectedType);
  });

  describe('#render', function () {
    it('renders null if loading', function () {
      useLocaleFile.mockReturnValue(LocaleFileStatus.loading);
      wrapper = render(doMount(['locales'], {}));
      expect(wrapper.baseElement.textContent).toEqual('');
    });

    it('renders custom loader if loading', function () {
      useLocaleFile.mockReturnValue(LocaleFileStatus.loading);
      wrapper = render(doMount(['locales'], { loading: 'loading...' }));
      expect(wrapper.baseElement.textContent).toEqual('loading...');
    });

    it('renders wrapped component if LOADED', async function () {
      useLocaleFile.mockReturnValue(LocaleFileStatus.loaded);
      wrapper = render(doMount(['locales'], { loading: 'loading...' }));
      expect(wrapper.baseElement.textContent).toContain('MockComponent');
    });

    it('renders wrapped component if ERROR', function () {
      useLocaleFile.mockReturnValue(LocaleFileStatus.error);
      wrapper = render(doMount(['locales'], { loading: 'loading...' }));
      expect(wrapper.baseElement.textContent).toContain('MockComponent');
    });

    it('supports single localeFilePath', function () {
      useLocaleFile.mockReturnValue(LocaleFileStatus.loading);
      wrapper = render(doMount(['bogus']));
      expect(useLocaleFile).toHaveBeenCalledWith('bogus');
      expect(wrapper.baseElement.textContent).toEqual('');
    });

    it('supports multiple localeFilePath as array', function () {
      useLocaleFile.mockReturnValue(LocaleFileStatus.loading);
      wrapper = render(doMount(['locales', 'locales/nested']));
      expect(useLocaleFile).toHaveBeenCalledWith('locales', 'locales/nested');
      expect(wrapper.baseElement.textContent).toEqual('');
    });
  });
});
