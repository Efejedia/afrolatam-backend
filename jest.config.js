module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: false,
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 60000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup/testSetup.js'],
  transformIgnorePatterns: [
    '/node_modules/(?!(nanoid)/)'
  ],
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: '<rootDir>/test-report',
        filename: 'report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'AfroLatam Connect API - Test Report',
        customInfos: [
          { title: 'Project', value: 'AfroLatam Connect API' },
          { title: 'Environment', value: 'Test' },
        ],
      },
    ],
  ],
  moduleFileExtensions: ['js', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/test-report/'],
};