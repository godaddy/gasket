module.exports = function flatten(arrayOfArrays) {
  return arrayOfArrays.reduce((result, array) => result.concat(array), []);
};
