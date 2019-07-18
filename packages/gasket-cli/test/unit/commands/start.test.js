const assume = require('assume');
const { getCommandWithMocks } = require('../../helpers');

describe('start', () => {
  let Command;
  let gasket;

  it('invokes the `preboot` lifecycle', async () => {
    const cmd = await getCommand();

    await cmd.run();

    assume(gasket.exec).to.be.calledWith('preboot');
  });

  it('invokes the `configure` hook', async () => {
    const cmd = await getCommand();

    await cmd.run();

    assume(gasket.execWaterfall).to.be.calledWith('configure');
  });

  it('invokes the `start` lifecycle', async () => {
    const cmd = await getCommand();

    await cmd.run();

    assume(gasket.exec).to.be.calledWith('start');
  });

  async function getCommand() {
    ({ Command, gasket } = getCommandWithMocks('start'));

    const command = new Command([]);
    command.config = { gasket };
    await command.init();
    return command;
  }
});
