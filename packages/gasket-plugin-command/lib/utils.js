import { GasketCommand } from './command.js';

export function hoistBaseFlags(cmd) {
  cmd.flags = {
    ...GasketCommand.flags,
    ...cmd.flags
  };
  return cmd;
}
