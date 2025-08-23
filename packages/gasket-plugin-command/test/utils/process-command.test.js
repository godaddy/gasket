
import { Command } from 'commander';
import { processCommand } from '../../lib/utils/process-command.js';

describe('process-command', () => {
  describe('isValidCommand', () => {
    it('throws error for undefined command', () => {
      expect(() => processCommand({})).toThrow('Invalid command configuration');
    });

    it('throws error on missing id', () => {
      expect(() =>
        processCommand({ description: 'test', action: () => {} })
      ).toThrow('Invalid command configuration');
    });

    it('throws error on missing description', () => {
      expect(() => processCommand({ id: 'test', action: () => {} })).toThrow(
        'Invalid command configuration'
      );
    });

    it('throws error on missing action', () => {
      expect(() => processCommand({ id: 'test', description: 'test' })).toThrow(
        'Invalid command configuration'
      );
    });
  });

  it('processes command', () => {
    const cmd = {
      id: 'test1',
      description: 'test command',
      action: () => {},
      args: [{ name: 'arg', description: 'arg description' }],
      options: [{ name: 'option', description: 'option description' }]
    };
    const { command } = processCommand(cmd);
    expect(command).toBeDefined();
    expect(command._name).toEqual('test1');
    expect(command._description).toEqual('test command');
    expect(command._args).toHaveLength(1);
    expect(command.options).toHaveLength(1);
  });

  it('processes command without args', () => {
    const cmd = {
      id: 'test2',
      description: 'test command',
      options: [{ name: 'option', description: 'option description' }],
      action: () => {}
    };
    const { command } = processCommand(cmd);
    expect(command).toBeDefined();
    expect(command._name).toEqual('test2');
    expect(command._description).toEqual('test command');
    expect(command._args).toHaveLength(0);
    expect(command.options).toHaveLength(1);
  });

  it('processes command without options', () => {
    const cmd = {
      id: 'test3',
      description: 'test command',
      args: [{ name: 'arg', description: 'arg description' }],
      action: () => {}
    };
    const { command } = processCommand(cmd);
    expect(command).toBeDefined();
    expect(command._name).toEqual('test3');
    expect(command._description).toEqual('test command');
    expect(command._args).toHaveLength(1);
    expect(command.options).toHaveLength(0);
  });

  it('processes command without args or options', () => {
    const cmd = {
      id: 'test4',
      description: 'test command',
      action: () => {}
    };
    const { command } = processCommand(cmd);
    expect(command).toBeDefined();
    expect(command._name).toEqual('test4');
    expect(command._description).toEqual('test command');
    expect(command._args).toHaveLength(0);
    expect(command.options).toHaveLength(0);
  });

  it('processes hidden command', async () => {
    let output;
    const bin = (() => {
      const program = new Command();
      program.name('process-command-test');
      program.exitOverride();
      program.configureOutput({
        writeErr: () => {},
        writeOut: (str) => {
          output = str;
        }
      });
      return program;
    })();
    const hiddenCmd = {
      id: 'hidden-cmd',
      description: 'test command',
      action: () => {},
      hidden: true
    };

    const visibleCmd = {
      id: 'visible-cmd',
      description: 'test command',
      action: () => {}
    };

    const hiddenProcessed = processCommand(hiddenCmd);
    const visibleProcessed = processCommand(visibleCmd);

    bin.addCommand(hiddenProcessed.command, { hidden: hiddenProcessed.hidden });
    bin.addCommand(visibleProcessed.command, {
      hidden: visibleProcessed.hidden
    });

    try {
      await bin.parseAsync(['node', 'process-command-test', '--help']);
    } catch {
      // ignore
    }

    expect(hiddenProcessed.hidden).toEqual(true);
    expect(visibleProcessed.hidden).toEqual(false);
    expect(output).not.toContain('hidden-cmd');
    expect(output).toContain('visible-cmd');
  });

  it('processes default command', async () => {
    const bin = (() => {
      const program = new Command();
      program.name('process-command-test');
      program.exitOverride();
      return program;
    })();

    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const defaultCmd = {
      id: 'default-cmd',
      description: 'test command',
      action: () => {
        console.log('default-cmd output greatness');
      },
      default: true
    };

    const nonDefaultCmd = {
      id: 'non-default-cmd',
      description: 'test command',
      action: () => {}
    };

    const defaultProcessed = processCommand(defaultCmd);
    const nonDefaultProcessed = processCommand(nonDefaultCmd);

    bin.addCommand(defaultProcessed.command, {
      hidden: defaultProcessed.hidden,
      isDefault: defaultProcessed.isDefault
    });
    bin.addCommand(nonDefaultProcessed.command, {
      hidden: nonDefaultProcessed.hidden,
      isDefault: nonDefaultProcessed.isDefault
    });

    try {
      await bin.parseAsync(['node', 'process-command-test']);
    } catch {
      // ignore
    }

    expect(defaultProcessed.isDefault).toEqual(true);
    expect(nonDefaultProcessed.isDefault).toEqual(false);
    expect(spy).toHaveBeenCalledWith('default-cmd output greatness');
  });
});
