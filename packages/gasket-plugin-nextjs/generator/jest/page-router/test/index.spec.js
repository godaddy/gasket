import React from 'react';
import { render, screen } from '@testing-library/react';
import IndexPage from '../pages/index.js';
import { expect } from '@jest/globals';
{{#if hasGasketIntl}}
import { IntlProvider } from 'react-intl';
import messages from '../locales/en-US.json' with { type: 'json' };
{{/if}}

describe('IndexPage', () => {
  it('renders page', () => {
    render(
{{#if hasGasketIntl}}
      <IntlProvider locale={ 'en-US' } messages={ messages }>
{{/if}}
      <IndexPage />
{{#if hasGasketIntl}}
      </IntlProvider>
{{/if}}
    );

    expect(screen.getByRole('heading').textContent).toBe('Welcome to Gasket!');
  });
});

