function isValidOption(option) {
  const keys = Object.keys(option);
  return keys.length &&
    keys.length <= 5 &&
    option.name &&
    option.description;
}

function processOptions(options) {
  if (!Array.isArray(options) && options.every(isValidOption)) throw new Error('Invalid options signature');

  return options.reduce((acc, option) => {
    const def = [];
    const {
      name,
      description,
      required, short,
      parse,
      type = 'string',
      default: defatulValue
    } = option;

    const format = required ? `<${name}>` : `[${name}]`;
    const flags = short ? `-${short}, --${name}` : `--${name}`;

    def.push(`${flags} ${type !== 'boolean' ? format : ''}`, description);

    if (defatulValue) {
      def.push(defatulValue);
    }

    if (parse) {
      def.push(parse);
    }

    acc.push(def);
    return acc;
  }, []);
}

module.exports = processOptions;
