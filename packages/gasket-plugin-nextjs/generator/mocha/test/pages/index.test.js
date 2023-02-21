import { render, screen } from '@testing-library/react';
import { InltProvider } from '@react-intl';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import React from 'react';

import { IndexPage } from '../../pages/index';
import messages from '../../public/locales/en-US.json';

//
// The following test utilities are also available:
//
// import sinon from 'sinon';
//

describe('IndexPage', () => {
  it('renders page', () => {
    render(
      <InltProvider locale='en-US' messages={ messages }>
        <IndexPage />
      </InltProvider>
    );

    expect(screen.getByText('Welcome to Gasket!')).to.be.ok;
  });
});
