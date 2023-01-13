import React from 'react';
import assume from 'assume';
import { render, queryByAttribute } from '@testing-library/react';

import { GasketDataScript } from '../src';

const getById = queryByAttribute.bind(null, 'id');

describe('<GasketDataScript/>', function () {
  it('renders GasketDataScript', function () {
    const dom = render(<GasketDataScript {...{ data: { bogus: true } }} />);
    const gasketDataScript = getById(dom.container, 'GasketData');

    assume(gasketDataScript).exists();
    assume(gasketDataScript.textContent).equals('{"bogus":true}');
  });
});
