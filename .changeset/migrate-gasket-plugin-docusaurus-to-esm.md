---
"@gasket/plugin-docusaurus": major
---

Migrate gasket-plugin-docusaurus to ESM

- Add `"type": "module"` to package.json
- Convert all CommonJS `require()` to ESM `import`
- Convert all `module.exports` to `export default`
- Update `__dirname` and `__filename` usage for ESM
- Replace Jest with Vitest for testing
- Add gasket-cjs build configuration for CommonJS compatibility
- Update package.json exports for dual module support
- Add TypeScript declarations for docusaurus modules
