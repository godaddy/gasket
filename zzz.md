## Migration Checklist Template

For each package, follow these steps:

### 1. Pre-Migration Analysis
- [ ] Review package dependencies
- [ ] Check for CommonJS-specific patterns
- [ ] Identify test setup and mocking patterns
- [ ] Note any circular dependencies

### 2. ESM Conversion
- [ ] Add `"type": "module"` to package.json
- [ ] Convert `require()` to `import`
- [ ] Convert `module.exports` to `export`
- [ ] Update `__dirname` and `__filename` usage
- [ ] Update file extensions if needed (.js, .mjs)
- [ ] Update package.json exports field

### 3. Build Configuration
- [ ] Use `gasket-cjs` to build the package - reference `gasket-core` for examples
- [ ] Add build scripts for CommonJS output (cjs/)
- [ ] Update package.json exports for dual module support
- [ ] Add cjs/ to .gitignore and .eslintignore

### 4. Vitest Migration
- [ ] Replace Jest with Vitest ^3.2.0 in devDependencies
- [ ] Create vitest.config.js
- [ ] Update test scripts in package.json
- [ ] Convert Jest mocks to Vitest vi
- [ ] Update test assertions if needed
- [ ] Fix any ESM-specific test issues

### 5. Testing & Validation
- [ ] Run `pnpm test` and fix any failures
- [ ] Run `pnpm run build` to verify CJS generation
- [ ] Run `pnpm typecheck` if TypeScript
- [ ] Test in a consuming package
- [ ] Verify backward compatibility

### 6. Documentation
- [ ] Add changeset with `pnpm changeset`
- [ ] Update README if needed
- [ ] Note any breaking changes

## Common Issues & Solutions

### Jest Mocking in ESM
- Replace `jest.mock()` with `vi.mock()`
- Use `vi.spyOn()` instead of `jest.spyOn()`
- Mock modules before imports using hoisting

### __dirname and __filename
```javascript
// Old CommonJS
const __dirname = path.dirname(__filename);

// New ESM
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### Importing JSON
```javascript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const foo = require('./foo.json');
```

### Circular Dependencies
- May become more apparent in ESM
- Refactor to break cycles
- Use dynamic imports if necessary

### Default Exports
```javascript
// CommonJS
const foo = require('./foo');

// ESM (if module has default export)
import foo from './foo';

// ESM (if module has named exports)
import { foo } from './foo';
```

## Notes

- All packages should maintain CommonJS compatibility via SWC builds
- Use the gasket-utils migration as a reference implementation
- Test with both ESM and CommonJS consumers
- Watch for pre-commit hooks modifying files
- Consider dependencies between packages when ordering migrations
