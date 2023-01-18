const path = require('path');
const create = require('../lib/create');

describe('create', function () {
  let mockContext, filesAddStub;

  beforeEach(() => {
    filesAddStub = jest.fn();

    mockContext = {
      files: {
        add: filesAddStub
      }
    };
  });

  it('is async function', function () {
    expect(create).toEqual(expect.any(Function));
  });

  it('adds the expected template files', async function () {
    mockContext.gitInit = true;
    await create({}, mockContext);
    const root = path.join(__dirname, '..');
    expect(filesAddStub).toHaveBeenCalledWith(`${root}/generator/.*`);
  });

  it('does not add template files if no gitInit', async function () {
    mockContext.gitInit = false;
    await create({}, mockContext);
    expect(filesAddStub).not.toHaveBeenCalled();
  });
});
