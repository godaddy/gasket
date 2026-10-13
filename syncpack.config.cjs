/** @type {import('syncpack').RcFile} */
const config = {
  source: ['packages/*', '!**/{template,test}/**'],
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
  semverGroups: [
    {
      label: 'Use exact versions for nx',
      range: '',
      dependencyTypes: ['dependencies', 'devDependencies'],
      dependencies: ['nx']
    },
    {
      label: 'Use caret for dependencies and devDependencies',
      range: '^',
      dependencyTypes: ['dependencies', 'devDependencies']
    },
    {
      label: 'Ignore everything else',
      isIgnored: true
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
      label: 'Use workspace protocol when developing local packages',
      dependencies: ['$LOCAL'],
      dependencyTypes: ['!local', 'devDependencies', 'dependencies'],
      packages: ['!{{{appName}}}'],
      pinVersion: 'workspace:^'
    },
    {
      label: 'workspace-packages',
      dependencies: ['create-gasket-app', '@gasket/*'],
      dependencyTypes: ['dependencies', 'devDependencies'],
      pinVersion: 'workspace:^'
    },
    {
      label: 'Ignore everything else',
      isIgnored: true
    }
  ]
};

module.exports = config;
