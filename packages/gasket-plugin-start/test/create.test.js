const assume = require('assume');
const sinon = require('sinon');
const create = require('../lib/create');

describe('create', () => {
  let addStub;
  beforeEach(() => {
    addStub = sinon.stub();
  });

  const doTest = (name) => {
    it(`adds the ${name} script`, async () => {
      await create({}, { pkg: { add: addStub } });
      assume(addStub).calledWithMatch('scripts', {
        [name]: `gasket ${name}`
      });
    });
  };

  ['build', 'start', 'local'].forEach(cmd => doTest(cmd));
});
