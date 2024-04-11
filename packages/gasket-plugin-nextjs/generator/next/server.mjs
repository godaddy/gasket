import gasket from './gasket.mjs';

async function main() {
  await gasket.actions.createLogger();
  await gasket.actions.startServer();
}

main();