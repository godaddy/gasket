import type { HappyFeet, HappyFeetOptions } from 'happy-feet';
import type { MaybeAsync } from '@gasket/engine';

declare module '@gasket/engine' {
    export interface GasketConfig {
        happyFeet: HappyFeetOptions
    }
    export interface Gasket {
        happyFeet: HappyFeet;
    }
}

