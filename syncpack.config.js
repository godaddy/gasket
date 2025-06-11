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
      dependencyTypes: ['dependencies', 'devDependencies'],
      dependencies: ['nx']
    },
    {
      range: '^',
      dependencyTypes: ['dependencies', 'devDependencies'],
      dependencies: ['**'],
      packages: ['**']
    },
    {
      range: '^',
      dependencyTypes: ['peerDependencies'],
      dependencies: ['**'],
      packages: ['**'],
      precision: 'major' // Use major version only for peer dependencies (e.g., ^18 instead of ^18.0.0)
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
      dependencyTypes: ['dependencies', 'devDependencies', 'peerDependencies'],
      pinVersion: 'workspace:^'
    },
    {
      label: 'external-peer-dependencies',
      dependencies: [
        '**', // All dependencies
        '!create-gasket-app', // Exclude workspace packages
        '!@gasket/*' // Exclude @gasket scoped packages
      ],
      dependencyTypes: ['peerDependencies'],
      policy: 'sameRange' // Ensure same range for external peer dependencies (e.g., all packages use "react": "^18.0.0")
    }],
  "lintFormatting": true,
  "lintSemverRanges": true,
  "lintVersions": true,
};

module.exports = config;
