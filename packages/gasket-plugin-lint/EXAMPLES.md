# Examples

## Plugin Usage

This is a **create-time only plugin** that runs during `create-gasket-app` to configure linting for new projects. It does not become part of the final Gasket app's runtime dependencies or appear in the generated `gasket.js` file.

### During App Creation

```bash
# The plugin runs automatically during app creation via templates
npx create-gasket-app@latest my-app --template @gasket/template-nextjs-pages

# The plugin prompts for linting preferences and configures package.json
# but does NOT add itself to the final gasket.js file
```

### What Gets Added to Your App

The plugin modifies your new app's `package.json` with:
- ESLint/stylelint dependencies in `devDependencies`
- Linting configuration (`eslintConfig`, `stylelint` sections)
- Lint scripts (`lint`, `lint:fix`, `stylelint`, etc.)
- Test integration (`posttest` script)

### What Does NOT Get Added

- The plugin itself is **not** added to your app's dependencies
- The plugin does **not** appear in your final `gasket.js` file
- No runtime Gasket hooks or actions are registered in your app

### Example Final package.json

After running `create-gasket-app` with GoDaddy style:

```json
{
  "name": "my-app",
  "scripts": {
    "lint": "eslint --ext .js,.jsx,.cjs,.ts,.tsx .",
    "lint:fix": "npm run lint -- --fix",
    "posttest": "npm run lint"
  },
  "devDependencies": {
    "eslint": "^8.57.1",
    "eslint-config-godaddy": "^7.1.1",
    "eslint-plugin-react-hooks": "^4.6.0",
    "@typescript-eslint/parser": "^8.38.0"
  },
  "eslintConfig": {
    "extends": ["godaddy"],
    "parser": "@typescript-eslint/parser",
    "env": { "jest": true }
  },
  "eslintIgnore": ["coverage/", "build/"]
}
```

Note: `@gasket/plugin-lint` is **not** listed in dependencies.

## Plugin Hooks (Create-Time Only)

These hooks only run during `create-gasket-app` and do not exist in the final app.

### prompt Hook

Prompts for code style preferences during app creation:

```js
// Example of what the plugin prompts for during `create-gasket-app`
{
  type: 'list',
  name: 'codeStyle',
  message: 'Which code style do you want configured?',
  choices: [
    { value: 'godaddy', name: 'GoDaddy' },
    { value: 'standard', name: 'Standard' },
    { value: 'airbnb', name: 'Airbnb' },
    { value: 'none', name: 'none (not recommended)' }
  ]
}
```

### create Hook

Configures linting in the new app's package.json based on selected code style:

```js
// Example context that gets processed during app creation
const context = {
  codeStyle: 'godaddy',
  addStylelint: true,
  pkg: packageJsonUtils,
  typescript: false
};
```

### postCreate Hook

Runs lint fix commands after app creation completes:

```bash
# Commands that run automatically after app creation
npm run lint:fix
npm run stylelint:fix
```

## Generated Configurations

These are the configurations that get added to your new app's `package.json`.

### Pre-configured Context

You can skip prompts by providing configuration:

```bash
# Using --config flag to pre-configure linting choices
npx create-gasket-app@latest my-app \
  --template @gasket/template-nextjs-pages \
  --config '{"codeStyle": "airbnb", "addStylelint": true}'
```

### Generated ESLint Configurations

#### GoDaddy Style (Basic)

```json
{
  "eslintConfig": {
    "extends": ["godaddy"],
    "parser": "@typescript-eslint/parser",
    "env": { "jest": true }
  },
  "eslintIgnore": ["coverage/", "build/"],
  "scripts": {
    "lint": "eslint --ext .js,.jsx,.cjs,.ts,.tsx .",
    "lint:fix": "npm run lint -- --fix",
    "posttest": "npm run lint"
  }
}
```

#### GoDaddy Style (React)

```json
{
  "eslintConfig": {
    "extends": ["godaddy-react"],
    "parser": "@typescript-eslint/parser",
    "env": { "jest": true }
  }
}
```

#### GoDaddy Style (React + Flow)

```json
{
  "eslintConfig": {
    "extends": ["godaddy-react-flow"]
  }
}
```

#### Standard Style

```json
{
  "scripts": {
    "lint": "standard | snazzy",
    "lint:fix": "standard --fix | snazzy"
  },
  "standard": {
    "env": ["jest"],
    "ignore": ["build/"]
  }
}
```

#### Airbnb Style (React)

```json
{
  "eslintConfig": {
    "extends": ["airbnb"],
    "parser": "@typescript-eslint/parser",
    "env": { "jest": true }
  },
  "eslintIgnore": ["coverage/", "build/"],
  "scripts": {
    "lint": "eslint --ext .js,.jsx,.cjs,.ts,.tsx .",
    "lint:fix": "npm run lint -- --fix",
    "posttest": "npm run lint"
  }
}
```

#### Airbnb Style (Base - No React)

```json
{
  "eslintConfig": {
    "extends": ["airbnb-base"]
  }
}
```

### Stylelint Configuration

```json
{
  "stylelint": {
    "extends": ["stylelint-config-godaddy"]
  },
  "scripts": {
    "stylelint": "stylelint \"**/*.(css|scss)\"",
    "stylelint:fix": "npm run stylelint -- --fix"
  }
}
```

### React Intl Integration

For apps using react-intl with GoDaddy style:

```json
{
  "eslintConfig": {
    "extends": ["godaddy", "plugin:@godaddy/react-intl/recommended"],
    "settings": {
      "localeFiles": ["locales/en-US.json"]
    }
  }
}
```

### Next.js Integration

For Next.js apps, the plugin adds Next.js config to existing extends:

```json
{
  "eslintConfig": {
    "extends": ["godaddy", "next"],
    "rules": {
      "jsx-a11y/anchor-is-valid": [
        "error",
        {
          "components": ["Link"],
          "specialLink": ["route", "as"],
          "aspects": ["invalidHref", "preferButton"]
        }
      ]
    }
  }
}
```

Note: The jsx-a11y rule is only added if both Next.js and eslint-plugin-jsx-a11y are present.

### TypeScript Configuration

For TypeScript projects:

```json
{
  "eslintConfig": {
    "parser": "@typescript-eslint/parser"
  },
  "scripts": {
    "lint": "eslint --ext .js,.jsx,.cjs,.ts,.tsx ."
  }
}
```

## Code Style Options

### GoDaddy Style Features
- Automatic React detection (uses `godaddy-react` config)
- Automatic Flow detection (uses `godaddy-react-flow` or `godaddy-flow`)
- React Intl plugin integration when `react-intl` dependency detected
- Optional stylelint support with `stylelint-config-godaddy`
- Next.js integration with `eslint-config-next`

### Standard Style Features
- Uses `standard` linter instead of ESLint
- Automatic test environment detection (Jest/Mocha/Vitest) in `standard.env`
- Build directory ignoring in `standard.ignore`
- Output formatting with `snazzy`
- Next.js support with `eslint-config-next` (for Next.js only)

### Airbnb Style Features
- Automatic React detection (uses `airbnb` vs `airbnb-base`)
- Optional stylelint support with `stylelint-config-airbnb`
- Next.js integration with `eslint-config-next`

### Common Features (All Non-Standard Styles)
- TypeScript parser setup when TypeScript detected
- Test environment detection (Jest/Mocha) in ESLint env
- ESLint ignore patterns for `coverage/` and `build/`
- Automatic lint script generation with proper file extensions
- Next.js jsx-a11y anchor rules when both Next.js and jsx-a11y plugin present
- posttest script generation to run linting after tests
