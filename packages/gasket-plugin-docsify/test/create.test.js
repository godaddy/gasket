const { hooks: { create } } = require('../lib');
const docsifyPackage = require('docsify/package.json');

describe('The create hook', () => {
  it('adds a strip-indent dependency to work around a docsify bug', function () {
    const context = { pkg: { add: jest.fn() } };

    create({}, context);

    expect(context.pkg.add).toHaveBeenCalledWith(
      'devDependencies',
      // expect the hard-coded version to match the dep
      { 'strip-indent': docsifyPackage.dependencies['strip-indent'] }
    );
  });
});
