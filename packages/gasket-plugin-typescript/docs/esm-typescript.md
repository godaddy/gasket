# ESM and TypeScript

## Introduction

The introduction of ECMAScript Modules (ESM) in JavaScript has standardized how modules are handled, moving away from CommonJS. However, integrating ESM with TypeScript introduces several complications due to differences in how both systems handle modules, especially concerning file extensions, module resolution, and the interoperation between TypeScript and JavaScript files.

## File Extensions in ESM

In ESM, explicit file extensions are required when importing modules. This is a departure from CommonJS, where file extensions were often inferred, especially in TypeScript projects. For example, in ESM:

```js
// example.js
import { myFunction } from './myModule.js';
```

In contrast, in TypeScript (when using CommonJS):

```ts
// example.ts
import { myFunction } from './myModule';
```

When switching to ESM, TypeScript does not automatically append file extensions, leading to runtime errors if the correct files are not found. To comply with ESM's requirements, developers must include the file extensions explicitly:

```ts
// example.ts
import { myFunction } from './myModule.js';
```

This creates a challenge since TypeScript files are typically `.ts` or `.tsx`, while the compiled JavaScript files are `.js`. Explicitly using `.js` in imports during development can cause confusion and potential issues during development or runtime if the module paths do not align correctly.

## Workaround: Importing `.ts` Files Using `.js` Extensions

A common workaround when using ESM in a TypeScript project with `"type": "module"` set in `package.json` is to import `.ts` files using the `.js` extension. For example:

```ts
import { myFunction } from './myModule.js';
```

Here, `myModule.ts` is the actual TypeScript file, but it's imported using the `.js` extension. TypeScript is able to resolve `myModule.ts` to `myModule.js`, making the import work at runtime.

### Why This Works

- **TypeScript Compiles to `.js`:** TypeScript compiles `.ts` files to `.js`, so the `.js` extension in imports aligns with the output file at runtime.
- **ESM Requirements:** Using `.js` in imports meets ESM's requirement for explicit file extensions while still allowing TypeScript to handle the compilation process.

### Considerations

While effective, this workaround requires consistency and careful management of import paths throughout the project. Tools like bundlers or custom TypeScript configurations may still be needed to handle more complex setups or edge cases.

## Using `.ts` Extensions

Another approach is to use `.ts` extensions directly in imports:

```ts
import { myFunction } from './myModule.ts';
```

This method works within TypeScript projects but introduces challenges when compiled to JavaScript since the resulting `.js` files won’t match the `.ts` extensions used in the imports. This leads to runtime errors when the modules are loaded.

### `noEmit` and `allowImportingExtensions`

Using `.ts` extensions in imports is only feasible when the `tsconfig.json` includes the following settings:

- **`noEmit`:** This prevents TypeScript from emitting JavaScript files during compilation.
- **`allowImportingExtensions`:** This allows TypeScript to import files with extensions such as `.ts`.

### Limitations

Using `.ts` extensions with these settings is primarily useful in scenarios where TypeScript is used purely for type-checking, without generating any JavaScript output. This approach is less common and is typically used in environments where a separate build tool or bundler handles the transpilation process.

## `type: "module"`

Setting `"type": "module"` in `package.json` tells Node.js to treat all `.js` files as ESM modules. This does not directly affect `.ts` files, leading to inconsistencies during development.

When `"type": "module"` is set, TypeScript must output `.js` files that follow ESM conventions, including using explicit extensions and ensuring all imports are valid ESM modules. This might require adjustments in how imports are written in `.ts` files to avoid issues in the compiled output.

## Conclusion

Integrating ESM with TypeScript introduces several complications, particularly around file extensions, module resolution, and ensuring compatibility between `.ts` and `.js` files. Developers must carefully manage imports and configurations to avoid runtime errors and maintain a smooth development workflow. Current workarounds, like importing `.ts` files with `.js` extensions, offer practical solutions but require careful handling to ensure consistency and functionality across the project.
