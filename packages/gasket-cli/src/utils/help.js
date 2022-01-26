const { Help } = require('@oclif/plugin-help');
const asciiLogo = require('./logo');

module.exports = class GasketHelp extends Help {
  showRootHelp(args) {
    console.log(asciiLogo);
    super.showRootHelp(args);
  }
};
