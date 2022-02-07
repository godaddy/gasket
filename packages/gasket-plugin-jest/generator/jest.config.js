const nextJest = require('next/jest');
const pathToApp = 'pages';
const createJestConfig = nextJest(pathToApp);

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: ['**/*.js'],
  testURL: 'http://localhost/'
};

module.exports = createJestConfig(customJestConfig);
