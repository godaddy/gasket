import path from 'path';
import { PluginEngine } from '@gasket/engine';
import { plugins as defaultPlugins } from '../config/default-plugins.js';

export async function createEngine({ dest, presets = [], plugins = [] }) {
  const resolveFrom = path.join(dest, 'node_modules');

  const engineConfig = {
    plugins: {
      presets,
      add: [...defaultPlugins, ...plugins]
    },
    root: dest
  };

  const engine = await new PluginEngine(engineConfig, { resolveFrom });
  engine.command = { id: 'create' };
  await engine.exec('init');

  return engine;
};
