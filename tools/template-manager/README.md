# Template Manager

Batch operations for template packages in the Gasket monorepo. Manages dependencies, runs build/test/lint, and validates template structure across all `packages/gasket-template-*` packages.

## Usage

```bash
pnpm template <operation> [flags]
```

Or directly:

```bash
node tools/template-manager/src/index.js <operation> [flags]
```

### Examples

```bash
pnpm template build                          # Build all templates
pnpm template test --only=webapp-app --bail  # Test one template, stop on failure
pnpm template update-deps --pkg=eslint       # Update eslint across templates
pnpm template add-dep lodash@4 --dev         # Add lodash as devDep to all templates
pnpm template exec "npm outdated"            # Run command in each template
```

## Operations

### Build & Test

| Operation | Description |
|-----------|-------------|
| `npm-ci` | Install dependencies (skips if up-to-date; retries with --legacy-peer-deps) |
| `build` | Run `npm run build` |
| `test` | Run `npm test` |
| `lint` | Run eslint |
| `clean` | Remove build artifacts and node_modules |

### Dependency Management

| Operation | Description |
|-----------|-------------|
| `update-deps` | Update deps to latest via npm-check-updates. Default: scoped packages only. Use `--pkg` or `--filter` to override. |
| `add-dep` | Add dependency: `add-dep <pkg>[@version]` (use `--dev` for devDependencies) |
| `remove-dep` | Remove dependency: `remove-dep <pkg>` |
| `sync-deps` | Align shared dependency versions across templates (highest wins) |
| `regen` | Regenerate package-lock.json (deletes node_modules, runs npm install) |

### Validation & Reporting

| Operation | Description |
|-----------|-------------|
| `status` | Show template health and dependency alignment |
| `peer-deps` | Report peer dependency issues via `npm ls` |
| `audit` | Aggregate `npm audit` results, deduplicated by advisory |
| `validate-dotfiles` | Verify dotfiles are included in npm pack |
| `validate-structure` | Check expected scripts, files, and forbidden files |

### Utilities

| Operation | Description |
|-----------|-------------|
| `exec` | Run arbitrary command in each template (Unix-only) |

## Flags

| Flag | Description |
|------|-------------|
| `--only=<names>` | Filter templates by substring match (comma-separated) |
| `--bail` | Stop on first failure |
| `--concurrency=<n>` | Parallel execution (default: CPU count) |
| `--no-concurrency` | Sequential execution |
| `--pkg=<name>` | Target single package (update-deps, sync-deps) |
| `--filter=<regex>` | Custom dep filter for update-deps |
| `--dev` | Add to devDependencies (add-dep) |

## Root Scripts

Available from repo root via `pnpm`:

```bash
pnpm templates:validate           # clean → npm-ci → build → lint → test
pnpm templates:validate-dotfiles  # validate-dotfiles
pnpm templates:validate-structure # validate-structure
```

Other operations (regen, status, sync-deps, peer-deps, audit) are run via `pnpm template <operation>`.

## Configuration

All config is in `src/config.js`. When copying to OS repo, only this file needs to change.

### Core Settings

| Option | Type | Description |
|--------|------|-------------|
| `root` | `string` | Monorepo root directory |
| `packagesDir` | `string` | Directory containing template packages |
| `templateFilter` | `string` | Prefix for template package names |
| `registry` | `string\|null` | npm registry URL (`null` = default) |

### Operation Settings

| Option | Type | Description |
|--------|------|-------------|
| `updateDepsFilter` | `string` | Regex for update-deps (ncu --filter) |
| `retryWithLegacyPeerDeps` | `boolean` | Retry with --legacy-peer-deps on failure |
| `npmCiArgs` | `string[]` | Args for npm ci |
| `cleanDirs` | `string[]` | Directories to remove on clean |
| `lintEnv` | `object` | Environment variables for lint |
| `testEnv` | `object` | Environment variables for test |

### Validation Settings

| Option | Type | Description |
|--------|------|-------------|
| `validateDotfiles.expectedDotFiles` | `string[]` | Dotfiles that must exist |
| `validateDotfiles.allowedUnpackedDotFiles` | `string[]` | Dotfiles excluded from npm pack check |
| `validateStructure.expectedScripts` | `string[]` | Scripts all templates must have |
| `validateStructure.expectedFiles` | `(string\|RegExp)[]` | Files all templates must have |
| `validateStructure.expectedFilesByTemplate` | `object` | Per-template file requirements |
| `validateStructure.expectedScriptsByTemplate` | `object` | Per-template script requirements |
| `validateStructure.forbiddenFiles` | `string[]` | Files that must not exist |

## Testing

```bash
pnpm test           # Run once
pnpm test:watch     # Watch mode
pnpm test:coverage  # Coverage report
```

## Architecture

```
src/
├── index.js          # Entry point, orchestration
├── cli.js            # Argument parsing
├── config.js         # Repo-specific settings
├── discovery.js      # Find template packages
├── runner.js         # Command execution wrapper
├── results.js        # Result tracking and summary
├── operations/       # Individual operations
│   ├── index.js      # Operation registry
│   ├── npm-ci.js     # per-template
│   ├── build.js      # per-template
│   ├── ...
│   └── status.js     # cross-template
└── utils/
    ├── fs.js         # File system helpers
    └── process.js    # Process spawn helpers
```

Operations have two modes:
- **per-template**: Handler called once per template, orchestrator manages loop and results
- **cross-template**: Handler receives all templates, manages its own iteration
