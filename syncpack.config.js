/** @type {import("syncpack").RcFile} */
const config = {
  customTypes: {
    dependencies: {
      strategy: 'versionsByName',
      path: 'dependencies'
    },
    devDependencies: {
      strategy: 'versionsByName',
      path: 'devDependencies'
    },
    peerDependencies: {
      strategy: 'versionsByName',
      path: 'peerDependencies'
    }
  },
  dependencyTypes: ['dependencies', 'devDependencies', 'peerDependencies'],
  semverGroups: [
    {
      range: '',
      packages: ['**'],
      dependencyTypes: ['dependencies', 'devDependencies', 'peerDependencies'],
      dependencies: ['nx']
    },
    {
      range: '^',
      dependencyTypes: ['dependencies', 'devDependencies', 'peerDependencies'],
      dependencies: ['**'],
      packages: ['**']
    }
  ],
  sortFirst: [
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
  ],
  versionGroups: [
    {
      label: 'workspace-packages',
      dependencies: [
        'create-gasket-app',
        '@gasket/*',
      ],
      dependencyTypes: ['dependencies', 'devDependencies'],
      pinVersion: 'workspace:*'
    }],
  "lintFormatting": true,
  "lintSemverRanges": true,
  "lintVersions": true,
};

module.exports = config;
