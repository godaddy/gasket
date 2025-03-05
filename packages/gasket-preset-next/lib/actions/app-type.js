import { join } from 'path';
import deps from '../../generator/dependencies.json' with { type: 'json' };

export default async function handleAppType(context) {
  const {
    nextServerType,
    nextDevProxy,
    typescript,
    FileSet,
    pkg,
    gasketConfig,
    setBasePackageFilePath
  } = context;

  // POC only appRouter
  if (nextServerType !== 'appRouter') return;

  const appType = typescript ? 'ts' : 'js';
  FileSet.add(`${appType}/*`);
  setBasePackageFilePath(join(import.meta.dirname, '..', '..', 'generator', 'app-router', appType, 'package.json'));

  if (nextDevProxy) {
    // Add import for plugin
    gasketConfig.addPlugin('pluginHttpsProxy', '@gasket/plugin-https-proxy');

    // Add config
    gasketConfig.add('httpsProxy', {
      protocol: 'http',
      hostname: 'localhost',
      port: 8080,
      xfwd: true,
      ws: true,
      SNICallback: () => { },
      ssl: false,
      target: {
        host: 'localhost',
        port: 3000
      }
    });

    // Add plugin
    pkg.add('dependencies', {
      '@gasket/plugin-https-proxy': deps['@gasket/plugin-https-proxy']
    });

    // Add scripts
    pkg.add('scripts', {
      'start:https': 'node dist/server.js',
      'local:https': 'tsx watch server.ts',
      'build:tsc:watch': 'tsc -p ./tsconfig.server.json --watch',
      'build:tsc': 'tsc -p ./tsconfig.server.json'
    });

    FileSet.add(`${appType}/_variants/server.${appType}`);
    typescript && FileSet.add(`${appType}/_variants/tsconfig.server.json`);
  }
}
