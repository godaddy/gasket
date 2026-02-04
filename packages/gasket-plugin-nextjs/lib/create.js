/// <reference types="@gasket/plugin-intl" />
/// <reference types="create-gasket-app" />

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, devDependencies } = packageJson;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Type definitions for create-gasket-app APIs.
 * These typedefs allow us to use short, readable type names throughout the file
 * instead of repeating the long import statements.
 * @typedef {import('create-gasket-app').Files} Files
 * @typedef {import('create-gasket-app').PackageJsonBuilder} PackageJsonBuilder
 * @typedef {import('create-gasket-app').Readme} Readme
 * @typedef {import('create-gasket-app').ConfigBuilder} ConfigBuilder
 */

/**
 * createAppFiles
 * @param {object} options - Configuration options
 * @param {Files} options.files - The Gasket Files API.
 * @param {string} options.generatorDir - The directory of the generator.
 * @param {string} options.nextServerType - Selected server type from prompt
 * @param {string} options.appStructure - Structure of the app
 * @param {boolean} options.typescript - Selected typescript from prompt
 * @param {Readme} options.readme - The Gasket Readme API.
 */
async function createAppFiles({
  files,
  generatorDir,
  nextServerType,
  appStructure,
  typescript,
  readme
}) {
  const globIgnore = typescript ? '!(*.js|*.jsx)' : '!(*.ts|*.tsx)';

  files.add(
    `${generatorDir}/app/${appStructure}/**/${globIgnore}`
  );

  await readme.markdownFile(`${generatorDir}/markdown/${appStructure}.md`);
  if (nextServerType === 'customServer') {
    await readme.markdownFile(`${generatorDir}/markdown/custom-server.md`);
    readme.link('Custom Server', 'https://nextjs.org/docs/pages/building-your-application/configuring/custom-server');
  }

  if (appStructure === 'app-router') {
    readme.link('App Router', 'https://nextjs.org/docs/app');
  } else {
    readme.link('Page Router', 'https://nextjs.org/docs/pages');
  }
}

/**
 * createTestFiles
 * @param {object} options - Configuration options
 * @param {Files} options.files - The Gasket Files API.
 * @param {string} options.generatorDir - The directory of the generator.
 * @param {Array<string>} options.testPlugins - Array of selected test plugins
 * @param {string} options.appStructure - Structure of the app
 * @param {boolean} options.typescript - Selected typescript from prompt
 */
function createTestFiles({ files, generatorDir, testPlugins, appStructure, typescript }) {
  if (!testPlugins || testPlugins.length === 0) return;
  const unit = ['jest', 'mocha', 'vitest'];
  const integration = ['cypress'];
  const frameworks = [...unit, ...integration];
  const frameworksRegex = new RegExp(frameworks.join('|'));
  const globIgnore = typescript ? '!(*.js|*.jsx)' : '!(*.ts|*.tsx)';

  testPlugins.forEach((testPlugin) => {
    const match = frameworksRegex.exec(testPlugin);
    if (match) {
      const matchedFramework = match[0];
      if (unit.includes(matchedFramework)) {
        files.add(
          `${generatorDir}/${matchedFramework}/${appStructure}/*`,
          `${generatorDir}/${matchedFramework}/${appStructure}/**/${globIgnore}`
        );
      } else {
        files.add(`${generatorDir}/${matchedFramework}/*`, `${generatorDir}/${matchedFramework}/**/*`);
      }
    }
  });
}

/**
 * createNextFiles - Add next.config.js & server.mjs to files
 * @param {object} options - Configuration options
 * @param {Files} options.files - The Gasket Files API.
 * @param {string} options.generatorDir - The directory of the generator.
 * @param {boolean} options.nextDevProxy - Selected dev proxy from prompt
 * @param {boolean} options.typescript - Selected typescript from prompt
 * @param {string} options.nextServerType - Selected server type from prompt
 */
function createNextFiles({ files, generatorDir, nextDevProxy, typescript, nextServerType }) {
  let glob;

  // TS specific next.config.js
  if (typescript) {
    glob = `${generatorDir}/next/typescript/*`;
    // if no proxy and using defaultServer, add next.config.js
  } else if (!nextDevProxy && nextServerType !== 'customServer') {
    glob = `${generatorDir}/next/*(next.config).js`;
    // if proxy or customServer, add server.js & next.config.js
  } else {
    glob = `${generatorDir}/next/*.js`;
  }

  files.add(glob);
}

/**
 * configureSitemap
 * @param {object} options - Configuration options
 * @param {Files} options.files - The Gasket Files API.
 * @param {PackageJsonBuilder} options.pkg - The Gasket PackageJson API.
 * @param {string} options.generatorDir - The directory of the generator.
 */
function configureSitemap({ files, pkg, generatorDir }) {
  pkg.add('dependencies', {
    'next-sitemap': '^3.1.29'
  });

  files.add(`${generatorDir}/sitemap/*`);
  pkg.add('scripts', {
    sitemap: 'next-sitemap'
  });
}

/**
 * addDependencies
 * @param {object} options - Configuration options
 * @param {PackageJsonBuilder} options.pkg - The Gasket PackageJson API.
 * @param {boolean} options.typescript - Selected typescript from prompt
 */
function addDependencies({ pkg, typescript }) {
  pkg.add('dependencies', {
    '@gasket/assets': devDependencies['@gasket/assets'],
    '@gasket/nextjs': devDependencies['@gasket/nextjs'],
    [name]: `^${version}`,
    'next': devDependencies.next,
    'react': devDependencies.react,
    'react-dom': devDependencies['react-dom']
  });

  // Add nodemon for dev if not using TS
  if (typescript === false) {
    pkg.add('devDependencies', {
      nodemon: devDependencies.nodemon
    });
  } else {
    pkg.add('dependencies', {
      '@types/react': devDependencies['@types/react']
    });
  }
}

/**
 * getRunCommand - Get the run command based on package manager
 * @param {string} packageManager - Selected package manager
 * @returns {string} - The run command
 */
function getRunCommand(packageManager) {
  if (packageManager === 'yarn') return 'yarn';
  if (packageManager === 'pnpm') return 'pnpm';
  return 'npm run';
}

/**
 * addCustomServerScripts - Add scripts for custom server setup
 * @param {Record<string, string>} scripts - Scripts object to modify
 * @param {object} options - Configuration options
 * @param {string} options.runCmd - Run command
 * @param {string} options.watcher - Watcher command
 * @param {string} options.fileExtension - File extension
 * @param {boolean} options.typescript - Whether typescript is enabled
 */
function addCustomServerScripts(scripts, { runCmd, watcher, fileExtension, typescript }) {
  scripts.start = 'node server.js';
  scripts.local = `GASKET_DEV=1 ${watcher} server.${fileExtension}`;
  if (typescript) {
    scripts['build:tsc'] = 'tsc -p ./tsconfig.server.json';
    scripts['build:tsc:watch'] = 'tsc -p ./tsconfig.server.json --watch';
    scripts.build = `${runCmd} build:tsc && next build --webpack`;
    scripts.start = 'node dist/server.js';
    scripts.local = `concurrently "${runCmd} build:tsc:watch" "GASKET_DEV=1 ${watcher} server.${fileExtension}"`;
  }
}

/**
 * addDevProxyScripts - Add scripts for dev proxy setup
 * @param {Record<string, string>} scripts - Scripts object to modify
 * @param {object} options - Configuration options
 * @param {string} options.runCmd - Run command
 * @param {string} options.watcher - Watcher command
 * @param {string} options.fileExtension - File extension
 * @param {boolean} options.typescript - Whether typescript is enabled
 */
function addDevProxyScripts(scripts, { runCmd, watcher, fileExtension, typescript }) {
  scripts['start:https'] = `node server.js`;
  scripts['local:https'] = `${watcher} server.${fileExtension}`;
  scripts.start = `${runCmd} start:https & next start`;
  scripts.local = `${runCmd} local:https & next dev --webpack`;
  if (typescript) {
    scripts['build:tsc:watch'] = 'tsc -p ./tsconfig.server.json --watch';
    scripts['build:tsc'] = 'tsc -p ./tsconfig.server.json';
    scripts.build = `${runCmd} build:tsc && next build --webpack`;
    scripts['start:https'] = `node dist/server.js`;
    scripts.local = `concurrently "${runCmd} build:tsc:watch" "${runCmd} local:https" "next dev --webpack"`;
  }
}

/**
 * addNpmScripts
 * @param {object} options - Configuration options
 * @param {PackageJsonBuilder} options.pkg - The Gasket PackageJson API.
 * @param {string} options.nextServerType - Selected server type from prompt
 * @param {boolean} options.nextDevProxy - Selected dev proxy from prompt
 * @param {boolean} options.typescript - Selected typescript from prompt
 * @param {boolean} options.hasGasketIntl - Selected gasket-intl from prompt
 * @param {string} options.packageManager - Selected package manager
 */
function addNpmScripts({ pkg, nextServerType, nextDevProxy, typescript, hasGasketIntl, packageManager }) {
  const fileExtension = typescript ? 'ts' : 'js';
  const bin = typescript ? 'tsx' : 'node';
  const watcher = typescript ? 'tsx watch' : 'nodemon';
  const runCmd = getRunCommand(packageManager);
  const prebuild = hasGasketIntl ? { prebuild: `${bin} gasket.${fileExtension} build` } : {};

  const scripts = {
    build: 'next build --webpack',
    start: 'next start',
    local: 'next dev --webpack',
    preview: `${runCmd} build && ${runCmd} start`,
    ...prebuild
  };

  if (nextServerType === 'customServer') {
    addCustomServerScripts(scripts, { runCmd, watcher, fileExtension, typescript });
  } else if (nextDevProxy) {
    addDevProxyScripts(scripts, { runCmd, watcher, fileExtension, typescript });
  }

  pkg.add('scripts', scripts);
}

/**
 * addConfig
 * @param {object} options - Configuration options
 * @param {ConfigBuilder} options.gasketConfig - The Gasket config API
 * @param {boolean} options.nextDevProxy - Selected dev proxy from prompt
 * @param {string} options.nextServerType - Selected server type from prompt
 */
function addConfig({ gasketConfig, nextDevProxy, nextServerType }) {
  gasketConfig.addPlugin('pluginNextjs', name);

  if (nextDevProxy && nextServerType !== 'customServer') {
    gasketConfig.add('httpsProxy', {
      protocol: 'http',
      hostname: 'localhost',
      port: 80,
      xfwd: true,
      ws: true,
      target: {
        host: 'localhost',
        port: 3000
      }
    });
  }
}

export default {
  timing: {
    before: [
      '@gasket/plugin-intl',
      '@gasket/plugin-docusaurus'
    ]
  },
  /**
   * Add files & extend package.json for new apps.
   * @type {import('@gasket/core').HookHandler<'create'>}
   */
  handler: async function create(gasket, context) {
    const {
      files,
      pkg,
      readme,
      testPlugins,
      addSitemap,
      nextServerType,
      nextDevProxy,
      typescript,
      hasGasketIntl
    } = context;

    // Set the default package name for react-intl. Plugins later in the lifecycle may override this with a custom value if
    // needed.
    if (hasGasketIntl) {
      context.reactIntlPkg = 'react-intl';
    }

    const generatorDir = `${__dirname}/../generator`;
    const appStructure = nextServerType === 'appRouter' ? 'app-router' : 'page-router';

    await createAppFiles({ files, generatorDir, nextServerType, appStructure, typescript, readme });
    createTestFiles({ files, generatorDir, testPlugins, appStructure, typescript });
    createNextFiles({ files, generatorDir, nextDevProxy, typescript, nextServerType });
    addDependencies({ pkg, typescript });
    addNpmScripts({ pkg, nextServerType, nextDevProxy, typescript, hasGasketIntl, packageManager: context.packageManager });
    addConfig(context);
    if (addSitemap) configureSitemap({ files, pkg, generatorDir });
  }
};
