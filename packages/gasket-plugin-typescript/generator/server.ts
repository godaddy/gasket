import gasket from 'gasket.ts';

async function main() : Promise<void> {
  await gasket.actions.createLogger();
  await gasket.actions.startServer();
}

main();
