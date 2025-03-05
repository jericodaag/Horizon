export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/_auth/(.*)$': '<rootDir>/src/_auth/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$':
      '<rootDir>/src/__tests__/mocks/fileMock.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
};
