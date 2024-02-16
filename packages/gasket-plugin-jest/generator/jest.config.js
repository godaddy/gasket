const nextJest = require('next/jest');
const pathToApp = 'pages';
const createJestConfig = nextJest(pathToApp);

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: ['**/*.js'],
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
  // Parse css imports & style paths
  moduleNameMapper: {
    '^.+\\.(css)$': '<rootDir>/test/style-mock.js',
    '@ux/pivot/styles': '<rootDir>/test/style-mock.js'
  }
};

module.exports = createJestConfig(customJestConfig);
