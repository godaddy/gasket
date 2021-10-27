import React from 'react';
import { shallow } from 'enzyme';
import assume from 'assume';
import { GasketDataProvider } from '../src';

describe('GasketDataProvider', function () {

  it('should render the component', () => {
    const container = shallow(
      <GasketDataProvider gasketData={{ test: 'test' }}>hello</GasketDataProvider>
    );

    assume(container).exists();
    assume(container.text()).equals('hello');
  });
});
