/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  collectCoverage: true,
  coverageProvider: 'v8',
  errorOnDeprecated: true,
  testEnvironment: 'jsdom',
};

export default createJestConfig(config);
