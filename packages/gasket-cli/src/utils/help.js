import { Help } from '@oclif/core';;
import { logo as asciiLogo } from './logo.js';

export default class GasketHelp extends Help {
  showRootHelp(args) {
    console.log(asciiLogo);
    super.showRootHelp(args);
  }
};
