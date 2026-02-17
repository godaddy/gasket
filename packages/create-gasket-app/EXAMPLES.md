# Create Gasket App Examples

This document provides working examples for interfaces and utilities from the `create-gasket-app` package.

## Primary Usage (CLI)

The main interface for `create-gasket-app` is the command line:

```bash
# Basic app creation
npx create-gasket-app@latest my-app

# With template (recommended)
npx create-gasket-app@latest my-app --template @gasket/template-nextjs-pages

# With presets (deprecated; prefer --template)
npx create-gasket-app@latest my-app --presets @gasket/preset-nextjs
```

## Templates

Templates provide complete Gasket applications ready to use:

```bash
# Use an npm template package
npx create-gasket-app@latest my-app --template @gasket/template-nextjs-pages-js

# Use a versioned template
npx create-gasket-app@latest my-app --template @gasket/template-api@^2.0.0

# Use a tagged template
npx create-gasket-app@latest my-app --template @gasket/template-nextjs@beta

# Use a local template during development
npx create-gasket-app@latest my-app --template-path ./my-gasket-template

# Use local template with absolute path
npx create-gasket-app@latest my-app --template-path /path/to/my-template
```
