/* eslint-disable no-unused-vars */
import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  e2e: {
    // eslint-disable-next-line no-unused-vars
    setupNodeEvents(on, config) {},
    baseUrl: 'http://localhost:3000',
    supportFile: false,
    specPattern: 'test/e2e/**/*.cy.{js,jsx,ts,tsx}'
  }
});
