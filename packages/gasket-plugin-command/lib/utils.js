const GasketCommand = require('./command');

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
