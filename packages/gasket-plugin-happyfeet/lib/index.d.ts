import type { HappyFeet, HappyFeetOptions } from 'happy-feet';

declare module '@gasket/core' {
  export interface GasketConfig {
    happyFeet?: HappyFeetOptions;
  }
  export interface Gasket {
    // TODO: do not attach to gasket instance
    happyFeet?: HappyFeet;
  }
}

export default {
  name: '@gasket/plugin-happyfeet',
  hooks: {}
};
