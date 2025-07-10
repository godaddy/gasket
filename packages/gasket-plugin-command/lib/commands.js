import { runShellCommand } from '@gasket/utils';

/** @type {import('@gasket/core').HookHandler<'commands'>} */
export default function commands(gasket) {
  return [
    {
      id: 'build',
      description: 'Gasket build command',
      action: async function () {
        await gasket.exec('build');

        // If not local, return
        if (gasket.config.env !== 'local') return;

        // If md2llm is disabled, return
        if (gasket.config.md2llm === false) return;

        // If md2llm is not configured, show the message and return
        if (!gasket.config.md2llm) {
          md2llmMessage();
          return;
        }

        /**
         * Example config
         *
         * md2llm: {
         *   rulesDir: '.cursor/rules',
         *   sourceDirs: [ 'node_modules/@gasket'],
         *   rulesFormat: 'mdc'
         * }
         */
        const { md2llm } = gasket.config;
        const { rulesDir, sourceDirs, rulesFormat = 'md' } = md2llm;
        const { stdout } = await runShellCommand('md2llm', [
          rulesDir,
          sourceDirs.join(' '),
          '--format',
          rulesFormat,
        ]);

        console.log(stdout);
      }
    },
    {
      id: 'md2llm',
      description: 'Convert markdown to LLM local rules',
      action: async function () {
        const { md2llm } = gasket.config;

        if (!md2llm) {
          console.log('md2llm is not configured');
          return;
        }

        const { rulesDir, sourceDirs, rulesFormat = 'md' } = md2llm;
        const { stdout } = await runShellCommand('md2llm', [
          rulesDir,
          sourceDirs.join(' '),
          '--format',
          rulesFormat,
        ]);

        console.log(stdout);
      }
    }
  ];
}

const stripAnsi = s => s.replace(/\x1b\[[0-9;]*m/g, '');
const BOX_WIDTH = 60; // or whatever width you want

function boxLine(str, color = '') {
  const visible = stripAnsi(str);
  let truncated = str;
  if (visible.length > BOX_WIDTH) {
    const over = visible.length - BOX_WIDTH;
    truncated = str.slice(0, str.length - over - 1) + '…';
  }
  const pad = Math.max(0, BOX_WIDTH - stripAnsi(truncated).length);
  return `│ ${color}${truncated}${' '.repeat(pad)}\x1b[0m│`;
}

function md2llmMessage() {
  console.log('\x1b[1;36m┌' + '─'.repeat(61) + '┐\x1b[0m');
  console.log(boxLine('\x1b[1;92mmd2llm is now installed\x1b[0m'));
  console.log('\x1b[1;36m├' + '─'.repeat(61) + '┤\x1b[0m');
  console.log(boxLine('Generate LLM rules from package markdown'));
  console.log(boxLine('documentation.'));
  console.log(boxLine(''));
  console.log(boxLine('Run \x1b[4mmd2llm --help\x1b[0m to see available options.'));
  console.log(boxLine('See \x1b[4mhttps://www.npmjs.com/package/md2llm\x1b[0m'));
  console.log(boxLine(''));
  console.log(boxLine('\x1b[2mThis message will disappear once the utility\x1b[0m'));
  console.log(boxLine('\x1b[2mis configured or disabled.\x1b[0m'));
  console.log(boxLine(''));
  console.log(boxLine('\x1b[1mHow it works:\x1b[0m'));
  console.log(boxLine('• Utility runs automatically on build when'));
  console.log(boxLine('  configured and \x1b[1mGASKET_ENV\x1b[0m is \x1b[1mlocal\x1b[0m.'));
  console.log(boxLine('• To disable, set \x1b[32mmd2llm\x1b[0m to \x1b[1mfalse\x1b[0m in your'));
  console.log(boxLine('  \x1b[32mgasket.js\x1b[0m.'));
  console.log(boxLine('• You can also run \x1b[32mmd2llm\x1b[0m manually.'));
  console.log(boxLine('• Add a postinstall script to your'));
  console.log(boxLine('  package.json to keep it up to date.'));
  console.log(boxLine(''));
  console.log(boxLine('\x1b[1mConfiguration:\x1b[0m'));
  console.log(boxLine('  \x1b[32m• rulesDir\x1b[0m: Directory to write the rules'));
  console.log(boxLine('    to. <string>'));
  console.log(boxLine('  \x1b[32m• sourceDirs\x1b[0m: Directories to search for'));
  console.log(boxLine('    markdown files. <array>'));
  console.log(boxLine('  \x1b[32m• rulesFormat\x1b[0m: Format to write the rules'));
  console.log(boxLine('    in. <string> (md or mdc(cursor))'));
  console.log('\x1b[1;36m└' + '─'.repeat(61) + '┘\x1b[0m');
}
