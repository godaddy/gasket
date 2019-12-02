const { describe, it } = require('mocha');
const sinon = require('sinon');
const assume = require('assume');
const path = require('path');
const create = require('../lib/create');

describe('create', function () {
  let mockContext, filesAddStub;

  beforeEach(() => {
    filesAddStub = sinon.stub();

    mockContext = {
      files: {
        add: filesAddStub
      }
    };
  });

  it('is async function', function () {
    assume(create).to.be.an('asyncfunction');
  });

  it('adds the expected template files', async function () {
    mockContext.gitInit = true;
    await create({}, mockContext);
    const root = path.join(__dirname, '..');
    assume(filesAddStub).calledWithMatch(`${root}/generator/.*`);
  });

  it('does not add template files if no gitInit', async function () {
    mockContext.gitInit = false;
    await create({}, mockContext);
    assume(filesAddStub).not.called();
  });
});
