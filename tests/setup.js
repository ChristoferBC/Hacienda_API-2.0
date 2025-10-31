// Jest setup file - runs before each test file
const config = require('../src/config');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce logging during tests

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Keep native error and warn for debugging
  error: console.error,
  warn: console.warn,
  // Mock info and log to reduce test output noise
  info: jest.fn(),
  log: jest.fn(),
  debug: jest.fn(),
};

// Global test timeout for async operations
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Helper to wait for promises
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper to generate test data
  generateTestConsecutivo: () => {
    const timestamp = Date.now().toString().slice(-10);
    return `00100101${timestamp}`;
  },
  
  generateTestClave: () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 50; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
};

// Global setup for all tests
beforeAll(async () => {
  // Any global setup that needs to run before all tests
});

// Global cleanup for all tests
afterAll(async () => {
  // Any global cleanup that needs to run after all tests
});

// Setup for each test file
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

// Cleanup for each test file
afterEach(() => {
  // Any cleanup that needs to run after each test
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection in test:', reason);
  // Don't exit the process during tests, just log
});

// Handle uncaught exceptions in tests
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception in test:', error);
  // Don't exit the process during tests, just log
});

module.exports = {};