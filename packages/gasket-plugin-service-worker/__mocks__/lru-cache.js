const getStub = jest.fn();
const setStub = jest.fn();
module.exports = jest.fn(() => ({
  get: getStub,
  set: setStub
}));

module.exports.getStub = getStub;
module.exports.setStub = setStub;
