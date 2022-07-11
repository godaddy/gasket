const { createConfig } = require('./config');

/**
 * Small helper function that creates nextjs app from the gasket
 * configuration.
 *
 * @param   {Gasket}  gasket                The gasket API.
 * @returns {NextServer} The Nextjs App
 * @private
 */
async function setupNextApp(gasket) {
  const { exec, command } = gasket;
  const createNextApp = require('next');
  const devServer = (command.id || command) === 'local';

  const app = createNextApp({
    dev: devServer,
    conf: await createConfig(gasket, devServer)
  });

  //
  // We need to call the `next` lifecycle before we prepare the application
  // as the prepare step initializes all the routes that a next app can have.
  // If we wait later, it's possible that our added routes/pages are not
  // recognized.
  //
  await exec('next', app);
  await app.prepare();

  return app;
};


module.exports = {
  setupNextApp
}