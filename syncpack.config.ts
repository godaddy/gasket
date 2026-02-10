import type { RcFile } from 'syncpack';

const config: RcFile = {
  customTypes: {
    dependencies: {
      strategy: 'versionsByName',
      path: 'dependencies'
    },
    devDependencies: {
      strategy: 'versionsByName',
      path: 'devDependencies'
    }
  },
  dependencyTypes: ['dependencies', 'devDependencies'],
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
    'module',
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
  versionGroups: [{
    label: 'workspace-packages',
    dependencies: [
      'create-gasket-app',
      '@gasket/*'
    ],
    dependencyTypes: ['dependencies', 'devDependencies'],
    pinVersion: 'workspace:^'
  }],
  lintFormatting: true,
  lintSemverRanges: true,
  lintVersions: true
};

export default config;
