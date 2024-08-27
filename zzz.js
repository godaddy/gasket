const fs = require('fs/promises');

const files = [
  '/Users/mmason2/Development/godaddy/gasket/packages/gasket-plugin-docs',
  '/Users/mmason2/Development/godaddy/gasket/packages/gasket-plugin-docusaurus',
  '/Users/mmason2/Development/godaddy/gasket/packages/gasket-plugin-metadata',
  '/Users/mmason2/Development/godaddy/gasket/packages/gasket-plugin-nextjs',
  '/Users/mmason2/Development/godaddy/gasket/packages/gasket-core'
];

async function main() {
  await fs.cp(files[0], '/Users/mmason2/Development/create-gasket-app-testing-1/__apps__/app-router/node_modules/@gasket/plugin-docs', { recursive: true });
  await fs.cp(files[1], '/Users/mmason2/Development/create-gasket-app-testing-1/__apps__/app-router/node_modules/@gasket/plugin-docusaurus', { recursive: true });
  await fs.cp(files[2], '/Users/mmason2/Development/create-gasket-app-testing-1/__apps__/app-router/node_modules/@gasket/plugin-metadata', { recursive: true });
  await fs.cp(files[3], '/Users/mmason2/Development/create-gasket-app-testing-1/__apps__/app-router/node_modules/@gasket/plugin-nextjs', { recursive: true });
  await fs.cp(files[4], '/Users/mmason2/Development/create-gasket-app-testing-1/__apps__/app-router/node_modules/@gasket/core', { recursive: true });
}

main();
