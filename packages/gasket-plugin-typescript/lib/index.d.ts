import type { CreateContext } from 'create-gasket-app';

declare module '@gasket/plugin-typescript' {
  export const name = '@gasket/plugin-typescript';
  export const hooks = {};

  /* Externalize TS prompts for preset */
  export async function promptTypescript(
    context: CreateContext,
    prompt: (
      prompts: Array<Record<string, any>>
    ) => Promise<Record<string, any>>
  ): Promise<undefined>
}
