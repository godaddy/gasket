const assume = require('assume');
const { spy } = require('sinon');
const { getCommandWithMocks } = require('../../helpers');

describe('analyze', () => {
  let Command;
  let gasket;

  it('executes the `build` hooks', async () => {
    const cmd = await getCommand();

    await cmd.run();

    assume(gasket.exec).to.be.calledWith('build');
  });

  it('sets config analyze=true', async () => {
    const cmd = await getCommand();

    await cmd.run();

    assume(gasket.config.analyze).to.be.true();
  });

  async function getCommand() {
    ({ Command, gasket } = getCommandWithMocks('analyze'));

    const cmd = new Command([]);
    cmd.config = {
      gasket,
      debug: spy()
    };

    await cmd.init();

    return cmd;
  }
});
