# Local Package Development: Managing Workspace Dependencies

When developing and testing Gasket packages locally, you'll need to handle workspace dependencies differently. The `replace-ws-aliases` script is essential for this process.

**Note:** Presets are deprecated; use templates and `--template-path` when testing locally for new app creation.

## Why It's Necessary

When creating a preset that uses workspace packages (marked with `workspace:*`), these dependencies won't work outside your local workspace. This becomes problematic when:

- Testing the preset locally with `--preset-path`
- Troubleshooting preset issues
- Sharing the preset with others
- Using the preset in CI/CD environments

## How It Works

The script converts workspace dependencies to actual version numbers:

```json
// Before
{
  "dependencies": {
    "@gasket/plugin-1": "workspace:*",
    "@gasket/plugin-2": "workspace:*"
  }
}

// After
{
  "dependencies": {
    "@gasket/plugin-1": "^1.2.3",
    "@gasket/plugin-2": "^2.0.0"
  }
}
```

## Usage

1. Run the script from your workspace root:

```bash
pnpm run replace-ws-aliases
```

2. The script will:
   - Scan all package.json files in your workspace
   - Find all `workspace:*` references
   - Replace them with actual version numbers from your workspace
   - Update the files in place

3. After running the script, your preset will be ready for local testing with:

```bash
pnpm create gasket my-app --preset-path ./path/to/preset
```

## When to Use

- Before testing a preset locally
- When troubleshooting preset issues
- Before sharing a preset with others
- When preparing a preset for CI/CD

## Important Notes

- Always run this script before testing a preset locally
- The script handles all dependency types (dependencies, devDependencies, peerDependencies, optionalDependencies)
- After testing, you may want to revert the changes if you're still developing the preset
- The script preserves the `^` version prefix to allow for minor version updates
