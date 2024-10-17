import { render, screen } from '@testing-library/react';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import React from 'react';
import IndexPage from '../../pages/index.tsx';
{{#if hasGasketIntl}}
import { IntlProvider } from 'react-intl';
import { createRequire } from 'module';
const messages = createRequire(import.meta.url)('../../locales/en-US.json');
{{/if}}

//
// The following test utilities are also available:
//
// import sinon from 'sinon';
//

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
    expect(screen.getByText('Welcome to Gasket!')).to.be.ok;
  });
});
