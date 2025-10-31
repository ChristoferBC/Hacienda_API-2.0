module.exports = {
  env: {
    browser: false,
    node: true,
    es2021: true,
    jest: true,
  },
  
  extends: [
    'airbnb-base',
    'plugin:jest/recommended',
  ],
  
  plugins: [
    'jest',
  ],
  
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  
  rules: {
    // General JavaScript rules
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    
    // Import rules
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': ['error', { 
      devDependencies: [
        'tests/**/*',
        '**/*.test.js',
        '**/*.spec.js',
        'jest.config.js',
      ],
    }],
    
    // Code style rules
    'max-len': ['error', { 
      code: 120, 
      tabWidth: 2, 
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
    
    'no-underscore-dangle': ['error', { 
      allowAfterThis: true,
      allowAfterSuper: true,
      allow: ['_id', '_generateTimestamp', '_ensureInitialized'],
    }],
    
    // Function rules
    'func-names': 'off',
    'prefer-arrow-callback': 'off',
    
    // Object rules
    'no-param-reassign': ['error', { 
      props: true,
      ignorePropertyModificationsFor: [
        'acc', // for reduce accumulators
        'accumulator', // for reduce accumulators
        'e', // for e.returnvalue
        'ctx', // for Koa routing
        'req', // for Express requests
        'res', // for Express responses
      ],
    }],
    
    // Error handling
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'error',
    
    // Async/await
    'no-await-in-loop': 'off', // Sometimes needed for sequential operations
    
    // Variables
    'no-unused-vars': ['error', { 
      vars: 'all',
      args: 'after-used',
      ignoreRestSiblings: true,
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    
    // Comments
    'spaced-comment': ['error', 'always', {
      line: {
        markers: ['/'],
        exceptions: ['-', '+'],
      },
      block: {
        markers: ['!'],
        exceptions: ['*'],
        balanced: true,
      },
    }],
  },
  
  // Override rules for specific file patterns
  overrides: [
    {
      // Test files
      files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
      rules: {
        'no-console': 'off',
        'import/no-extraneous-dependencies': 'off',
        'jest/expect-expect': 'error',
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',
      },
    },
    
    {
      // Configuration files
      files: ['*.config.js', '.eslintrc.js'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
    
    {
      // Scripts
      files: ['scripts/**/*.js'],
      rules: {
        'no-console': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
  
  // Global variables
  globals: {
    testUtils: 'readonly',
  },
  
  // Settings
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.json'],
      },
    },
  },
};