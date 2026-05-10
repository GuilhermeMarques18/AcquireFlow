/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "node",
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^#config/(.*?)(\\.js)?$": "<rootDir>/src/config/$1",
    "^#controllers/(.*?)(\\.js)?$": "<rootDir>/src/controllers/$1",
    "^#middleware/(.*?)(\\.js)?$": "<rootDir>/src/middleware/$1",
    "^#models/(.*?)(\\.js)?$": "<rootDir>/src/models/$1",
    "^#routes/(.*?)(\\.js)?$": "<rootDir>/src/routes/$1",
    "^#service/(.*?)(\\.js)?$": "<rootDir>/src/service/$1",
    "^#utils/(.*?)(\\.js)?$": "<rootDir>/src/utils/$1",
    "^#validations/(.*?)(\\.js)?$": "<rootDir>/src/validations/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "esnext",
          moduleResolution: "node",
          verbatimModuleSyntax: false,
        },
      },
    ],
  },
};

export default config;
