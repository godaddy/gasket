import nextJest from 'next/jest.js';
const pathToApp = 'pages';
const createJestConfig = nextJest(pathToApp);

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: ['**/*.js'],
  testEnvironmentOptions: {
    url: 'http://localhost/'
  }
};

export default createJestConfig(customJestConfig);
