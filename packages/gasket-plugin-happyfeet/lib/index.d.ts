import type { HappyFeet, HappyFeetOptions } from 'happy-feet';
import type { MaybeAsync } from '@gasket/core';
import type { HealthCheckError } from '@godaddy/terminus';


declare module '@gasket/core' {
    export interface GasketConfig {
        happyFeet: HappyFeetOptions
    }
    export interface Gasket {
        happyFeet: HappyFeet;
    }

    interface HookExecTypes {
        healthcheck(HealthcheckError: typeof HealthCheckError): MaybeAsync<string>;
    }
}

