module.exports = {
  collectCoverageFrom: [
    'lib/**/*.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  projects: [
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['**/test/server.spec.js']
    },
    {
      displayName: 'browser',
      testEnvironment: 'jsdom',
      testMatch: ['**/test/browser.spec.js']
    }
  ]
};
