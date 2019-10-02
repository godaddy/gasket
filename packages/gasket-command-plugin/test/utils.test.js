const assume = require('assume');
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

      assume(results).property('flags');
      assume(results.flags).deep.equals(GasketCommand.flags);
    });

    it('retains flags set on extended class', async () => {
      const extraFlags = {
        bogus: flags.string({
          description: 'A bogus flag'
        })
      };
      MockCommand.flags = extraFlags;

      const results = hoistBaseFlags(MockCommand);

      assume(results.flags).deep.equals({ ...GasketCommand.flags, ...extraFlags });
    });
  });
});
