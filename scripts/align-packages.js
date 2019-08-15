/* eslint-disable no-console, no-sync */

const fs = require('fs');
const path = require('path');
const {
  promisify
} = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const prettyPrint = json => JSON.stringify(json, null, '  ') + '\n';

const projectRoot = path.resolve(__dirname, '..');


// package dependencies

const depVersions = {
  '@babel/cli': '^7.5.5',
  '@babel/core': '^7.5.5',
  '@babel/node': '^7.5.5',
  '@babel/runtime': '^7.5.5',
  '@babel/plugin-transform-runtime': '^7.5.5',
  '@babel/preset-env': '^7.5.5',
  '@babel/preset-react': '^7.0.0',

  'jest': '^24.8.0',
  'assume': '^2.2.0',
  'sinon': '^7.4.1',
  'assume-sinon': '^1.0.1',
  'mocha': '^6.2.0',
  'chai': '^4.2.0',

  'react': '^16.8.6',
  'react-dom': '^16.8.6',
  'redux': '^4.0.4',

  'babel-eslint': '^10.0.2',
  'eslint': '^6.1.0',
  'eslint-config-godaddy': '^4.0.0',
  'eslint-config-godaddy-react': '^6.0.0',
  'eslint-plugin-json': '^1.4.0',
  'eslint-plugin-jest': '^22.15.1',
  'eslint-plugin-mocha': '^6.0.0',
  'eslint-plugin-react': '^7.14.0',

  'enzyme': '^3.10.0',
  'enzyme-adapter-react-16': '^1.14.0'
};


// order properties

const pkgOrder = [
  'name',
  'version',
  'description',
  'main',
  'browser',
  'module',
  'bin',
  'files',
  'scripts',
  'repository',
  'keywords',
  'author',
  'maintainers',
  'license',
  'bugs',
  'homepage',
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'eslintConfig',
  'eslintIgnore',
  'gasket'
];

//

const scriptsOrder = [
  'lint',
  'lint:fix',
  'lint:fix:all',
  'stylelint',
  'mocha',
  'jest',
  'pretest',
  'test',
  'posttest',
  'test:runner',
  'test:watch',
  'test:coverage',
  'build',
  'build:watch',
  'prepack',
  'postpack',
  'prepublish',
  'prepublishOnly'
];


const orderedSort = arr => (a, b) => {
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


function sortKeys(obj, attr, compare) {
  const target = attr ? obj[attr] : obj;

  if (!target) return obj;

  const ordered = {};
  Object.keys(target).sort(compare).forEach(function (key) {
    ordered[key] = target[key];
  });

  if (attr) {
    obj[attr] = ordered;
  }
  return attr ? obj : ordered;
}


function alignDeps(obj, attr) {
  if (!obj[attr]) return obj;

  const deps = Object.keys(obj[attr]);
  const updated = {};

  deps.forEach(dep => {
    updated[dep] = depVersions[dep] || obj[attr][dep];
  });
  obj[attr] = updated;
  return obj;
}


function fixedProperties(pkgJson) {

  pkgJson.author = 'GoDaddy Operating Company, LLC';
  pkgJson.repository = {
    type: 'git',
    url: 'git+ssh://git@github.com/godaddy/gasket.git'
  };
  pkgJson.license = 'MIT';
  pkgJson.bugs = {
    url: 'https://github.com/godaddy/gasket/issues'
  };
}


async function fixupPackage(pkgPath) {
  let pkgJson;
  try {
    pkgJson = JSON.parse(await readFile(pkgPath));
  } catch (e) {
    console.error(e.message);
    return;
  }

  fixedProperties(pkgJson);

  pkgJson = sortKeys(pkgJson, null, orderedSort(pkgOrder));
  pkgJson = sortKeys(pkgJson, 'scripts', orderedSort(scriptsOrder));
  pkgJson = sortKeys(pkgJson, 'peerDependencies');
  pkgJson = sortKeys(pkgJson, 'dependencies');
  pkgJson = sortKeys(pkgJson, 'devDependencies');

  pkgJson = alignDeps(pkgJson, 'dependencies');
  pkgJson = alignDeps(pkgJson, 'devDependencies');

  await writeFile(pkgPath, prettyPrint(pkgJson));
  console.log('aligned', path.relative(projectRoot, pkgPath));
}


async function loadPackages() {
  const packagesDir = path.join(projectRoot, 'packages');

  const paths = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('gasket'))
    .map(dirent => path.join(packagesDir, dirent.name, 'package.json'));

  paths.push(path.join(projectRoot, 'package.json'));

  await Promise.all(paths.map(pkgPath => fixupPackage(pkgPath)));
  console.log('Finished.');
}

loadPackages();
