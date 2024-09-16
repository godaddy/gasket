import type { CreateContext, GasketPrompt } from 'create-gasket-app';

declare module '@gasket/plugin-typescript' {
  export const name = '@gasket/plugin-typescript';
  export const hooks = {};

  /* Externalize TS prompts for preset */
  export async function promptTypescript(
    context: CreateContext,
    prompt: GasketPrompt
  ): Promise<undefined>
}
