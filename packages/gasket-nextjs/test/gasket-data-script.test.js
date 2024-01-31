import React from 'react';;
import { render, queryByAttribute } from '@testing-library/react';

import { GasketDataScript } from '../src';

const getById = queryByAttribute.bind(null, 'id');

describe('<GasketDataScript/>', function () {
  it('renders GasketDataScript', function () {
    const dom = render(<GasketDataScript { ...{ data: { bogus: true } } } />);
    const gasketDataScript = getById(dom.container, 'GasketData');

    expect(gasketDataScript).toBeDefined();
    expect(gasketDataScript.textContent).toEqual('{"bogus":true}');
  });
});
