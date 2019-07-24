import { shallow } from 'enzyme';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import React from 'react';

import { IndexPage } from '../../pages/index';
import Head from '../../components/head';

//
// The following test utilities are also available:
//
// import sinon from 'sinon';
// import { render, mount } from 'enzyme';
//

describe('IndexPage', () => {
  it('renders using shallow rendering', () => {
    const wrapper = shallow(<IndexPage />);

    expect(wrapper.find(Head).length).to.equal(1);
  });
});
