# Create Gasket App Examples

This document provides working examples for interfaces and utilities from the `create-gasket-app` package.

## Primary Usage (CLI)

The main interface for `create-gasket-app` is the command line:

```bash
# Basic app creation
npx create-gasket-app@latest my-app

# With presets
npx create-gasket-app@latest my-app --presets @gasket/preset-nextjs

# With package manager selection
npx create-gasket-app@latest my-app --package-manager pnpm

# With configuration
npx create-gasket-app@latest my-app --config '{"typescript": true}'

# With config file
npx create-gasket-app@latest my-app --config-file ./create-config.json

# Skip prompts (for CI)
npx create-gasket-app@latest my-app --presets @gasket/preset-nextjs --no-prompts
```
