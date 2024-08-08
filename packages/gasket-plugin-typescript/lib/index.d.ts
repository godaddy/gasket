export async function promptTypescript(
  context: CreateContext,
  prompt: (
    prompts: Array<Record<string, any>>
  ) => Promise<Record<string, any>>
): Promise<undefined>

declare module '@gasket/plugin-typescript' {}

export = {
  name: '@gasket/plugin-typescript',
  version: '',
  description: '',
  hooks: {}
};
