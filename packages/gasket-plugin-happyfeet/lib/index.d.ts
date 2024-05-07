import type { HappyFeet, HappyFeetOptions } from 'happy-feet';
import type { MaybeAsync } from '@gasket/core';

declare module '@gasket/core' {
    export interface GasketConfig {
        happyFeet: HappyFeetOptions
    }
    export interface Gasket {
        happyFeet: HappyFeet;
    }
}

