import type { Plugin } from '@gasket/core';


declare module '@gasket/plugin-mocha' {
  const plugin: Plugin;
  export default plugin;
}
