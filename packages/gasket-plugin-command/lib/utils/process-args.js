/**
 * isValidArg - Validates the argument configuration
 * @type {import('../internal.d.ts').isValidArg}
 */
function isValidArg(arg) {
  const keys = Object.keys(arg);
  if (arg.required && arg.default) return false;
  const isValid =
    keys.length && keys.length <= 4 && arg.name && arg.description;
  return Boolean(isValid);
}

/**
 * Process the arguments configuration
 * @type {import('../internal.d.ts').processArgs}
 */
export function processArgs(args) {
  if (!Array.isArray(args) || !args.every(isValidArg))
    throw new Error('Invalid argument(s) configuration');

  return args.reduce((acc, arg) => {
    const def = [];
    const { name, description, required = false, default: defaultValue } = arg;
    if (required) {
      def.push(`<${name}>`, description);
    } else {
      def.push(`[${name}]`, description);
    }

    if (defaultValue) def.push(defaultValue);

    acc.push(def);
    return acc;
  }, []);
}
