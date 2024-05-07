/* eslint-disable no-undefined */
import { jest } from '@jest/globals';
import { Command } from 'commander';
import { processOptions, processCommand } from '../../../lib/utils/index.js';

describe('processOptions', () => {

  describe('isValidOption', () => {

    it('throws on invalid option', () => {
      const mockOptions = [
        { name: 'option1' },
        { description: 'description2' }
      ];
      expect(() => processOptions(mockOptions)).toThrow('Invalid option(s) configuration');
    });

    it('throws an error if options is not an array', () => {
      expect(() => processOptions({})).toThrow('Invalid option(s) configuration');
    });

    it('throws an error if options is undefined', () => {
      expect(() => processOptions()).toThrow('Invalid option(s) configuration');
    });
  });

  it('returns an array of option definitions', () => {
    const mockOptions = [
      { name: 'option1', description: 'description1', required: true, short: 'o' },
      { name: 'option2', description: 'description2', required: false, short: 't' }
    ];
    const result = processOptions(mockOptions);
    expect(result).toEqual([
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
      { name: 'option1', description: 'description1', required: true, short: 'o', type: 'boolean' },
      { name: 'option2', description: 'description2', required: false, short: 't', type: 'boolean' }
    ];
    const result = processOptions(mockOptions);
    expect(result).toEqual([
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
      { name: 'option1', description: 'description1', required: true, short: 'o', default: 'default1' },
      { name: 'option2', description: 'description2', required: false, short: 't', default: 'default2' }
    ];
    const result = processOptions(mockOptions);
    expect(result).toEqual([
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
      { name: 'option1', description: 'description1', required: true, short: 'o', parse: () => { } },
      { name: 'option2', description: 'description2', required: false, short: 't', parse: () => { } }
    ];
    const result = processOptions(mockOptions);
    expect(result).toEqual([
      {
        options: ['-o, --option1 <option1>', 'description1'],
        conflicts: [],
        hidden: false,
        required: true,
        parse: expect.any(Function),
        defaultValue: undefined
      },
      {
        options: ['-t, --option2 [option2]', 'description2'],
        conflicts: [],
        hidden: false,
        required: false,
        parse: expect.any(Function),
        defaultValue: undefined
      }
    ]);
  });

  it('processes conflicts', () => {
    const mockOptions = [
      { name: 'option1', description: 'description1', required: true, short: 'o', conflicts: ['option2'] },
      { name: 'option2', description: 'description2', required: false, short: 't', conflicts: ['option1'] }
    ];
    const result = processOptions(mockOptions);
    expect(result).toEqual([
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
      { name: 'option1', description: 'description1', required: true, short: 'o', hidden: true },
      { name: 'option2', description: 'description2', required: false, short: 't', hidden: true }
    ];
    const result = processOptions(mockOptions);
    expect(result).toEqual([
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
    expect(result).toEqual([]);
  });

  it('throws when required option is missing', async () => {
    const bin = (() => {
      const program = new Command();
      program.name('process-option-test');
      program.exitOverride();
      return program;
    })();

    const writeSpy = jest.spyOn(process.stderr, 'write').mockImplementation((err) => err);
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((err) => err);
    const mockCmd = {
      id: 'test',
      description: 'test command',
      options: [{ name: 'option1', description: 'description1', required: true }],
      action: () => { }
    };
    const { command } = processCommand(mockCmd);
    bin.addCommand(command);

    try {
      await bin.parseAsync(['node', 'process-option-test', 'test']);
    } catch (error) {
      // ignore
    }

    expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('required option'));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
