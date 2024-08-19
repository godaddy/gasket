const actions = require('../lib/actions');

describe('actions', () => {

  it('has expected actions', () => {
    const results = actions;
    expect(results).toHaveProperty('getNextConfig');
    expect(results).toHaveProperty('getNextRoute');
  });
});
