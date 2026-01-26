# @gasket/plugin-vitest Examples

⚠️ **CREATE-ONLY PLUGIN**: This plugin is exclusively used during project creation by `create-gasket-app` and templates. It is **NOT installed** in the final application and only runs during the app generation process to set up Vitest testing infrastructure.

## Create Hook Examples

**Note**: These examples show what the plugin generates during `create-gasket-app`, not runtime behavior.

### Basic Project Setup

The plugin automatically configures Vitest for any project during creation:

```json
// Generated package.json scripts
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^3.2.0",
    "@vitest/coverage-v8": "^3.2.0"
  }
}
```

### React Project Configuration

For React projects, additional dependencies and configuration are added:

```json
// Additional dependencies for React projects
{
  "devDependencies": {
    "@vitejs/plugin-react": "^4.4.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/dom": "^10.4.0",
    "jsdom": "^20.0.3"
  }
}
```

```js
// Generated vitest.config.js for React projects
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react()
  ],
  test: {
    environment: 'jsdom',
    globals: true
  }
});
```

### API Project Configuration

For API-only projects:

```js
// Generated vitest.config.js for API projects
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true
  }
});
```

## Testing Examples

### Example Test File

The plugin sets up Vitest to run tests with these patterns:

```js
// test/example.test.js
import { describe, it, expect } from 'vitest';

describe('Example test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
```

### React Component Test Example

For React projects with testing library setup:

```js
// test/component.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from '../src/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

## Final Application Structure

After `create-gasket-app` completes, the generated application will have:

- ✅ Vitest dependencies in `package.json`
- ✅ Test scripts in `package.json`
- ✅ `vitest.config.js` file
- ✅ `test/` directory structure
- ❌ **NO** `@gasket/plugin-vitest` dependency
- ❌ **NO** reference to this plugin in `gasket.js`
