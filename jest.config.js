const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/tests/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Ensure coverage reports are generated in formats that Codecov understands
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'json-summary', 'clover', 'text', 'text-summary'],
}

module.exports = createJestConfig(customJestConfig)