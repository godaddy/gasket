import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { Command } from 'commander';
import { processCommand } from '../../lib/utils/process-command.js';

describe('process-command', () => {
  describe('isValidCommand', () => {
    it('throws error for undefined command', () => {
      assert.throws(
        () => processCommand({}),
        { message: /Invalid command configuration/ }
      );
    });

    it('throws error on missing id', () => {
      assert.throws(
        () => processCommand({ description: 'test', action: () => {} }),
        { message: /Invalid command configuration/ }
      );
    });

    it('throws error on missing description', () => {
      assert.throws(
        () => processCommand({ id: 'test', action: () => {} }),
        { message: /Invalid command configuration/ }
      );
    });

    it('throws error on missing action', () => {
      assert.throws(
        () => processCommand({ id: 'test', description: 'test' }),
        { message: /Invalid command configuration/ }
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
    assert.ok(command);
    assert.equal(command._name, 'test1');
    assert.equal(command._description, 'test command');
    assert.equal(command._args.length, 1);
    assert.equal(command.options.length, 1);
  });

  it('processes command without args', () => {
    const cmd = {
      id: 'test2',
      description: 'test command',
      options: [{ name: 'option', description: 'option description' }],
      action: () => {}
    };
    const { command } = processCommand(cmd);
    assert.ok(command);
    assert.equal(command._name, 'test2');
    assert.equal(command._description, 'test command');
    assert.equal(command._args.length, 0);
    assert.equal(command.options.length, 1);
  });

  it('processes command without options', () => {
    const cmd = {
      id: 'test3',
      description: 'test command',
      args: [{ name: 'arg', description: 'arg description' }],
      action: () => {}
    };
    const { command } = processCommand(cmd);
    assert.ok(command);
    assert.equal(command._name, 'test3');
    assert.equal(command._description, 'test command');
    assert.equal(command._args.length, 1);
    assert.equal(command.options.length, 0);
  });

  it('processes command without args or options', () => {
    const cmd = {
      id: 'test4',
      description: 'test command',
      action: () => {}
    };
    const { command } = processCommand(cmd);
    assert.ok(command);
    assert.equal(command._name, 'test4');
    assert.equal(command._description, 'test command');
    assert.equal(command._args.length, 0);
    assert.equal(command.options.length, 0);
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

    assert.equal(hiddenProcessed.hidden, true);
    assert.equal(visibleProcessed.hidden, false);
    assert.ok(!output.includes('hidden-cmd'));
    assert.ok(output.includes('visible-cmd'));
  });

  it('processes default command', async () => {
    const bin = (() => {
      const program = new Command();
      program.name('process-command-test');
      program.exitOverride();
      return program;
    })();

    const mockLog = mock.method(console, 'log', () => {});
    const defaultCmd = {
      id: 'default-cmd',
      description: 'test command',
      action: () => {
        // eslint-disable-next-line no-console
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

    assert.equal(defaultProcessed.isDefault, true);
    assert.equal(nonDefaultProcessed.isDefault, false);
    assert.equal(mockLog.mock.calls.length, 1);
    assert.deepEqual(mockLog.mock.calls[0].arguments, ['default-cmd output greatness']);

    mockLog.mock.restore();
  });
});
