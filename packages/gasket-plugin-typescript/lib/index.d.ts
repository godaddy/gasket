declare module '@gasket/plugin-typescript' {
  export const name = '@gasket/plugin-typescript';
  export const hooks = {};
}

declare module 'create-gasket-app' {
  export interface CreateContext {
    typescript: boolean;
  }
}
