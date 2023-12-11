### Issues

- `runShellCommand` cross-spawn fails when running `gasket create` on an existing application
```json
// Command results in non-zero code
{
  "cmd": "git",
  "argv": [
    "checkout",
    "-b",
    "main"
  ],
  "opts": {
    "cwd": "/Users/mmason2/Development/zzz-cool-app"
  },
  "debug": false
}
```

- `Deprecation Warning` -  Automatic extension resolution of the "main" field is deprecated for ES modules


<!-- Demo commands -->

<!-- NextJS local preset -->
/Users/mmason2/Development/godaddy/gasket/packages/gasket-cli/bin/run.js create zzz-local-next --preset-path=/Users/mmason2/Development/godaddy/gasket/packages/gasket-preset-nextjs

<!-- NextJS Remote -->
gasket create zzz-next --presets @gasket/preset-nextjs@6.43.2-canary-esm-port.0

<!-- Base create Remote -->
gasket create zzz-next


<!-- Topics -->
- Backwards compatibility
- Gasket config - cjs vs mjs
- Default exports
  - No default exports as a rule of thumb
  - Plugins named exports or default exports?
- File assertions
  - Small util in @gasket/utils to load package.json
  - Remove assertions
- Migrations

- Node v20


- Investigations
  - Backwards compatibility
  - Destination Gasket app type module or not
  - Do it work with ESM gasket file?
  - Can it work for both mjs & cjs?
  - Test if ESM gasket packages work with type module declared - https://nodejs.org/docs/latest-v20.x/api/esm.html#enabling

  - Alternative for `import.meta.resolve` to support Node v18
    - https://www.npmjs.com/package/import-meta-resolve utilize this package in the resolver
