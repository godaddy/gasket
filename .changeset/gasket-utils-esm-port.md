---
"@gasket/utils": minor
---

Convert gasket-utils to ESM with CommonJS compatibility

- Convert all lib files from CommonJS to ESM syntax
- Migrate tests from Jest to Vitest for better ESM support
- Add SWC build configuration for CommonJS output
- Update package exports to support both ESM and CommonJS consumers
- Add conditional exports in package.json for dual module support