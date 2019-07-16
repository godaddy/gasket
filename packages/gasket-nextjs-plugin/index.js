const { resolve } = require('path');
const nextApp = require('next');
const { createConfig } = require('./config');

//
// Different versions of Nextjs, have different ways of exporting the builder.
// In order to support canary, and other versions of next we need to detect
// the different locations.
//
let builder;
try {
  builder = require('next/dist/server/build').default;
} catch (e) {
  builder = require('next/dist/build').default;
}

module.exports = {
  dependencies: ['webpack'],
  name: 'nextjs',
  hooks: {
    nextCreate: async function createNext(gasket, devServer) {
      const { exec } = gasket;

      const app = nextApp({
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
    },
    nextBuild: async function createBuild(gasket) {
      return await builder(resolve('.'), await createConfig(gasket, true));
    }
  }
};
