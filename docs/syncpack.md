# syncpack

https://github.com/JamieMason/syncpack

## Why syncpack?

As of `PNPM@10.4.1`, we cannot use the `pnpm update` command on [Catalog versions](https://pnpm.io/catalogs#caveats).
We will use syncpack for the following:

- Find and fix dependency version mismatches.
- Enforce a single version policy.
- Find and bump outdated versions from the npm registry.
- Sort and format package.json files consistently.

### align-packages

We will continue to use the `scripts/align-packages.js` script for the following:

- Add/verify fixed properties to the package.json
- Verify typechecking configuration; includes updating eslintConfig
- Verify required npm scripts
- Remove maintainers property
- Verify homepage property

## Commands

[List issues](https://jamiemason.github.io/syncpack/command/list/)

```sh
syncpack list
```

[Fix auto-fixable issues](https://jamiemason.github.io/syncpack/command/fix-mismatches/)

```sh
syncpack fix-mismatches
```

[Format package.json](https://jamiemason.github.io/syncpack/command/format/)

```sh
syncpack format
```
