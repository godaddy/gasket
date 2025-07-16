/**
 * Webpack plugin that prevents process.env.GASKET_ENV from being bundled
 * in browser code to avoid leaking server-side configuration.
 */
class GasketEnvGuardPlugin {
  // No constructor needed - this plugin requires no configuration

  apply(compiler) {
    const pluginName = 'GasketEnvGuardPlugin';

    // Hook into the compilation to scan modules
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      // Hook into the module build process
      compilation.hooks.buildModule.tap(pluginName, (module) => {
        // Skip node_modules
        if (module.resource && module.resource.includes('node_modules')) {
          return;
        }

        // Check for GASKET_ENV usage in the module source
        if (module.resource && this.shouldCheckModule(module.resource)) {
          this.scheduleSourceCheck(compilation, module);
        }
      });
    });
  }

  shouldCheckModule(resourcePath) {
    // Only check JavaScript/TypeScript files that are not in node_modules
    const jsExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];
    return jsExtensions.some(ext => resourcePath.endsWith(ext)) &&
           !resourcePath.includes('node_modules');
  }

  scheduleSourceCheck(compilation, module) {
    // Hook into after module build to check the source
    compilation.hooks.succeedModule.tap('GasketEnvGuardPlugin', (builtModule) => {
      if (builtModule === module && builtModule._source) {
        this.checkModuleSource(compilation, builtModule);
      }
    });
  }

  checkModuleSource(compilation, module) {
    let source = '';

    // Try to get the source code
    if (module._source && module._source.source) {
      source = module._source.source();
    } else if (module.originalSource && module.originalSource.source) {
      source = module.originalSource.source();
    }

    if (source && this.containsGasketEnv(source)) {
      this.handleGasketEnvDetection(compilation, module.resource);
    }
  }

  containsGasketEnv(source) {
    // Remove comments but preserve string patterns that are actual code
    const cleanedSource = source
      // Remove single-line comments
      .replace(/\/\/.*$/gm, '')
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '');

    // Check for various patterns of GASKET_ENV usage
    const patterns = [
      /process\.env\.GASKET_ENV/g,
      /process\.env\['GASKET_ENV'\]/g,
      /process\.env\["GASKET_ENV"\]/g,
      /process\.env\[`GASKET_ENV`\]/g
    ];

    // Check if any pattern matches, but avoid matching inside string literals
    for (const pattern of patterns) {
      const matches = [...cleanedSource.matchAll(pattern)];
      for (const match of matches) {
        const beforeMatch = cleanedSource.substring(0, match.index);

        // Simple check: count unescaped quotes before the match
        // If odd number of quotes, we're likely inside a string
        const singleQuotes = (beforeMatch.match(/(?<!\\)'/g) || []).length;
        const doubleQuotes = (beforeMatch.match(/(?<!\\)"/g) || []).length;
        const backticks = (beforeMatch.match(/(?<!\\)`/g) || []).length;

        // If we're not inside quotes, this is a real match
        if (singleQuotes % 2 === 0 && doubleQuotes % 2 === 0 && backticks % 2 === 0) {
          return true;
        }
      }
    }

    return false;
  }

  handleGasketEnvDetection(compilation, resourcePath) {
    const message = resourcePath ?
      `process.env.GASKET_ENV detected in ${resourcePath}` :
      'process.env.GASKET_ENV detected in browser bundle';

    const error = new Error(
      `${message}!\n\n` +
      `GASKET_ENV is intended for server-side environment configuration only.\n` +
      `Including it in browser bundles can expose sensitive configuration.\n\n` +
      `Recommended solutions:\n` +
      `1. Use gasket.config.env for environment-specific config\n` +
      `2. Use @gasket/data to pass server data to the client\n` +
      `3. Move environment-specific logic to server-side code\n\n` +
      `For more guidance, see: https://gasket.dev/docs/guides/webpack#gasket-env-protection`
    );

    compilation.errors.push(error);
  }
}

module.exports = GasketEnvGuardPlugin;
