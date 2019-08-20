const { documentation } = require('./lifecycle');

module.exports = function documentationLink(type, name) {
  const collection = documentation[`${type}s`];
  const defaultPattern = collection._default;
  return collection[name]
    || defaultPattern && defaultPattern.replace(`{${type}}`, name)
    || null;
};

