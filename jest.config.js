module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js', // Exclude server entry point
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Module paths
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Transform configuration for ES modules if needed
  transform: {},
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Global test variables
  globals: {
    'process.env.NODE_ENV': 'test',
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/docs/',
    '/logs/',
  ],
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Error on deprecated features
  errorOnDeprecated: true,
  
  // Notification settings (optional)
  notify: false,
  
  // Watch plugins for development
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};