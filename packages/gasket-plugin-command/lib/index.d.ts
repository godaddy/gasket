declare module '@gasket/core' {
  interface HookExecTypes {
    commands(): GasketCommandDefinition;
    build(): void;
  }
}

const plugin: Plugin = {
  name: '@gasket/plugin-command',
  hooks: {}
};

export = plugin;
