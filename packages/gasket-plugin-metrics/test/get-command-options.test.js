const getCommandOptionsHook = require('../lib').hooks.getCommandOptions;
const { name } = require('../package');

describe('getCommandOptions', () => {

  it('returns an object', async () => {
    const results = await getCommandOptionsHook();
    expect(results).toBeDefined();
  });

  it('has expected options', async () => {
    const results = await getCommandOptionsHook();
    const expected = [
      {
        name: 'record',
        description: `${name}: Whether or not to emit this command as part of Gasket's metrics lifecycle`,
        default: true
      }
    ];
    expect(results).toEqual(expected);
  });
});
