import type { HappyFeet, HappyFeetOptions } from 'happy-feet';

declare module '@gasket/core' {
  export interface GasketConfig {
    happyFeet?: HappyFeetOptions;
  }

  export interface GasketActions {
    getHappyFeet?: (happyConfig?: HappyFeetOptions) => HappyFeet;
  }
}

export = {
  name: '@gasket/plugin-happyfeet',
  version: '',
  description: '',
  hooks: {}
};
