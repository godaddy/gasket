/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  // roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',
  collectCoverage: true,
  verbose: true,
  coverageThreshold: {
    global: {
      lines: 80
    }
  },
  coverageDirectory: './coverage',
  preset: 'ts-jest',
  cacheDirectory: './tmp/jest',
  testMatch: ['**/test/**/*.*(test|spec).ts?(x)'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/lib/', '<rootDir>/coverage/'],
  coverageReporters: ['cobertura', 'text', 'text-summary', 'html'],
  transform: {
    '\\.tsx?$': 'ts-jest',
    '\\.jsx?$': 'babel-jest'
  },
  transformIgnorePatterns: ['node_modules/(?!(redux-persist)/)'],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.jest.json'
    }
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node', 'd.ts'],
  moduleNameMapper: {
    '^.+\\.(css|scss)$': '<rootDir>/uxCssConfig.js'
  }
};
