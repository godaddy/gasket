import { applyConfigOverrides } from '@gasket/utils';
const isGasketCommand = /gasket[.-\w]*\.(js|ts|cjs|mjs)$/;

export default {
  timing: {
    first: true
  },
  /** @type {import('@gasket/core').HookHandler<'configure'>} */
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

