require('@babel/register')({
  extensions: ['.ts']
});

const gasket = require('./gasket.ts');
module.exports = gasket.actions.getNextConfig();
