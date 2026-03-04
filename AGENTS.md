# Gasket

> **Note:** `CLAUDE.md` is a symlink to `AGENTS.md`. They are the same file.

## Codebase

- pnpm monorepo (pnpm@10.4.1, Node 22, ESM)
- 50+ packages in `packages/`
- Plugin-based architecture — apps composed of gasket plugins and presets
- TypeScript + JSDoc type safety (see [docs/jsdoc-type-safety.md])

## Commands

| Task | Command |
|------|---------|
| Install | `pnpm install` |
| Build all | `pnpm run -r build` |
| Test all | `pnpm -w test` |
| Test single pkg | `cd packages/<pkg> && pnpm test` |
| Test w/ coverage | `pnpm -w test:coverage` |
| Lint | `pnpm -w lint` |
| Lint all pkgs | `pnpm -w lint:all` |
| Lint fix | `pnpm -w lint:fix` |
| Typecheck all | `pnpm -w typecheck:all` |
| Create changeset | `pnpm run changeset` |
| New package setup | `pnpm run align-packages` |
| Generate docs | `pnpm run docs` |

## Code Style

### Functional Programming

- Pure functions: same input, same output, no side effects
- Immutability: `const`, spread, map/filter/reduce — never mutate args
- Composition over inheritance: small single-purpose functions
- Declarative: array methods over for/while loops
- No module-level mutable state (`let`/`var` at module scope)
- Separate pure computation from effects; push effects to boundaries
- No `any` without strong justification; prefer union types + type guards
- Explicit return types for exported functions
- Use `readonly` for immutable data structures

### Naming & Files

- kebab-case for files and directories (enforced by `unicorn/filename-case`)
- JSDoc required for all exported functions (types, params, returns)
- Comments explain WHY, not WHAT
- Allowed custom JSDoc tags: `@jest-environment`, `@swagger`

### Error Handling

- Pure functions return error values (null, Result, Either)
- Exceptions for truly exceptional conditions only
- All errors typed and documented

## Testing

- Vitest — aim for 100% coverage (statements, branches, functions, lines)
- Table-driven tests for multiple cases
- Test edge cases: empty inputs, null, undefined, boundary values
- Mock/stub only effects, never pure computation
- Tests must be deterministic and independent
- CI tests on Node 20.x, 22.x, 24.x

## Changes & PRs

- Reference issue in commits when present
- Include unit tests for bug fixes
- Target `main` branch
- Two approvals to merge small PRs
- Major design changes: post in [Discussions], allow days for feedback
- Breaking changes / core refactors: tag a [code owner](./CODEOWNERS)
- Changesets required: run `pnpm run changeset`, commit the file with PR

## Markdown

- READMEs follow standard heading structure (see [CONTRIBUTING.md] for template)
- Examples use `####` (H4) headings, prefixed with "Example"
- Never use `inline code` in headings or links
- jsdocs2md output goes to `docs/API.md`
- Prefer reference links over inline

## API Compatibility

- Maintain source compat for public APIs
- Add, don't change or remove
- Breaking changes: add shim + migration guide, use `@deprecated` JSDoc tag

## Enforcement

Before committing:

1. `pnpm -w lint:all`
2. `pnpm -w typecheck:all`
3. `pnpm -w test`
4. Verify coverage for modified files

[docs/jsdoc-type-safety.md]: ./docs/jsdoc-type-safety.md
[CONTRIBUTING.md]: ./CONTRIBUTING.md
[Discussions]: https://github.com/godaddy/gasket/discussions
