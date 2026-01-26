# Examples

This is a create-only plugin that runs during app generation via `create-gasket-app`. It adds Jest configuration and dependencies to the generated application but is not included in the final app's gasket.js file or dependencies.

## Usage

This plugin is automatically included when using create-gasket-app with templates:

```bash
npx create-gasket-app@latest my-app --template @gasket/template-nextjs-pages
```

## What the Plugin Provides

### React Project Configuration

When creating a React project, the plugin automatically configures Jest with React Testing Library:

```js
### Next.js React Project Configuration

When creating a Next.js React project, the plugin automatically configures Jest with React Testing Library:

```js
// Generated jest.config.js for Next.js React projects
import nextJest from 'next/jest.js';
const pathToApp = 'pages';
const createJestConfig = nextJest(pathToApp);

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: ['**/*.js'],
  testEnvironmentOptions: {
    url: 'http://localhost/'
  }
};

export default createJestConfig(customJestConfig);
```

### Generated Package Scripts

The plugin adds these scripts to your package.json:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watchAll",
    "test:coverage": "jest --coverage"
  }
}
```

### TypeScript Project Configuration

For TypeScript projects, additional dependencies and configurations are added:

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "ts-jest": "^29.2.5",
    "ts-node": "^10.9.2"
  },
  "scripts": {
    "test": "cross-env NODE_OPTIONS='--unhandled-rejections=strict --experimental-vm-modules' jest",
    "test:watch": "npm run test -- --watchAll",
    "test:coverage": "npm run test -- --coverage"
  }
}
```

## Dependencies Added

### All Projects
- `jest` - Core Jest testing framework

### React Projects
- `@testing-library/react` - React testing utilities
- `@testing-library/jest-dom` - Jest DOM matchers
- `@testing-library/dom` - DOM testing utilities
- `jest-environment-jsdom` - JSDOM environment for Jest

### TypeScript API Projects
- `ts-jest` - TypeScript preprocessor for Jest
- `ts-node` - TypeScript execution for Node.js
