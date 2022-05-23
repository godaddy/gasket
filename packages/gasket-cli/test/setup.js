const assume = require('assume');
const assumeSinon = require('assume-sinon');
const deep = require('deep-eql');

assume.use(assumeSinon);

function isMatcher(value) {
  return typeof value === 'object' &&
    value.test instanceof Function &&
    typeof value.message === 'string';
}

assume.use((instance, util) => {
  const { format } = util;
  instance.add('objectContaining',
    function objectContaining(obj, msg = 'Object containing') {
      if (typeof this.value !== 'object') {
        return this.test(false, msg, format('`%j` to be an object', this.value));
      }

      Object.entries(obj).forEach(([prop, value]) => {
        const hasProp = prop in this.value;
        if (!hasProp) {
          return this.test(hasProp, msg, format('`%j` has property `%s`', this.value, prop));
        }
        if (isMatcher(value)) {
          const { test, message } = value;
          const expect = format('`%s` value `%s` to %s', prop, this.value[prop], message);
          return this.test(test(this.value[prop]), msg, expect);
        }
        const expect = format('`%s` value `%s` to equal `%s`', prop, this.value[prop], value);
        return this.test(deep(this.value[prop], value), msg, expect);
      });
    });
});
