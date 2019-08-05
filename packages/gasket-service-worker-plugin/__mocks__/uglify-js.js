const minifyStub = jest.fn(() => ({
  code: '() => {}'
}));
module.exports = jest.fn(() => ({
  minify: minifyStub
}));

module.exports.minify = minifyStub;
