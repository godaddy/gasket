const create = require('./create');

describe('create', () => {

  it('adds the analyze script', async () => {
    const add = jest.fn();
    await create({}, { pkg: { add } });
    expect(add).toHaveBeenCalledWith('scripts', {
      analyze: 'gasket analyze'
    });
  });
});
