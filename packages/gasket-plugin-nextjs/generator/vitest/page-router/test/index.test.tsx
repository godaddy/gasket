import React from 'react';
import { render, screen } from '@testing-library/react';
import IndexPage from '../pages/index.tsx';
import { expect, describe, it } from 'vitest';
{{#if hasGasketIntl}}
import { IntlProvider } from '{{reactIntlPkg}}';
import { createRequire } from 'module';
const messages = createRequire(import.meta.url)('../locales/en-US.json');
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
