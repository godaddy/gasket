module.exports = function mapObject(obj, mapping) {
  return Object
    .keys(obj)
    .map(key => [key, mapping(obj[key], key)])
    .reduce((accum, [k, v]) => Object.assign(accum, { [k]: v }), {});
};
