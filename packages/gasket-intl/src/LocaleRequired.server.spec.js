/**
 * @jest-environment node
 */

import React from 'react';
import { shallow } from 'enzyme';
import { LocaleRequiredBase } from './LocaleRequired';

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
    describe('#server side render', () => {
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
});
