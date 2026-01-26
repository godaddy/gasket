import type { Plugin } from '@gasket/core';
import type { CreateContext, CreatePrompt } from 'create-gasket-app' with { 'resolution-mode': 'import' };


declare const plugin: Plugin;
export default plugin;

/* Externalize TS prompts for templates */
export function promptTypescript(
  context: CreateContext,
  prompt: CreatePrompt
): Promise<undefined>

