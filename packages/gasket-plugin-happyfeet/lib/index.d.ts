import HappyFeet from 'happy-feet'
import type { MaybeAsync } from '@gasket/engine';

declare module '@gasket/engine' {
    export interface GasketConfig {
        happyFeet: {
            // https://github.com/asilvas/happy-feet#usage
            escalationSoftLimitMin: number
            escalationSoftLimitMax: number
            uncaughtExceptionSoftLimit: number,
            // Don't know how to properly type `void 0`;
            uncaughtExceptionHardLimit: unknown,
            rssSoftLimit: number
            rssHardLimit: number
            logOnUnhappy: boolean
        },
    }
}

export interface HookExecTypes {
    preboot(): MaybeAsync<void>
    healthcheck(): MaybeAsync<string>
}

export interface Gasket {
    happyFeet: typeof HappyFeet;
}
