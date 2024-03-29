const GasketCommand = require('./command');

/**
 *
 * @param cmd
 */
function hoistBaseFlags(cmd) {
  cmd.flags = {
    ...GasketCommand.flags,
    ...cmd.flags
  };
  return cmd;
}

module.exports = {
  hoistBaseFlags
};
