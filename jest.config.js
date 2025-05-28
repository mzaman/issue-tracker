// jest.config.js
module.exports = {
  testEnvironment: 'node',           // Use Node environment for backend testing
  verbose: true,                     // Detailed test results
  bail: 1,                          // Stop after first failure for quick feedback
  testTimeout: 30000,                // 30s timeout for async tests
  collectCoverage: true,             // Enable coverage reports
  coverageDirectory: './coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],

  // These are treated as regex patterns, so use proper regex
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],

  moduleFileExtensions: ['js', 'json'],

  // Pattern to match test files
  testMatch: [
    "**/test/**/*.test.js",          // for test folder with .test.js files
    "**/test/**/*.spec.js",          // for test folder with .spec.js files
    "**/__tests__/**/*.test.js"
  ],

  // Setup files for globals, mocks, extensions
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

  resetMocks: true,
  restoreMocks: true,
  clearMocks: true,
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};