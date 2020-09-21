import React from 'react';
import { shallow, mount } from 'enzyme';
import { LocaleRequiredBase, LocaleRequiredConnectedBase } from './LocaleRequired';
import configureMockStore from 'redux-mock-store';

const mockResource = {
  isLoaded: false,
  hasError: false,
  isUpdating: false
};

const mockMessages = {
  id1: 'message 1',
  id2: 'message 2',
  id3: 'message 3'
};

describe('<LocaleRequired />', () => {
  const MockComponent = class extends React.Component {
    render() {
      return <div>MockComponent</div>;
    }
  };
  beforeEach(() => {
    LocaleRequiredBase.checkedMessages = {};
  });
  describe('<LocaleRequiredBase />', () => {
    const testProps = {
      intl: {
        messages: {
          'getMessages__localeFile:bbe10d0.es-MX.json__module:@myscope/some-module': true,
          ...mockMessages
        }
      },
      identifier: 'my-test-app',
      _params: [{ module: '@myscope/some-module', localeFile: 'bbe10d0.es-MX.json' }]
    };

    describe('#ComponentDidMount', () => {
      it('will call the api to load locale file for the module', () => {
        testProps._messages = [{ ...mockResource }];
        const getMessagesStub = jest.fn();
        testProps._getMessages = getMessagesStub;
        mount(<LocaleRequiredBase { ...testProps }><MockComponent /></LocaleRequiredBase>);
        expect(getMessagesStub.mock.calls).toHaveLength(1);
      });
    });
    describe('#render', () => {
      it('will load the children if locale file is loaded', () => {
        testProps._messages = [{ ...mockResource, isLoaded: true, value: mockMessages }];
        const wrapper = shallow(<LocaleRequiredBase { ...testProps }><MockComponent /></LocaleRequiredBase>);
        expect(wrapper.find(MockComponent)).toHaveLength(1);
      });
      it('will not load the children if locale file is pending', () => {
        testProps._messages = [{ ...mockResource }];
        const getMessagesStub = jest.fn();
        testProps._getMessages = getMessagesStub;
        const wrapper = shallow(<LocaleRequiredBase { ...testProps }><MockComponent /></LocaleRequiredBase>);
        expect(wrapper.find(MockComponent)).toHaveLength(0);
      });
      it('will not load the children if locale file is loaded but IntlProvider is not refreshed', () => {
        testProps._messages = [{ ...mockResource, isLoaded: true, value: mockMessages }];
        testProps.intl.messages = {};
        const wrapper = shallow(<LocaleRequiredBase { ...testProps }><MockComponent /></LocaleRequiredBase>);
        expect(wrapper.find(MockComponent)).toHaveLength(0);
      });
    });
  });
  describe('#Map', () => {
    let testProps, store, wrapper;
    const mockStore = configureMockStore();

    beforeEach(() => {
      const initialState = {
        intl: {
          locale: 'es-MX'
        },
        LocaleApi: {
          'getLocaleManifest': {
            ...mockResource,
            isLoaded: true,
            value: {
              'test-app-name': {
                'name.space.name': {
                  'en-US': 'b384448',
                  'es-MX': '9a5bdd6'
                }
              },
              '@myscope/some-module': {
                'en-US': '12528be',
                'es-MX': 'bbe10d0'
              }
            }
          },
          'getMessages__localeFile:9a5bdd6.es-MX.json__module:test-app-name/name.space.name': {
            ...mockResource,
            isLoaded: true,
            value: { 'key-1': 'value-1' }
          },
          'getMessages__localeFile:bbe10d0.es-MX.json__module:@myscope/some-module': {
            ...mockResource,
            isLoaded: true,
            value: { 'key-2': 'value-2' }
          }
        }
      };
      store = mockStore(initialState);
    });

    it('mapStateToProps will pass the correct props for single module', () => {
      testProps = {
        store,
        module: 'test-app-name.name.space.name'
      };
      wrapper = shallow(
        <LocaleRequiredConnectedBase { ...testProps }>
          <MockComponent />
        </LocaleRequiredConnectedBase>
      ).shallow();
      expect(wrapper.props()._params).toEqual(
        [{ module: 'test-app-name/name.space.name', localeFile: '9a5bdd6.es-MX.json' }]);
      expect(wrapper.props()._messages).toEqual([{ ...mockResource, isLoaded: true, value: { 'key-1': 'value-1' } }]);
    });

    it('mapStateToProps will pass the correct props for multiple modules', () => {
      testProps = { store, module: ['test-app-name.name.space.name', '@myscope/some-module'] };
      wrapper = shallow(
        <LocaleRequiredConnectedBase { ...testProps }>
          <MockComponent />
        </LocaleRequiredConnectedBase>
      ).shallow();
      expect(wrapper.props()._params).toEqual(
        [
          { module: 'test-app-name/name.space.name', localeFile: '9a5bdd6.es-MX.json' },
          { module: '@myscope/some-module', localeFile: 'bbe10d0.es-MX.json' }
        ]);
      expect(wrapper.props()._messages).toEqual(
        [
          { ...mockResource, isLoaded: true, value: { 'key-1': 'value-1' } },
          { ...mockResource, isLoaded: true, value: { 'key-2': 'value-2' } }
        ]);
    });
  });
});
