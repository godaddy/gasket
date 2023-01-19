const create = require('../lib/create');

describe('create', () => {
  let addStub;
  beforeEach(() => {
    addStub = jest.fn();
  });

  const doTest = (name) => {
    it(`adds the ${name} script`, async () => {
      await create({}, { pkg: { add: addStub } });
      expect(addStub).toHaveBeenCalledWith('scripts', expect.objectContaining({
        [name]: `gasket ${name}`
      }));
    });
  };

  ['build', 'start', 'local'].forEach(cmd => doTest(cmd));
});
