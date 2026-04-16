import type { Config } from 'jest';

const config: Config = {
  // Use ts-jest to handle TypeScript
  preset: 'ts-jest',

  // Default environment: node (no browser APIs needed for lib/store tests)
  testEnvironment: 'node',

  // Root dirs
  roots: ['<rootDir>/__tests__'],

  // File extensions to transform
  transform: {
    '^.+\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          moduleResolution: 'node',
          baseUrl: '.',
          paths: {
            '@/*': ['./*'],
          },
        },
      },
    ],
  },

  // Module name mapper — resolve Next.js path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|sass|scss)$': '<rootDir>/__tests__/__mocks__/styleMock.ts',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/__tests__/__mocks__/fileMock.ts',
  },

  // Exclude mocks and setup dirs from test discovery
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '__tests__/__mocks__/',
    '__tests__/setup/',
  ],

  // Global setup running before every test suite file
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/setup.ts'],

  // Coverage collection
  collectCoverageFrom: [
    'lib/**/*.ts',
    'store/**/*.ts',
    '!lib/db.ts',
    '!**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Minimum coverage thresholds
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Verbose per-test output
  verbose: true,

  // Async interpreter tests can be slow
  testTimeout: 10000,
};

export default config;
