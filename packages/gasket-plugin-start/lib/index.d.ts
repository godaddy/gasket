declare module '@gasket/engine' {
  export interface HookExecTypes {
    build(): MaybeAsync<void>,
    preboot(): MaybeAsync<void>,
    start(): MaybeAsync<void>
  }
}
