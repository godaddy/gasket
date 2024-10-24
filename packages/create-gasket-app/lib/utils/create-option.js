import { Option } from 'commander';

/**
 * createOption - Create a commander option
 * @type {import('../internal').createOption}
 */
export function createOption(definition) {
  const option = new Option(...definition.options);
  const { defaultValue, conflicts, parse, hidden, required } = definition;

  if (conflicts.length) option.conflicts(definition.conflicts);
  if (hidden) option.hideHelp();
  if (typeof defaultValue !== 'undefined') option.default(defaultValue);
  if (parse) option.argParser(parse);
  if (required) option.makeOptionMandatory();
  return option;
}
