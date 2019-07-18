const assume = require('assume');
const { getCommandWithMocks } = require('../../helpers');

describe('build', () => {
  let Command;
  let gasket;

  it('executes the `build` hooks', async () => {
    const cmd = await getCommand();

    await cmd.run();

    assume(gasket.exec).to.be.calledWith('build');
  });

  it('sets config analyze=false by default', async () => {
    const cmd = await getCommand();

    await cmd.run();

    assume(gasket.config.analyze).to.be.falsy();
  });

  it('sets config analyze=true for analyse flag', async () => {
    const cmd = await getCommand();
    cmd.flags = { analyze: true };

    await cmd.run();

    assume(gasket.config.analyze).to.be.true();
  });

  async function getCommand() {
    ({ Command, gasket } = getCommandWithMocks('build'));

    const cmd = new Command([]);
    cmd.config = { gasket };
    await cmd.init();

    return cmd;
  }
});
