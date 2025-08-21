# @gasket/plugin-docusaurus Examples

This document provides working examples for all exported interfaces and functionality from the `@gasket/plugin-docusaurus` package.

## Plugin Usage

### Basic Plugin Installation

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';

export default makeGasket({
  plugins: [
    pluginDocs,
    pluginDocusaurus
  ]
});
```

### Plugin with Configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';

export default makeGasket({
  plugins: [
    pluginDocs,
    pluginDocusaurus
  ],
  docusaurus: {
    rootDir: 'documentation',    // Default: '.docs'
    docsDir: 'content',         // Default: 'docs'
    port: 8080,                 // Default: 3000
    host: '0.0.0.0'            // Default: 'localhost'
  }
});
```

## Command Usage Examples

### Running Documentation Server

```bash
# Start Docusaurus development server
node gasket.js docs

# Start with custom environment
GASKET_ENV=production node gasket.js docs

# Start without opening browser (if --no-view flag is supported)
node gasket.js docs --no-view
```

### Project Structure Examples

#### Default Structure
```bash
my-gasket-app/
├── gasket.js
├── docusaurus.config.js          # Generated automatically
├── .docs/                        # Default rootDir
│   ├── package.json              # Generated automatically
│   └── docs/                     # Default docsDir
│       ├── README.md
│       └── plugins/
└── node_modules/
```

#### Custom Structure
```bash
my-gasket-app/
├── gasket.js (with rootDir: 'documentation', docsDir: 'content')
├── docusaurus.config.js
├── documentation/                 # Custom rootDir
│   ├── package.json
│   └── content/                   # Custom docsDir
│       ├── README.md
│       └── api/
└── node_modules/
```
