# @gasket/plugin-cypress Examples

**Important:** This is a create-only plugin that runs during `create-gasket-app` to configure Cypress. It does not install itself in the final application.

## Usage During App Creation

### When Creating a New App

```bash
# Example: Creating an app with a template that includes the Cypress plugin
npx create-gasket-app@latest my-app --template @gasket/template-nextjs-pages

# The plugin runs automatically during creation if included in the template
# It configures Cypress but doesn't add itself to the final app
```

## What Gets Generated

When the plugin runs during `create-gasket-app`, it configures Cypress for your application.

## Generated Scripts Usage

After app creation, the following npm scripts are available in your generated application:

### Open Cypress Test Runner

```bash
# Opens the interactive Cypress Test Runner
npm run cypress
```

### Run Tests in Headless Mode

```bash
# Runs all tests without opening the GUI
npm run cypress:headless
```

### End-to-End Testing with Server

```bash
# Starts the server and runs tests (interactive mode)
npm run e2e

# Starts the server and runs tests (headless mode)
npm run e2e:headless
```

## Generated Configuration

### Default Cypress Configuration

The plugin generates a `cypress.config.js` file:

```js
import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: 'http://localhost:3000',
    supportFile: false,
    specPattern: 'test/e2e/**/*.cy.{js,jsx,ts,tsx}'
  }
});
```

## Test File Examples

### Basic E2E Test

```js
// test/e2e/homepage.cy.js
describe('Homepage', () => {
  it('should load successfully', () => {
    cy.visit('/');
    cy.contains('Welcome');
  });
});
```

### React Component Testing

```js
// test/e2e/components.cy.js
describe('Component Tests', () => {
  it('should interact with components', () => {
    cy.visit('/');
    cy.get('[data-testid="button"]').click();
    cy.get('[data-testid="modal"]').should('be.visible');
  });
});
```
