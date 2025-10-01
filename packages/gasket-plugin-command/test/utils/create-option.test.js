import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createOption } from '../../lib/utils/create-option.js';

describe('createOption', () => {

  it('should be defined', () => {
    assert.ok(createOption);
  });

  it('should be a function', () => {
    assert.equal(typeof createOption, 'function');
  });

  it('should create a commander option', () => {
    const definition = {
      options: ['-f, --foo', 'foo option'],
      defaultValue: 'bar',
      conflicts: ['baz'],
      parse: (val) => val.toUpperCase(),
      required: false,
      hidden: true
    };
    const option = createOption(definition);
    assert.ok(option);
    assert.equal(option.flags, '-f, --foo');
    assert.equal(option.description, 'foo option');
    assert.equal(option.defaultValue, 'bar');
    assert.deepEqual(option.conflictsWith, ['baz']);
    assert.ok(option.argParser);
    assert.equal(option.required, false);
    assert.equal(option.hidden, true);
  });
});
