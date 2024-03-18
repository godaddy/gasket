const commandOptionsHook = require('../lib').hooks.commandOptions;
const { name } = require('../package');

describe('commandOptions', () => {

  it('returns an object', async () => {
    const results = await commandOptionsHook();
    expect(results).toBeDefined();
  });

  it('has expected options', async () => {
    const results = await commandOptionsHook();
    const expected = {
      name: 'record',
      description: `${name}: Whether or not to emit this command as part of Gasket's metrics lifecycle`,
      default: true
    };
    expect(results).toEqual(expected);
  });
});
