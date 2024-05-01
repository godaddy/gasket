const { hooks: { create } } = require('../lib/index');

describe('the create hook', () => {
  it('should add a gitignore entry for the .docs directory', () => {
    const context = {
      gitignore: { add: jest.fn() },
      gasketConfig: { addPlugin: jest.fn() }
    };

    create({}, context);

    expect(context.gitignore.add).toHaveBeenCalledWith('.docs', 'Documentation');
  });

  it('should handle when no `gitignore` is present in the create context', () => {
    const context = {
      gasketConfig: { addPlugin: jest.fn() }
    };

    expect(() => create({}, context)).not.toThrow(Error);
  });
});
