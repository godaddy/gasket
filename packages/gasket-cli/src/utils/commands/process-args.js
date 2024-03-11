/**
 * isValidArg - Validates the argument configuration
 * @param {object} arg The argument configuration
 * @returns {boolean} True if valid, false otherwise
 */
function isValidArg(arg) {
  const keys = Object.keys(arg);
  return keys.length &&
    keys.length <= 3 &&
    arg.name && arg.description;
}

/**
 * processArgs - Process the arguments configuration
 * @param {array} args Array of argument configurations
 * @returns {array} Array of argument definitions
 */
function processArgs(args) {
  if (!Array.isArray(args) || !args.every(isValidArg)) throw new Error('Invalid argument(s) configuration');

  return args.reduce((acc, arg) => {
    const def = [];
    if (arg.required) {
      def.push(`<${arg.name}>`, arg.description);
    } else {
      def.push(`[${arg.name}]`, arg.description);
    }

    acc.push(def);
    return acc;

  }, []);
}

module.exports = processArgs;
