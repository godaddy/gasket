function isValidArg(arg) {
  const keys = Object.keys(arg);
  return keys.length &&
    keys.length <= 3 &&
    arg.name && arg.description;
}

function processArgs(args) {
  if (!Array.isArray(args) && args.every(isValidArg)) throw new Error('Invalid args signature');

  return args.reduce((acc, arg) => {
    const def = []
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
