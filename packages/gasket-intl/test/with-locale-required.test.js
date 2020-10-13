import React from 'react';
import assume from 'assume';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { mount } from 'enzyme';
import { ERROR, LOADED, LOADING } from '../src/utils';
import mockManifest from './fixtures/mock-manifest.json';

const MockComponent = class extends React.Component {
  render() {
    return <div>MockComponent</div>;
  }
};

describe('withLocaleRequired', function () {
  let mockConfig, useGasketIntlStub, withLocaleRequired, wrapper;

  const doMount = (...args) => {
    const Wrapped = withLocaleRequired(...args)(MockComponent);
    return mount(<Wrapped />);
  };

  beforeEach(function () {
    useGasketIntlStub = sinon.stub();
    mockConfig = {
      defaultLocale: 'en-US',
      manifest: { ...mockManifest, paths: { ...mockManifest.paths } },
      isBrowser: false
    };
    withLocaleRequired = proxyquire('../src/with-locale-required', {
      './config': mockConfig,
      './hooks': {
        useGasketIntl: useGasketIntlStub
      }
    }).default;
  });

  afterEach(function () {
    sinon.restore();
  });

  it('adds display name', function () {
    assume(withLocaleRequired()(MockComponent)).property('displayName', 'withLocaleRequired(MockComponent)');
  });

  describe('#render', function () {
    it('renders null if loading', function () {
      useGasketIntlStub.returns(LOADING);
      wrapper = doMount();
      assume(wrapper.html()).eqls(null);
    });

    it('renders custom loader if loading', function () {
      useGasketIntlStub.returns(LOADING);
      wrapper = doMount('/locales', { loading: 'loading...' });
      assume(wrapper.html()).eqls('loading...');
    });

    it('renders wrapped component if LOADED', function () {
      useGasketIntlStub.returns(LOADED);
      wrapper = doMount({ loading: 'loading...' });
      assume(wrapper.html()).includes('MockComponent');
    });

    it('renders wrapped component if ERROR', function () {
      useGasketIntlStub.returns(ERROR);
      wrapper = doMount({ loading: 'loading...' });
      assume(wrapper.html()).includes('MockComponent');
    });
  });
});
