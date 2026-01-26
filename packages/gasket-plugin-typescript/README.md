# @gasket/plugin-typescript

Gasket plugin for TypeScript support.

## Installation

This plugin is only used by templates for `create-gasket-app` and is not installed for apps.

## Typescript & ESM

In order to support `type: module` applications with TypeScript imports need to include extensions. A workaround for the current state of ESM support is to utilize `.js` extensions in TypeScript files. This pattern may seem strange but the TypeScript compiler is able to resolve these imports and compile the code correctly.

```typescript
// server.ts

// Actual file is gasket.ts
import gasket from './gasket.js';
```
