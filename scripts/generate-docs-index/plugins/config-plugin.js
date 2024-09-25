/* eslint-disable no-console, no-sync */
export default {
  name: 'config-plugin',
  hooks: {
    docsSetup: () => ({}),
    // Add repo-level docs in to the top of the guides section
    docsGenerate: {
      timing: {
        first: true
      },
      handler: async function docsGenerate(gasket, docsConfigSet) {
        return [
          {
            name: 'Quick Start Guide',
            description: 'Get up and running on Gasket',
            link: '/docs/quick-start.md',
            targetRoot: docsConfigSet.docsRoot
          },
          {
            name: 'Upgrades Guide',
            description: 'Steps necessary to upgrade major versions',
            link: '/docs/upgrades.md',
            targetRoot: docsConfigSet.docsRoot
          },
          {
            name: 'Gasket Actions Guide',
            description: 'How to use access data and invoke lifecycles',
            link: '/docs/gasket-actions.md',
            targetRoot: docsConfigSet.docsRoot
          }
        ];
      }
    }
  }
};
