const assume = require('assume');
const { getCommandWithMocks } = require('../../helpers');

describe('The local command', () => {
  let Command;
  let gasket;

  it('invokes the `build` lifecycle', async () => {
    const cmd = await getCommand();

    await cmd.run();

    assume(gasket.exec).to.be.calledWith('build');
  });

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

  it('changes the `env` flag to `local`', async () => {
    const cmd = await getCommand();

    await cmd.run();

    assume(cmd.flags.env).to.equal('local');
  });

  it('sets `gasket.config.env` to `local` before the `init` hook', async () => {
    ({ Command, gasket } = getCommandWithMocks('local'));
    gasket.exec = () => assume(gasket.config.env).to.equal('local');

    const cmd = new Command([], {});
    cmd.config = { gasket };

    await cmd.init();
  });

  async function getCommand() {
    ({ Command, gasket } = getCommandWithMocks('local'));

    const cmd = new Command([]);
    cmd.config = { gasket };
    await cmd.init();

    return cmd;
  }
});
