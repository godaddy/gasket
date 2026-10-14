# CHANGELOG

## 8.0.0-next.6

### Patch Changes

- 870a00a: Ignore the generated `.docs/` directory in `eslint.config.js` so `npm test` passes after `npm run docs`

## 8.0.0-next.5

### Patch Changes

- 497c201: Regenerate template lockfiles against the current `next` dist-tags (`@gasket/core` 8.0.0-next.3) so a scaffolded app runs the published v8 code instead of the pre-merge `next.2` pins.

## 8.0.0-next.4

### Patch Changes

- fc2c954: regen lockfiles
- 699a189: Update template tests for ESLint 9 flat config
- 699a189: Bump `next` to ^16.3.6 and `react`/`react-dom` to ^19.3.0 in generated apps; regenerate lockfiles.
- 699a189: Move generated API apps to ESLint 9 flat config (`eslint.config.js`, `eslint-config-godaddy` 8); drop the legacy `eslintConfig`/`eslintIgnore` package.json fields.
- 699a189: Docs: replace stale `tsx` references with the Node 24 native TypeScript runtime (`node gasket.ts build`, `node --watch server.ts`).

## 8.0.0-next.3

### Patch Changes

- dc01fac: remove middleware plugin
- 5832e5b: Remove tsx from template in favor of Node 24

## 8.0.0-next.2

### Patch Changes

- de4da28: Upgrade chalk, regen lockfiles

## 8.0.0-next.1

### Patch Changes

- 9f53191: React 19 upgrade
- 82806fd: Update OS deps to next dist tag

## 8.0.0-next.0

### Major Changes

- b235fc1: bump all package majors to 8

## 7.0.4

### Patch Changes

- 16bffc7: Adjust dotfiles with .template suffix, cli handle .template suffix pruning for unpacked files

## 7.0.3

### Patch Changes

- db09b09: Improve JSDocs

## 7.0.2

### Patch Changes

- c0b2b83: Ensure expected dotfiles are packed

## 7.0.1

### Patch Changes

- 92c51a8: Add missing template readmes

## 7.0.0

### Major Changes

- 0d8b629: Templates major bump to v3
