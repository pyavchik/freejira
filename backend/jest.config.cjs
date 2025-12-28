module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  // This is important for ES Modules to be recognized in tests
  // It tells Jest to not transform node_modules, except for specific ones if needed.
  // For ESM, often you need to transform modules that are not CJS.
  // For now, we'll keep it simple and assume all source code needs transforming.
  transformIgnorePatterns: [],
};

