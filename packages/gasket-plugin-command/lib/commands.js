/** @type {import('@gasket/core').HookHandler<'commands'>} */
export default function commands(gasket) {
  return {
    id: 'build',
    description: 'Gasket build command',
    action: async function () {
      await gasket.exec('build');
    }
  };
}
