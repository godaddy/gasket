
import { createElement } from 'react';
import { render, queryByAttribute } from '@testing-library/react';
import { GasketDataScript } from '../lib/gasket-data-script.js';

// import { mockConsoleError } from './helpers.js';
// mockConsoleError();

const getById = queryByAttribute.bind(null, 'id');

describe('<GasketDataScript/>', function () {
  it('renders GasketDataScript', function () {
    const dom = render(createElement(GasketDataScript, { ...{ data: { bogus: true } } }));
    const gasketDataScript = getById(dom.container, 'GasketData');

    expect(gasketDataScript).toBeDefined();
    expect(gasketDataScript.textContent).toEqual('{"bogus":true}');
  });
});
