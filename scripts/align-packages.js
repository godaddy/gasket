/* eslint-disable no-console, no-sync, max-statements */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Dependency name and expected version range
 * @type {Object.<string,string>}
 */
const depVersions = {
  '@babel/cli': '^7.23.4',
  '@babel/core': '^7.23.7',
  '@babel/node': '^7.22.19',
  '@babel/runtime': '^7.23.8',
  '@babel/register': '^7.23.7',
  '@babel/plugin-transform-runtime': '^7.23.7',
  '@babel/preset-env': '^7.23.8',
  '@babel/preset-react': '^7.23.3',

  'assume': '^2.3.0',
  'sinon': '^14.0.0',
  'assume-sinon': '^1.1.0',
  'mocha': '^10.2.0',
  'chai': '^4.2.0',
  'nyc': '^15.1.0',
  'proxyquire': '^2.1.3',

  'jest': '^29.7.0',

  'react': '^18.2.0',
  'react-dom': '^18.2.0',
  'react-intl': '^6.6.8',
  'prop-types': '^15.8.1',
  'redux': '^4.0.5',
  'next': '^14.0.0',
  'jsdom': '^20.0.0',

  'babel-eslint': '^10.1.0',
  'eslint': '^8.56.0',
  'eslint-config-godaddy': '^7.1.1',
  'eslint-config-godaddy-react': '^9.1.0',
  'eslint-plugin-json': '^3.1.0',
  'eslint-plugin-jest': '^28.6.0',
  'eslint-plugin-mocha': '^10.5.0',
  'eslint-plugin-react': '^7.35.0',
  'eslint-plugin-unicorn': '^55.0.0',

  'deepmerge': '^4.3.1',
  'diagnostics': '^2.0.2',
  'handlebars': '^4.7.8',
  'rimraf': '^3.0.2',
  'glob': '^8.1.0',
  'semver': '^7.5.4',
  'lodash.defaultsdeep': '^4.6.1',
  'webpack': '^5.89.0',
  'serve-static': '^1.15.0',
  'cross-env': '^7.0.3',

  'typescript': '^5.4.5'
};

/**
 * Peer dependency name and expected version range
 * @type {Object.<string,string>}
 */
const peerDepVersions = {
  'next': '^14',
  'react': '^18',
  'react-dom': '^18',
  'redux': '^3.7.2 || ^4.0.1'
};

/**
 * Expected order of the overall package
 * @type {string[]}
 */
const pkgOrder = [
  'name',
  'private',
  'version',
  'description',
  'type',
  'bin',
  'main',
  'browser',
  'types',
  'files',
  'exports',
  'directories',
  'scripts',
  'repository',
  'publishConfig',
  'keywords',
  'author',
  'maintainers',
  'license',
  'bugs',
  'homepage',
  'dependencies',
  'devDependencies',
  'disabled_peerDependencies',
  'peerDependencies',
  'eslintConfig',
  'eslintIgnore',
  'gasket'
];

/**
 * Expected order of scripts
 * @type {string[]}
 */
const scriptsOrder = [
  'lint',
  'lint:fix',
  'lint:fix:all',
  'stylelint',
  'mocha',
  'jest',
  'pretest',
  'test',
  'test:runner',
  'test:watch',
  'test:coverage',
  'test:browser',
  'test:client',
  'test:server',
  'posttest',
  'typecheck',
  'typecheck:watch',
  'build',
  'build:watch',
  'prepack',
  'postpack',
  'prepublish',
  'prepublishOnly'
];

/**
 * Shortcut to stringfy and object in a readable way
 * @param {object} json - Object to stringify very prettily
 * @returns {string} pretty
 */
const prettyPrint = (json) => JSON.stringify(json, null, 2) + '\n';

/**
 * Builds a sort function from an array.
 * Items found in the array will be arranged as listed.
 * Otherwise, they will be sorted alphanumeric at the end.
 * @param {Array} arr - Array of sorted keys
 * @returns {Function} compare
 */
const orderedSort = (arr) => (a, b) => {
  let comparison = 0;
  let aIdx = arr.indexOf(a);
  let bIdx = arr.indexOf(b);

  if (aIdx < 0) aIdx = 100;
  if (bIdx < 0) bIdx = 100;

  if (aIdx > bIdx) {
    comparison = 1;
  } else if (bIdx > aIdx) {
    comparison = -1;
  } else {
    comparison = a > b ? 1 : -1;
  }

  return comparison;
};

/**
 * Takes and object and sorts its keys
 * @param {object} obj - Object with keys to be ordered
 * @param {string} [attr] - name of object property to sort
 * @param {Function} [compare] - optional sort function
 * @returns {object} sorted
 */
function sortKeys(obj, attr, compare) {
  const target = attr ? obj[attr] : obj;

  if (!target) return obj;

  const ordered = {};
  Object.keys(target)
    .sort(compare)
    .forEach(function (key) {
      ordered[key] = target[key];
    });

  if (attr) {
    obj[attr] = ordered;
  }
  return attr ? obj : ordered;
}

/**
 * Adjust versions of dependencies in package match the version expected
 * @param {object} pkgJson - package.json contents
 * @param {string} attr - Either devDependencies or dependencies
 * @param {object} [versions] - Map of dependency to version
 * @returns {object} pkgJson
 */
function alignDeps(pkgJson, attr, versions = {}) {
  if (!pkgJson[attr]) return pkgJson;

  const deps = Object.keys(pkgJson[attr]);
  const updated = {};

  deps.forEach((dep) => {
    updated[dep] = versions[dep] || depVersions[dep] || pkgJson[attr][dep];
  });
  pkgJson[attr] = updated;
  return pkgJson;
}

/**
 * Set standard properties in packages
 * @param {object} pkgJson - package.json contents
 */
function fixedProperties(pkgJson) {
  pkgJson.author = 'GoDaddy Operating Company, LLC';
  pkgJson.repository = {
    type: 'git',
    url: 'git+ssh://git@github.com/godaddy/gasket.git'
  };
  pkgJson.publishConfig = {
    access: 'public'
  };
  pkgJson.license = 'MIT';
  pkgJson.bugs = {
    url: 'https://github.com/godaddy/gasket/issues'
  };
}

/**
 * Checks for expected scripts and warns if missing
 * @param {object} pkgJson - package.json contents
 */
function checkScripts(pkgJson) {
  const { name, scripts } = pkgJson;

  const expected = ['test', 'test:coverage', 'posttest'];

  expected.forEach((s) => {
    if (scripts && !(s in scripts)) {
      console.warn(`${name} does not have script: ${s}`);
    }
  });
}

/**
 * Clears maintainers from package.json
 * @param {object} pkgJson - package.json contents
 */
function checkMaintainers(pkgJson) {
  delete pkgJson.maintainers;
}

/**
 * Check if typecheck scripts are present and adds them if not
 * @param pkgJson
 */
function checkTypecheckScripts(pkgJson) {
  const { scripts } = pkgJson;
  if (scripts.posttest && !scripts.typecheck) {
    // TODO: Remove 'skip' once types have been completed in each package
    pkgJson.scripts['typecheck:skip'] = 'tsc';
    pkgJson.scripts['typecheck:watch'] = 'tsc --watch';
  }
}

/**
 * Check if eslintConfig is present and adds jsdoc recommended typescript flavor
 * @param pkgJson
 */
function checkEslintConfig(pkgJson) {
  const { eslintConfig } = pkgJson;
  if (
    eslintConfig &&
    !eslintConfig.extends.includes('plugin:jsdoc/recommended-typescript-flavor')
  ) {
    pkgJson.eslintConfig.extends.push(
      'plugin:jsdoc/recommended-typescript-flavor'
    );
  }

  if (eslintConfig && !eslintConfig.plugins.includes('jsdoc')) {
    pkgJson.eslintConfig.plugins.push('jsdoc');
  }
}

/**
 * Check if typescript is in devDependencies and adds it if not
 * @param pkgJson
 */
function checkDevDeps(pkgJson) {
  const { devDependencies } = pkgJson;
  if (devDependencies && !devDependencies.typescript) {
    pkgJson.devDependencies.typescript = depVersions.typescript;
  }
}

/**
 * Setup typescript scripts and dependencies
 * @param pkgJson
 */
function setupTypes(pkgJson) {
  const { name } = pkgJson;

  const packagesToSkip = [
    'create-gasket-app',
    '@gasket/assets',
    '@gasket/engine',
    '@gasket/log',
    '@gasket/plugin-command',
    '@gasket/plugin-config',
    '@gasket/plugin-docsify',
    '@gasket/plugin-lifecycle',
    '@gasket/plugin-log',
    '@gasket/plugin-metadata',
    '@gasket/plugin-workbox', // Skip until v7 as workbox-build@4 has no types
    '@gasket/preset-api',
    '@gasket/preset-nextjs',
    '@gasket/resolve',
    '@gasket/typescript-tests',
    '@gasket/repository'
  ];

  if (!packagesToSkip.includes(name)) {
    checkTypecheckScripts(pkgJson);
    checkEslintConfig(pkgJson);
    checkDevDeps(pkgJson);
  }
}

/**
 * Read, fix up, and write out updated package.json file
 * @param {string} pkgPath path to a package.json file
 * @returns {Promise} promise
 */
async function fixupPackage(pkgPath) {
  let pkgJson;
  try {
    pkgJson = JSON.parse(await readFile(pkgPath));
  } catch (e) {
    console.error(e.message);
    return;
  }

  fixedProperties(pkgJson);
  setupTypes(pkgJson);
  checkScripts(pkgJson);
  checkMaintainers(pkgJson);

  if (pkgJson.module) {
    throw new Error('module field is deprecated. Use exports instead.');
  }

  pkgJson = sortKeys(pkgJson, null, orderedSort(pkgOrder));
  pkgJson = sortKeys(pkgJson, 'scripts', orderedSort(scriptsOrder));
  pkgJson = sortKeys(pkgJson, 'peerDependencies');
  pkgJson = sortKeys(pkgJson, 'dependencies');
  pkgJson = sortKeys(pkgJson, 'devDependencies');

  pkgJson = alignDeps(pkgJson, 'dependencies');
  pkgJson = alignDeps(pkgJson, 'devDependencies');
  pkgJson = alignDeps(pkgJson, 'peerDependencies', peerDepVersions);

  await writeFile(pkgPath, prettyPrint(pkgJson));
  console.log('aligned', path.relative(projectRoot, pkgPath));
}

/**
 * Finds all the packages and fixes them up
 * @returns {Promise} promise
 */
async function main() {
  const packagesDir = path.join(projectRoot, 'packages');

  const paths = fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && dirent.name.includes('gasket'))
    .map((dirent) => path.join(packagesDir, dirent.name, 'package.json'));

  paths.push(path.join(projectRoot, 'package.json'));

  await Promise.all(paths.map((pkgPath) => fixupPackage(pkgPath)));
  console.log('Finished.');
}

main();
