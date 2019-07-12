const assume = require('assume');
const apply = require('../../../../src/scaffold/actions/apply-preset-config');

describe('applyPresetConfig', function () {
  it('should not override anything if there is not a create object', function () {
    const context = {};
    apply(context);
    assume(Object.keys(context)).has.length(0);
  });

  it('is decorated action', async () => {
    assume(apply).property('wrapped');
  });

  it('should not override any existing context with the preset package\'s create config', function () {
    const pizza = {
      presetPkgs: [{
        gasket: {
          create: {
            pineapple: 'excommunicate-able'
          }
        }
      }],

      pineapple: 'delicious'
    };

    apply(pizza);
    assume(pizza.pineapple).equals('delicious');
  });

  it('merges the existing context with that of the preset, without overriding', function () {
    const context = {
      presetPkgs: [{
        gasket: {
          create: {
            athos: 'The responsible one',
            porthos: 'The big one',
            aramis: 'The romantic one'
          }
        }
      }],

      dartagnan: 'The little one',
      athos: 'The noble one',
      porthos: 'The strong one'
    };

    apply(context);
    // should not have overridden athos
    assume(context.athos).equals('The noble one');
    // should have added dartagnan
    assume(context.dartagnan).equals('The little one');
  });
});
