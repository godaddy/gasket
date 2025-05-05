import { applyConfigOverrides } from '@gasket/utils';
const isGasketCommand = /gasket[.-\w]*\.(js|ts|cjs|mjs)$/;

/** @type {import('@gasket/core').HookWithTimings<'configure'>} */
const plugin = {
  timing: {
    first: true
  },
  handler: function configure(gasket, config) {
    const [, maybeGasketFile, commandId] = process.argv;
    const hasGasket = isGasketCommand.test(maybeGasketFile);

    if (hasGasket && commandId) {
      return {
        command: commandId,
        ...applyConfigOverrides(config, { env: gasket.config.env, commandId })
      };
    }

    return config;
  }
};

export default plugin;
