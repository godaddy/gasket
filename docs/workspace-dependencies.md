# Local Package Development: Managing Workspace Dependencies

When developing and testing Gasket packages locally, you'll need to handle workspace dependencies differently. The `replace-ws-aliases` script is essential for this process.

## Why It's Necessary

When creating packages that use workspace packages (marked with `workspace:*`), these dependencies won't work outside your local workspace. This becomes problematic when:

- Troubleshooting package issues
- Sharing packages with others
- Using packages in CI/CD environments

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

3. After running the script, your packages will be ready for local testing.

## When to Use

- Before testing packages locally
- When troubleshooting package issues
- Before sharing packages with others
- When preparing packages for CI/CD

## Important Notes

- Always run this script before testing packages locally
- The script handles all dependency types (dependencies, devDependencies, peerDependencies, optionalDependencies)
- After testing, you may want to revert the changes if you're still developing the package
- The script preserves the `^` version prefix to allow for minor version updates
