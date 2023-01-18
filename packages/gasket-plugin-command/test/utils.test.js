const { flags } = require('@oclif/command');
const GasketCommand = require('../lib/command');
const { hoistBaseFlags } = require('../lib/utils');

describe('utils', () => {
  describe('hoistBaseFlags', () => {
    let MockCommand;

    beforeEach(() => {
      MockCommand = class extends GasketCommand {};
    });

    it('hoists flags from base GasketCommand', async () => {
      const results = hoistBaseFlags(MockCommand);

      expect(results).toHaveProperty('flags');
      expect(results.flags).toEqual(GasketCommand.flags);
    });

    it('retains flags set on extended class', async () => {
      const extraFlags = {
        bogus: flags.string({
          description: 'A bogus flag'
        })
      };
      MockCommand.flags = extraFlags;

      const results = hoistBaseFlags(MockCommand);

      expect(results.flags).toEqual({ ...GasketCommand.flags, ...extraFlags });
    });
  });
});
