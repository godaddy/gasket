const { defineConfig } = require('cypress');

module.exports = defineConfig({
  video: false,
  e2e: {
    // eslint-disable-next-line no-unused-vars
    setupNodeEvents(on, config) {},
    baseUrl: 'http://localhost:8080',
    supportFile: false,
    specPattern: 'test/e2e/**/*.cy.{js,jsx,ts,tsx}'
  }
});
