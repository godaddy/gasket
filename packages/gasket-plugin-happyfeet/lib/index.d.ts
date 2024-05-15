import type { HappyFeet, HappyFeetOptions } from 'happy-feet';

declare module '@gasket/core' {
  export interface GasketConfig {
    happyFeet: HappyFeetOptions;
  }
  export interface Gasket {
    happyFeet: HappyFeet;
  }
}
