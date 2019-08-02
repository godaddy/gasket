import React from 'react';
import { shallow } from 'enzyme';
import withReducers from './withReducers';

const mockReducers = {
  mock: f => f
};

const mockAttachReducers = jest.fn();

const context = {
  store: {
    attachReducers: mockAttachReducers
  }
};

function TargetComponent() {
  return (
    <h1>Example Component</h1>
  );
}

describe('withReducers', () => {

  beforeEach(() => {
    mockAttachReducers.mockReset();
  });

  it('exposes target component as WrappedComponent', () => {
    const Wrapped = withReducers(mockReducers)(TargetComponent);
    expect(Wrapped).toHaveProperty('WrappedComponent');
  });

  it('renders target component', () => {
    const Wrapped = withReducers(mockReducers)(TargetComponent);
    const wrapper = shallow(<Wrapped/>, { context });
    expect(wrapper.html()).toContain('Example Component');
  });

  it('component props are passed to wrapped component', () => {
    const Wrapped = withReducers(mockReducers)(TargetComponent);
    const wrapper = shallow(<Wrapped bogus='BOGUS'/>, { context });
    expect(wrapper.find(TargetComponent).first().props()).toHaveProperty('bogus', 'BOGUS');
  });

  it('props are passed to target component', () => {
    const Wrapped = withReducers(mockReducers)(TargetComponent);
    const wrapper = shallow(<Wrapped bogus='BOGUS'/>, { context });
    expect(wrapper.find(TargetComponent).first().props()).toHaveProperty('bogus', 'BOGUS');
  });

  it('wrapper isAttached prop is not passed to target component', () => {
    const Wrapped = withReducers(mockReducers)(TargetComponent);
    const wrapper = shallow(<Wrapped bogus='BOGUS' isAttached={ true }/>, { context });
    expect(wrapper.find(TargetComponent).first().props()).not.toHaveProperty('isAttached');
  });

  it('attaches reducers to store', () => {
    const Wrapped = withReducers(mockReducers)(TargetComponent);
    shallow(<Wrapped bogus='BOGUS' isAttached={ false }/>, { context });
    expect(mockAttachReducers).toHaveBeenCalledWith(mockReducers);
  });

  it('does not attach reducers if done by gitInitialProps', () => {
    const Wrapped = withReducers(mockReducers)(TargetComponent);
    shallow(<Wrapped bogus='BOGUS' isAttached={ true }/>, { context });
    expect(mockAttachReducers).not.toHaveBeenCalled();
  });

  describe('#getInitialProps', () => {
    let results;
    const Wrapped = withReducers(mockReducers)(TargetComponent);

    it('attaches reducers to store', async () => {
      await Wrapped.getInitialProps(context);
      expect(mockAttachReducers).toHaveBeenCalledWith(mockReducers);
    });

    it('isAttached=true for client render', async () => {
      results = await Wrapped.getInitialProps(context);
      expect(results).toHaveProperty('isAttached', true);
    });

    it('isAttached=false for server render', async () => {
      results = await Wrapped.getInitialProps({ ...context, isServer: true });
      expect(results).toHaveProperty('isAttached', false);
    });

    it('calls getInitialProps on target component', async () => {
      TargetComponent.getInitialProps = jest.fn().mockResolvedValue({});
      results = await Wrapped.getInitialProps(context);
      expect(TargetComponent.getInitialProps).toHaveBeenCalled();
    });
  });
});
