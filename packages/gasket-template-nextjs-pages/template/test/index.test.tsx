import React from 'react';
import { render, screen } from '@testing-library/react';
import IndexPage from '../pages/index.tsx';
import { expect, describe, it } from 'vitest';
import { IntlProvider } from 'react-intl';
import { createRequire } from 'module';
const messages = createRequire(import.meta.url)('../locales/en-US.json');

describe('IndexPage', () => {
  it('renders page', () => {
    render(
      <IntlProvider locale={ 'en-US' } messages={ messages }>
        <IndexPage />
      </IntlProvider>
    );

    expect(screen.getByRole('heading').textContent).toBe('Welcome to Gasket!');
  });
});
