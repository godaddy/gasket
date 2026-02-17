import chalk from 'chalk';

const PRESET_TO_TEMPLATES = {
  nextjs: ['@gasket/template-nextjs-pages', '@gasket/template-nextjs-express', '@gasket/template-nextjs-app'],
  api: ['@gasket/template-api-express', '@gasket/template-api-fastify']
};

/**
 * Derive template suggestions from raw preset names (e.g. nextjs, @gasket/preset-nextjs).
 * @param {string[]} rawPresets - Raw preset specifiers from CLI (e.g. nextjs@^1.0.0).
 * @returns {string[]} template package names to suggest
 */
function suggestTemplates(rawPresets) {
  const seen = new Set();
  const suggestions = [];
  for (const raw of rawPresets) {
    const name = raw.replace(/@[\^~]?[\d.]*(-.*)?$/, '').trim().toLowerCase();
    let base = null;
    if (name.includes('nextjs')) base = 'nextjs';
    else if (name.includes('api')) base = 'api';
    if (base && PRESET_TO_TEMPLATES[base]) {
      for (const t of PRESET_TO_TEMPLATES[base]) {
        if (!seen.has(t)) {
          seen.add(t);
          suggestions.push(t);
        }
      }
    }
  }
  return suggestions;
}

/**
 * Print deprecation warning when user passes --presets or --preset-path.
 * @param {import('../internal.js').PartialCreateContext} context - Create context with rawPresets/localPresets.
 */
export function warnPresetDeprecated(context) {
  if (!context.rawPresets?.length && !context.localPresets?.length) return;

  const suggestions = suggestTemplates(context.rawPresets || []);
  const lines = [
    chalk.yellow.bold('*** Presets are deprecated. Use templates instead. ***'),
    '',
    '  Presets (--presets / --preset-path) will be removed in a future version.',
    '  Templates provide a complete app and are the recommended way to create Gasket apps.',
    ''
  ];
  if (suggestions.length) {
    lines.push('  Suggested templates:');
    suggestions.forEach(t => lines.push(`    --template ${t}`));
    lines.push('');
  }
  lines.push('  See: https://gasket.dev/docs/create-gasket-app/#templates');
  console.warn(lines.join('\n'));
}
