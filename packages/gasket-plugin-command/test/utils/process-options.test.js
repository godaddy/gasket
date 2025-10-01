/* eslint-disable no-undefined */
import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { Command } from 'commander';
import { processOptions } from '../../lib/utils/process-options.js';
import { processCommand } from '../../lib/utils/process-command.js';

describe('processOptions', () => {
  describe('isValidOption', () => {
    it('throws on invalid option', () => {
      const mockOptions = [
        { name: 'option1' },
        { description: 'description2' }
      ];
      assert.throws(
        () => processOptions(mockOptions),
        { message: /Invalid option\(s\) configuration/ }
      );
    });

    it('throws an error if options is not an array', () => {
      assert.throws(
        () => processOptions({}),
        { message: /Invalid option\(s\) configuration/ }
      );
    });

    it('throws an error if options is undefined', () => {
      assert.throws(
        () => processOptions(),
        { message: /Invalid option\(s\) configuration/ }
      );
    });
  });

  it('returns an array of option definitions', () => {
    const mockOptions = [
      {
        name: 'option1',
        description: 'description1',
        required: true,
        short: 'o'
      },
      {
        name: 'option2',
        description: 'description2',
        required: false,
        short: 't'
      }
    ];
    const result = processOptions(mockOptions);
    assert.deepEqual(result, [
      {
        options: ['-o, --option1 <option1>', 'description1'],
        conflicts: [],
        hidden: false,
        required: true,
        parse: undefined,
        defaultValue: undefined
      },
      {
        options: ['-t, --option2 [option2]', 'description2'],
        conflicts: [],
        hidden: false,
        required: false,
        parse: undefined,
        defaultValue: undefined
      }
    ]);
  });

  it('processes boolean options', () => {
    const mockOptions = [
      {
        name: 'option1',
        description: 'description1',
        required: true,
        short: 'o',
        type: 'boolean'
      },
      {
        name: 'option2',
        description: 'description2',
        required: false,
        short: 't',
        type: 'boolean'
      }
    ];
    const result = processOptions(mockOptions);
    assert.deepEqual(result, [
      {
        options: ['-o, --option1', 'description1'],
        conflicts: [],
        hidden: false,
        required: true,
        parse: undefined,
        defaultValue: undefined
      },
      {
        options: ['-t, --option2', 'description2'],
        conflicts: [],
        hidden: false,
        required: false,
        parse: undefined,
        defaultValue: undefined
      }
    ]);
  });

  it('processes default values', () => {
    const mockOptions = [
      {
        name: 'option1',
        description: 'description1',
        required: true,
        short: 'o',
        default: 'default1'
      },
      {
        name: 'option2',
        description: 'description2',
        required: false,
        short: 't',
        default: 'default2'
      }
    ];
    const result = processOptions(mockOptions);
    assert.deepEqual(result, [
      {
        options: ['-o, --option1 <option1>', 'description1'],
        conflicts: [],
        hidden: false,
        required: true,
        parse: undefined,
        defaultValue: 'default1'
      },
      {
        options: ['-t, --option2 [option2]', 'description2'],
        conflicts: [],
        hidden: false,
        required: false,
        parse: undefined,
        defaultValue: 'default2'
      }
    ]);
  });

  it('processes parse functions', () => {
    const mockOptions = [
      {
        name: 'option1',
        description: 'description1',
        required: true,
        short: 'o',
        parse: () => {}
      },
      {
        name: 'option2',
        description: 'description2',
        required: false,
        short: 't',
        parse: () => {}
      }
    ];
    const result = processOptions(mockOptions);
    assert.deepEqual(result, [
      {
        options: ['-o, --option1 <option1>', 'description1'],
        conflicts: [],
        hidden: false,
        required: true,
        parse: result[0].parse,
        defaultValue: undefined
      },
      {
        options: ['-t, --option2 [option2]', 'description2'],
        conflicts: [],
        hidden: false,
        required: false,
        parse: result[1].parse,
        defaultValue: undefined
      }
    ]);
    assert.equal(typeof result[0].parse, 'function');
    assert.equal(typeof result[1].parse, 'function');
  });

  it('processes conflicts', () => {
    const mockOptions = [
      {
        name: 'option1',
        description: 'description1',
        required: true,
        short: 'o',
        conflicts: ['option2']
      },
      {
        name: 'option2',
        description: 'description2',
        required: false,
        short: 't',
        conflicts: ['option1']
      }
    ];
    const result = processOptions(mockOptions);
    assert.deepEqual(result, [
      {
        options: ['-o, --option1 <option1>', 'description1'],
        conflicts: ['option2'],
        hidden: false,
        required: true,
        parse: undefined,
        defaultValue: undefined
      },
      {
        options: ['-t, --option2 [option2]', 'description2'],
        conflicts: ['option1'],
        hidden: false,
        required: false,
        parse: undefined,
        defaultValue: undefined
      }
    ]);
  });

  it('processes hidden options', () => {
    const mockOptions = [
      {
        name: 'option1',
        description: 'description1',
        required: true,
        short: 'o',
        hidden: true
      },
      {
        name: 'option2',
        description: 'description2',
        required: false,
        short: 't',
        hidden: true
      }
    ];
    const result = processOptions(mockOptions);
    assert.deepEqual(result, [
      {
        options: ['-o, --option1 <option1>', 'description1'],
        conflicts: [],
        hidden: true,
        required: true,
        parse: undefined,
        defaultValue: undefined
      },
      {
        options: ['-t, --option2 [option2]', 'description2'],
        conflicts: [],
        hidden: true,
        required: false,
        parse: undefined,
        defaultValue: undefined
      }
    ]);
  });

  it('allows for an empty array', () => {
    const result = processOptions([]);
    assert.deepEqual(result, []);
  });

  it('throws when required option is missing', async () => {
    const bin = (() => {
      const program = new Command();
      program.name('process-option-test');
      program.exitOverride();
      return program;
    })();

    const mockWrite = mock.method(process.stderr, 'write', (err) => err);
    const mockExit = mock.method(process, 'exit', (err) => err);

    const mockCmd = {
      id: 'test',
      description: 'test command',
      options: [
        { name: 'option1', description: 'description1', required: true }
      ],
      action: () => {}
    };
    const { command } = processCommand(mockCmd);
    bin.addCommand(command);

    try {
      await bin.parseAsync(['node', 'process-option-test', 'test']);
    } catch {
      // ignore
    }

    assert.ok(mockWrite.mock.calls.some(call =>
      call.arguments[0].includes('required option')
    ));
    assert.ok(mockExit.mock.calls.some(call =>
      call.arguments[0] === 1
    ));

    mockWrite.mock.restore();
    mockExit.mock.restore();
  });
});
