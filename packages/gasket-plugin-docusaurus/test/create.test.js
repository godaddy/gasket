const create = require('../lib/create');

describe('createHook', () => {
  let addStub;
  beforeEach(() => {
    addStub = jest.fn();
  });

  it('is async function', function () {
    expect(create).toEqual(expect.any(Function));
  });

  it('adds devDependencies', async () => {
    await create({}, { pkg: { add: addStub } });
    expect(addStub).toHaveBeenCalledWith('devDependencies', expect.objectContaining({
      '@docusaurus/core': expect.any(String),
      '@docusaurus/preset-classic': expect.any(String)
    }));
  });
});
