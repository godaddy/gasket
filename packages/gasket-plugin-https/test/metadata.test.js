const metadata = require('../lib/metadata');
const actions = require('../lib/actions');

describe('metadata', () => {

  it('has actions metadata', () => {
    const data = metadata({}, {});
    expect(data).toHaveProperty('actions');
    expect(Object.keys(actions).length).toEqual(data.actions.length);
  });

  it('has lifecycles metadata', () => {
    const data = metadata({}, {});
    expect(data).toHaveProperty('lifecycles');
    expect(data.lifecycles.length).toBeGreaterThan(0);
  });

  it('has configurations metadata', () => {
    const data = metadata({}, {});
    expect(data).toHaveProperty('configurations');
    expect(data.configurations.length).toBeGreaterThan(0);
  });
});
