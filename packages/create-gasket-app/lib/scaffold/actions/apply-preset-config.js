const { flattenPresets } = require('@gasket/resolve');
const action = require('../action-wrapper');

/**
 * Extracts predefined createContext from presets and applies to context.
 * This allows presets to preemptively define fill in the create context.
 * This will prevent prompts from appearing for the associated prompts.
 *
 * For example, `presetContext` contains `appDescription`, the prompt for the
 * newly created app's description will not appear.
 *
 * We take whatever is in the context at a higher priority, because any
 * config that is the context at this point must come from CLI flags,
 * as none of the global prompts have run yet. Parent presets take priority
 * over extended presets.
 *
 * @param {CreateContext} context - Create context
 */
function applyPresetConfig(context) {
  const { presetInfos = [] } = context;

  const presetContext = flattenPresets(presetInfos).reduce((acc, presetInfo) => {
    return { ...(presetInfo.module && presetInfo.module.createContext || {}), ...acc };
  }, context);

  Object.assign(context, presetContext);
}

module.exports = action('Apply preset context', applyPresetConfig, { startSpinner: false });
