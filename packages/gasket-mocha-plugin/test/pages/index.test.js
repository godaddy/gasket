import { shallow, render, mount } from 'enzyme';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import React from 'react';

function IndexPage(props) {
  return (
    <div>
      This is my example page
    </div>
  );
}

describe('/index', () => {
  it('has a running test', async () => {
    const enzyme = shallow(<IndexPage />);

    expect(enzyme.html()).equal('<div>This is my example page</div>');
  });
});
