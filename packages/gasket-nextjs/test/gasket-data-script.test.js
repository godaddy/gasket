import React from 'react';
import assume from 'assume';
import { shallow } from 'enzyme';
import { GasketDataScript } from '../src';

describe('<GasketDataScript/>', function () {
  it('renders GasketDataScript', function () {
    const wrapper = shallow(<GasketDataScript { ...{ data: { bogus: true } } } />);
    assume(wrapper.html()).eqls('<script id="GasketData" type="application/json">{"bogus":true}</script>');
  });
  it('renders GasketDataScript with escaped JSON data', function () {
    const wrapper = shallow(<GasketDataScript { ...{ data: { bogus: true } } } />);
    assume(wrapper.html()).eqls('<script id="GasketData" type="application/json">{"bogus":true}</script>');
  });
});
