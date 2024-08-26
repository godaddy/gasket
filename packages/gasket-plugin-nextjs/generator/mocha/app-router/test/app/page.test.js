import { render, screen } from '@testing-library/react';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import React from 'react';

import IndexPage from '../../app/page.js';

//
// The following test utilities are also available:
//
// import sinon from 'sinon';
//

describe('IndexPage', () => {
  it('renders page', () => {
    render(
      <IndexPage />
    );
    expect(screen.getByText('Welcome to Gasket!')).to.be.ok;
  });
});
