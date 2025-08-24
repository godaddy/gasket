# @gasket/utils Examples

This document provides working examples for each exported function and class from `@gasket/utils`.

## applyConfigOverrides

Merge configuration with environment and command-specific overrides.

```javascript
import { applyConfigOverrides } from '@gasket/utils';

const baseConfig = {
  port: 3000,
  apiUrl: 'https://api.example.com',
  environments: {
    dev: {
      port: 8080,
      apiUrl: 'https://dev-api.example.com'
    },
    'prod.us-east': {
      apiUrl: 'https://us-east.api.example.com'
    }
  },
  commands: {
    build: {
      minify: true
    }
  }
};

// Apply dev environment overrides
const devConfig = applyConfigOverrides(baseConfig, { env: 'dev' });
console.log(devConfig.port); // 8080
console.log(devConfig.apiUrl); // 'https://dev-api.example.com'

// Apply command-specific overrides
const buildConfig = applyConfigOverrides(baseConfig, {
  env: 'prod',
  commandId: 'build'
});
console.log(buildConfig.minify); // true

// Apply sub-environment overrides
const prodEastConfig = applyConfigOverrides(baseConfig, {
  env: 'prod.us-east'
});
console.log(prodEastConfig.apiUrl); // 'https://us-east.api.example.com'
```

## runShellCommand

Execute shell commands with Promise-based interface.

```javascript
import { runShellCommand } from '@gasket/utils';

// Basic command execution
async function basicExample() {
  try {
    const result = await runShellCommand('echo', ['Hello, World!']);
    console.log(result.stdout); // 'Hello, World!\n'
  } catch (error) {
    console.error('Command failed:', error.message);
  }
}

// With custom options and working directory
async function customOptionsExample() {
  const result = await runShellCommand('ls', ['-la'], {
    cwd: '/tmp'
  });
  console.log(result.stdout);
}

// With AbortController for timeouts
async function timeoutExample() {
  const controller = new AbortController();

  // Abort after 5 seconds
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const result = await runShellCommand('sleep', ['10'], {
      signal: controller.signal
    });
    console.log('Command completed');
  } catch (error) {
    if (error.aborted) {
      console.log('Command was aborted');
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

// With debug output
async function debugExample() {
  // Fourth parameter enables debug mode - pipes output to process stdout/stderr
  await runShellCommand('npm', ['--version'], {}, true);
}
```

## PackageManager

Class for managing package manager operations (npm, yarn, pnpm).

```javascript
import { PackageManager } from '@gasket/utils';

// Basic usage with npm (defaults to pnpm if not specified)
const npmManager = new PackageManager({
  packageManager: 'npm',
  dest: '/path/to/project'
});

// Install dependencies
async function installExample() {
  await npmManager.install();
  // With additional args
  await npmManager.install(['--production']);
}

// Link packages
async function linkExample() {
  await npmManager.link(); // Link current package
  await npmManager.link(['@my-org/shared-lib']); // Link specific packages
}

// Execute custom commands
async function execExample() {
  await npmManager.exec('run', ['build']);
  await npmManager.exec('test', ['--coverage']);
}

// Get package info
async function infoExample() {
  const info = await npmManager.info(['react']);
  console.log(info.data.version); // Latest version
  console.log(info.stdout); // Raw output
}

// Using with yarn
const yarnManager = new PackageManager({
  packageManager: 'yarn',
  dest: './my-project'
});

await yarnManager.install();

// Using with pnpm
const pnpmManager = new PackageManager({
  packageManager: 'pnpm',
  dest: './my-project'
});

await pnpmManager.install();

// Static methods for direct package manager access
async function staticMethodsExample() {
  // Direct npm execution
  await PackageManager.spawnNpm(['install', 'lodash'], {
    cwd: './project'
  });

  // Direct yarn execution
  await PackageManager.spawnYarn(['add', 'react'], {
    cwd: './project'
  });

  // Direct pnpm execution
  await PackageManager.spawnPnpm(['install'], {
    cwd: './project'
  });
}
```

## warnIfOutdated

Check if a package is outdated and display a warning.

```javascript
import { warnIfOutdated } from '@gasket/utils';

// Check if current package is outdated
async function checkPackageVersion() {
  // This will check npm for the latest version and warn if current version is older
  await warnIfOutdated('@gasket/core', '7.0.0');

  // If a newer version exists, outputs:
  // › Warning: @gasket/core update available from 7.1.0 to 7.0.0
  // Note: The message format shows "from latest to current" which may be confusing
}

// Check multiple packages
async function checkMultiplePackages() {
  const packages = [
    { name: '@gasket/core', version: '7.0.0' },
    { name: 'react', version: '17.0.0' },
    { name: 'next', version: '12.0.0' }
  ];

  for (const pkg of packages) {
    await warnIfOutdated(pkg.name, pkg.version);
  }
}

// The function uses caching to avoid excessive npm registry calls
// Cache is stored for 7 days before checking again
```

## getPackageLatestVersion

Get the latest version of a package from npm registry.

```javascript
import { getPackageLatestVersion } from '@gasket/utils';

// Get latest version of a package
async function getLatestVersion() {
  try {
    const version = await getPackageLatestVersion('react');
    console.log(`Latest React version: ${version}`);
  } catch (error) {
    console.error('Failed to get package version:', error);
  }
}

// With custom options (passed to underlying spawn)
async function getVersionWithOptions() {
  const version = await getPackageLatestVersion('@gasket/core', {
    timeout: 10000 // 10 second timeout
  });
  console.log(version);
}

// Check multiple packages
async function checkMultipleVersions() {
  const packages = ['react', 'vue', '@angular/core'];

  const versions = await Promise.all(
    packages.map(pkg => getPackageLatestVersion(pkg))
  );

  packages.forEach((pkg, index) => {
    console.log(`${pkg}: ${versions[index]}`);
  });
}

// Use in version comparison
async function compareVersions() {
  const currentVersion = '7.0.0';
  const latestVersion = await getPackageLatestVersion('@gasket/core');

  if (latestVersion !== currentVersion) {
    console.log(`Update available: ${currentVersion} → ${latestVersion}`);
  }
}
```

## Config Import

The package also exports `applyConfigOverrides` from the `/config` subpath:

```javascript
// Alternative import for config utilities
import { applyConfigOverrides } from '@gasket/utils/config';

const config = applyConfigOverrides(baseConfig, { env: 'production' });
```
