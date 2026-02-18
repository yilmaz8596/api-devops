import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  testMatch: ["**/tests/**/*.test.ts"],
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  moduleNameMapper: {
    "^@arcjet/node$": "<rootDir>/tests/__mocks__/@arcjet/node.ts",
    "^arcjet$": "<rootDir>/tests/__mocks__/arcjet.ts",
  },
};

export default config;
