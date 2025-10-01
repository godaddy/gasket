import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { processArgs } from '../../lib/utils/process-args.js';

describe('processArgs', () => {
  let mockArgs;

  beforeEach(() => {
    mockArgs = [
      { name: 'arg1', description: 'description1', required: true },
      { name: 'arg2', description: 'description2', required: false }
    ];
  });

  describe('isValidArg', () => {
    it('throws an error if args is not an array', () => {
      assert.throws(
        () => processArgs({}),
        { message: /Invalid argument\(s\) configuration/ }
      );
    });

    it('throws an error if args is not an array of valid args', () => {
      assert.throws(
        () => processArgs(),
        { message: /Invalid argument\(s\) configuration/ }
      );
    });

    it('throws an error if an arg is not an object', () => {
      mockArgs.push('not an object');
      assert.throws(
        () => processArgs(mockArgs),
        { message: /Invalid argument\(s\) configuration/ }
      );
    });

    it('throws an error if an arg is missing a name', () => {
      delete mockArgs[0].name;
      assert.throws(
        () => processArgs(mockArgs),
        { message: /Invalid argument\(s\) configuration/ }
      );
    });

    it('throws an error if an arg is missing a description', () => {
      delete mockArgs[0].description;
      assert.throws(
        () => processArgs(mockArgs),
        { message: /Invalid argument\(s\) configuration/ }
      );
    });

    it('throws if required is true and default is provided', () => {
      mockArgs[0].default = 'default';
      assert.throws(
        () => processArgs(mockArgs),
        { message: /Invalid argument\(s\) configuration/ }
      );
    });
  });

  it('returns an array of argument definitions', () => {
    const result = processArgs(mockArgs);
    assert.deepEqual(result, [
      ['<arg1>', 'description1'],
      ['[arg2]', 'description2']
    ]);
  });

  it('includes default value if provided and not required', () => {
    mockArgs[1].default = 'default';
    const result = processArgs(mockArgs);
    assert.deepEqual(result, [
      ['<arg1>', 'description1'],
      ['[arg2]', 'description2', 'default']
    ]);
  });

  it('allows for an empty array', () => {
    const result = processArgs([]);
    assert.deepEqual(result, []);
  });
});
