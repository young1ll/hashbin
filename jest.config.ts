import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/lib/$1',
  },

  collectCoverageFrom: ['lib/**/*.(t|j)s'],
  coveragePathIgnorePatterns: [
    'node_modules',
    '__test__',
    'index.ts',
    '\\.enum\\.ts$',
    '\\.interface\\.ts$',
  ],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};

export default config;
