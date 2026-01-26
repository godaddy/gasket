import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Shortcut to stringfy and object in a readable way
 * @param {object} json - Object to stringify very prettily
 * @returns {string} pretty
 */
const prettyPrint = (json) => JSON.stringify(json, null, 2) + '\n';

/**
 * Set standard properties in packages
 * @param {object} pkgJson - package.json contents
 */
function fixedProperties(pkgJson) {
  pkgJson.author = 'GoDaddy Operating Company, LLC';
  pkgJson.repository = 'godaddy/gasket.git';

  pkgJson.publishConfig = {
    access: 'public'
  };
  pkgJson.license = 'MIT';
  pkgJson.bugs = 'https://github.com/godaddy/gasket/issues';
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
 * Ensure homepage matches package location in repo
 * @param {object} pkgJson - package.json contents
 */
function checkHomepage(pkgJson) {
  const { name, homepage } = pkgJson;

  if (name === '@gasket/repository') {
    return;
  }

  const pkgName = name.replace('@gasket/', 'gasket-');

  if (!homepage || !homepage.endsWith(pkgName)) {
    pkgJson.homepage = `https://github.com/godaddy/gasket/tree/main/packages/${pkgName}`;
  }
}

/**
 * Check if typecheck scripts are present and adds them if not
 * @param {object} pkgJson - package.json contents
 */
function checkTypecheckScripts(pkgJson) {
  const { scripts } = pkgJson;
  if (scripts.posttest && !scripts.typecheck) {
    pkgJson.scripts.typecheck = 'tsc';
    pkgJson.scripts['typecheck:watch'] = 'tsc --watch';
  }
}

/**
 * Check if eslintConfig is present and adds jsdoc recommended typescript flavor
 * @param {object} pkgJson - package.json contents
 */
function checkEslintConfig(pkgJson) {
  const { eslintConfig } = pkgJson;

  if (!eslintConfig) return;

  if (!eslintConfig.extends.includes('plugin:jsdoc/recommended-typescript-flavor')) {
    eslintConfig.extends.push('plugin:jsdoc/recommended-typescript-flavor');
  }

  if (!eslintConfig.plugins.includes('jsdoc')) {
    eslintConfig.plugins.push('jsdoc');
  }

  if (!eslintConfig.overrides) {
    eslintConfig.overrides = [];
  }

  const tsOverride = {
    files: ['lib/*.ts'],
    extends: ['godaddy-typescript'],
    rules: {
      'jsdoc/*': 'off'
    }
  };

  const hasTsOverride = eslintConfig.overrides.some(
    (override) =>
      Array.isArray(override.files) &&
      override.files.includes('lib/*.ts') &&
      Array.isArray(override.extends) &&
      override.extends.includes('godaddy-typescript')
  );

  if (!hasTsOverride) {
    eslintConfig.overrides.push(tsOverride);
  }
}

/**
 * Check if typescript is in devDependencies and adds it if not
 * @param {object} pkgJson - package.json contents
 */
function checkDevDeps(pkgJson) {
  const { devDependencies } = pkgJson;
  if (devDependencies && !devDependencies.typescript) {
    pkgJson.devDependencies.typescript = '^5.4.5';
  }
}

/**
 * Setup typescript scripts and dependencies
 * @param {object} pkgJson - package.json contents
 */
function setupTypes(pkgJson) {
  const { name } = pkgJson;

  const packagesToSkip = [
    '@gasket/assets',
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
 * Ensures default dependencies are present in package.json
 * @param {object} pkgJson - package.json contents
 */
function checkDefaultDeps(pkgJson) {
  if (!pkgJson.devDependencies) {
    pkgJson.devDependencies = {};
  }

  if (!pkgJson.devDependencies['eslint-config-godaddy-typescript']) {
    pkgJson.devDependencies['eslint-config-godaddy-typescript'] = '^4.0.3';
  }

  if (!pkgJson.devDependencies.typescript) {
    pkgJson.devDependencies.typescript = '^5.7.3';
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
  checkHomepage(pkgJson);
  checkDefaultDeps(pkgJson);

  if (pkgJson.module) {
    throw new Error('module field is deprecated. Use exports instead.');
  }

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
