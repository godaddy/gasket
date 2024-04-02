const processCommand = require('./process-command');
const processArgs = require('./process-args');
const processOptions = require('./process-options');
const createOption = require('./create-option');
const logo = require('./logo');
const warnIfOutdated = require('./warn-if-outdated');


module.exports = {
  processCommand,
  processArgs,
  processOptions,
  createOption,
  logo,
  warnIfOutdated
};
