import React from 'react';
import assume from 'assume';
import { GasketDataScript } from '../src';
import { render } from '@testing-library/react';

describe('<GasketDataScript/>', function () {
  it('renders GasketDataScript', function () {
    const {container} = render(<GasketDataScript { ...{ data: { bogus: true } } } />);
    const script = container.querySelector('script');

    assume(script.id).eqls('GasketData');
    assume(script.type).eqls('application/json');
    assume(script.textContent).eqls('{"bogus":true}');
  });
});
