/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx', '<rootDir>/test/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^uuid$': '<rootDir>/node_modules/uuid/dist/index.js',
    '^@/server/(.*)$': '<rootDir>/server/$1',
    '^@/shared/(.*)$': '<rootDir>/src/lib/shared/$1',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  // Ensure we load env variables for integration tests
  globalSetup: '<rootDir>/src/test/global-setup.ts',
};