module.exports = {
  rootDir: ".",
  collectCoverage: true,
  testEnvironment: "jsdom",
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov", "json-summary"],
  setupFilesAfterEnv: ["<rootDir>/__setup__/setupTests.ts"],
  coverageThreshold: {
    global: {
      branches: 80,
      lines: 80,
    },
  },
  reporters: [
    "default",
    [
      "<rootDir>/node_modules/jest-html-reporter",
      {
        pageTitle: "Test Report",
        outputPath: "./__tests__/reports/test-report.html",
        includeFailureMsg: true,
      },
    ],
  ],
  moduleNameMapper: {
    "^.+\\.(css|less|scss)$": "babel-jest",
    "\\.svg$": "<rootDir>/__mocks__/svgMock.ts",

  },
  testMatch: ["<rootDir>/src/**/*.test.js", "<rootDir>/src/**/*.test.tsx"],
  testPathIgnorePatterns: ["<rootDir>/__tests__/setup/"],
  globals: {
    IS_DEVELOPMENT: true,
    FONT_PATH: "fonts/",
    DEVELOPMENT_MARKETPLACE_DOMAIN: "https://testmarketplace.appdirect.com",
  },
};
