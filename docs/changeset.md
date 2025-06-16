# Changesets

This document explains how the Gasket monorepo uses [changesets](https://github.com/changesets/changesets) for versioning and publishing packages.

## Overview

Changesets is a tool that helps manage versioning and changelogs in multi-package repositories. It allows contributors to declare their intent to release packages and automatically handles version bumping, changelog generation, and publishing.

## Configuration

The changeset configuration is located in `.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.5/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

Key settings:
- `access: "public"` - All packages are published publicly to npm
- `baseBranch: "main"` - The main branch is used as the base for versioning
- `updateInternalDependencies: "patch"` - Internal dependencies get patch bumps when the dependency is updated

## Workflow

### For Contributors

1. Make your changes to the codebase
2. Create a changeset by running:
   ```bash
   pnpm run changeset
   ```
3. Follow the prompts to:
   - Select which packages are affected
   - Choose the version bump type (major, minor, patch)
   - Write a summary of your changes
4. Commit the generated changeset file (in `.changeset/`) with your PR

### For Maintainers

1. When PRs with changesets are merged to `main`, a "Version Packages" PR is automatically created
2. This PR will:
   - Bump package versions based on changesets
   - Update changelogs
   - Delete consumed changeset files
3. When ready to publish, merge the "Version Packages" PR
4. The CI workflow will automatically publish packages to npm

## Available Scripts

- `pnpm run changeset` - Create a new changeset
- `pnpm run version` - Apply changesets and bump versions (used by CI)
- `pnpm run release` - Publish packages to npm (used by CI)
- `pnpm run publish:canary` - Publish canary releases
- `pnpm run publish:next` - Publish next/pre-releases

## CI/CD Integration

The release workflow (`.github/workflows/release.yml`) runs on:
- Manual trigger (workflow_dispatch)
- Pushes to the main branch

It uses the [changesets/action](https://github.com/changesets/action) to:
1. Create/update the "Version Packages" PR when changesets exist
2. Publish packages when the version PR is merged

## Limitations

### Peer Dependency Version Updates

When using changesets in a monorepo, peer dependencies are automatically updated from range versions (e.g., `^7`) to specific versions (e.g., `^7.3.5`) during the release process. This is built-in behavior with no direct configuration option to disable it.

#### Why This Happens
Changesets updates peer dependency versions to ensure version consistency across the monorepo. When a package is released, changesets will:
1. Update the package version
2. Update all internal dependencies that reference this package
3. **Update peer dependencies to match the exact published version**

#### Example
If `@gasket/plugin-logger` is at version `7.3.5`, and another package has:
```json
"peerDependencies": {
  "@gasket/plugin-logger": "^7"
}
```

After running `changeset version`, it becomes:
```json
"peerDependencies": {
  "@gasket/plugin-logger": "^7.3.5"
}
```

#### Relevant Links
- [Changesets Decisions - Versioning of Peer Dependencies](https://github.com/changesets/changesets/blob/main/docs/decisions.md#the-versioning-of-peer-dependencies)
- [#822 - Add an option to avoid major bump when peerDep has changed](https://github.com/changesets/changesets/issues/822)
- [#542 - Add new config option for always upgrading internal dependents](https://github.com/changesets/changesets/pull/542)

#### Workarounds
1. **Manual Updates**: Update the version packages PR to revert peer dependency changes before merging
2. **Post-process Script**: Add a script that runs after `changeset version` to revert changes
3. **Accept the Behavior**: Consider whether exact versions might be beneficial for consistency

## Best Practices

1. **One changeset per feature/fix**: Create focused changesets that describe a single change
2. **Clear summaries**: Write descriptive summaries that will be meaningful in changelogs
3. **Correct version bumps**: 
   - `patch` - Bug fixes, dependency updates
   - `minor` - New features, backward-compatible changes
   - `major` - Breaking changes
4. **Review generated changelogs**: Check the "Version Packages" PR to ensure changes look correct

## Troubleshooting

### Missing changesets
If CI complains about missing changesets, but your change doesn't affect any packages:
- Create an empty changeset: `pnpm run changeset --empty`

### Changeset not detected
Ensure the changeset file is committed and pushed with your PR.

### Version conflicts
If you see version conflicts, ensure your branch is up to date with `main`.

## Additional Resources

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Changesets Workflow Guide](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
- [Common Questions](https://github.com/changesets/changesets/blob/main/docs/common-questions.md) 