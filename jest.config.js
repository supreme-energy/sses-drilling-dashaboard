module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
  transform: {
    "\\.las$": "jest-raw-loader",
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
    '^.+\\.(js|jsx)?$': 'babel-jest'
  },
  testMatch: [
    '<rootDir>/(tests/**/*.test.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx))'
  ],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  "modulePaths": [
    "/src"
  ],
  "moduleDirectories": [
    "node_modules",
    "<rootDir>"
  ],
  "moduleNameMapper": {
    '^@/(.*)$': '<rootDir>/src/$1',
    "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js",
    "\\.(gif|ttf|eot|svg)$": "<rootDir>/__mocks__/fileMock.js"
  }
};
