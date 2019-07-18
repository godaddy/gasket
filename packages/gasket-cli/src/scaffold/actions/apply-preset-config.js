const action = require('../action-wrapper');

/**
 * Extracts the `gasket` object from the specified preset and applies it the create context
 *
 * @param {CreateContext} context - Create context
 */
function applyPresetConfig(context) {
  const presetPkgs = context.presetPkgs || [];

  const overrides = presetPkgs.reduce((acc, presetPkg) => {
    const presetConfig = presetPkg.gasket || {};
    const presetContext = presetConfig.create || {};

    /**
     * Use the config in presets to preemptively fill in the create context.
     * This will prevent prompts from appearing for the associated prompts.
     * We take whatever is in the context at a higher priority, because any
     * config that is the context at this point must come from CLI flags,
     * as none of the global prompts have run yet.
     *
     * For example, `presetContext` contains `appDescription`, the prompt for the
     * newly created app's description will not appear.
     */
    return { ...presetContext, ...acc };
  }, {});

  Object.assign(overrides, context);
}

module.exports = action('Apply preset config', applyPresetConfig, { startSpinner: false });
