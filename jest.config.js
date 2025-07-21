const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^axios$': '<rootDir>/src/__mocks__/axios.ts',
    '^cheerio$': '<rootDir>/src/__mocks__/cheerio.ts',
  },
  testMatch: ['**/__tests__/**/*.(ts|tsx|js)', '**/*.(test|spec).(ts|tsx|js)'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/visual-regression.test.ts',
    '<rootDir>/src/__tests__/e2e-integration.test.ts',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/app/page.tsx',
    '!src/**/__mocks__/**',
    '!src/**/__tests__/**',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(cheerio|parse5|parse5-htmlparser2-tree-adapter|domhandler|domutils|dom-serializer|entities|htmlparser2|axios)/)',
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};

module.exports = createJestConfig(customJestConfig);
