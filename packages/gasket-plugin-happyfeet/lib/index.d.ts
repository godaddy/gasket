/// <reference types="@gasket/plugin-metadata" />

import type { Plugin } from '@gasket/core';
import type { HappyFeet, HappyFeetOptions } from 'happy-feet';

declare module '@gasket/core' {
  export interface GasketConfig {
    happyFeet?: HappyFeetOptions;
  }

  export interface GasketActions {
    getHappyFeet?: (happyConfig?: HappyFeetOptions) => HappyFeet;
  }
}

const plugin: Plugin = {
  name: '@gasket/plugin-happyfeet',
  hooks: {}
};

export = plugin;
