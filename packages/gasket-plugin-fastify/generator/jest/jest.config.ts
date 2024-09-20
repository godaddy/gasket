import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  injectGlobals: true,
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+.ts$': ['ts-jest', { useESM: true }]
  }
};

export default config;

