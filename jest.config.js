module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testMatch: ['**/__tests__/**/*.(ts|tsx)'],
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
};