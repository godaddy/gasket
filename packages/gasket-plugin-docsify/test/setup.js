const assume = require('assume');
const assumeSinon = require('assume-sinon');

assume.use(assumeSinon);

global.window = {};
global.window.$docsify = {};
