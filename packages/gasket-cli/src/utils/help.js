const { Help } = require('@oclif/core');
const asciiLogo = require('./logo');

module.exports = class GasketHelp extends Help {
  showRootHelp(args) {
    console.log(asciiLogo);
    super.showRootHelp(args);
  }
};
