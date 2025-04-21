// .eslintrc.js
module.exports = {
  root: true,
  // Global settings for the entire monorepo
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  settings: {
    jest: {
      version: 29,
    },
  },
  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },

  // Overrides for specific packages or file patterns
  overrides: [
    // Web application (React)
    {
      files: ['apps/web/**/*.{js,jsx}', '**/*.config.js'],
      excludedFiles: ['**/__tests__/**'],
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
      ],
      plugins: ['react', 'react-hooks', 'jsx-a11y', 'testing-library'],
      // parser: '@babel/eslint-parser',
      parserOptions: {
        // requireConfigFile: false,
        // babelOptions: {
        //   presets: ['@babel/preset-react'],
        // },
        ecmaFeatures: {
          jsx: true,
        },
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
      env: {
        browser: true,
        es2022: true,
      },
      rules: {
        'react/prop-types': 'warn',
        'react/react-in-jsx-scope': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
    // API application (Node.js)
    {
      files: ['apps/api/**/*.js', '**/jest.config.js'],
      excludedFiles: ['**/__tests__/**'],
      extends: ['plugin:node/recommended'],
      plugins: ['node'],
      env: {
        node: true,
        es2022: true,
      },
      rules: {
        'node/exports-style': ['error', 'module.exports'],
        'node/no-unsupported-features/es-syntax': [
          'error',
          {
            version: '>=16.0.0',
            ignores: ['modules'],
          },
        ],
      },
    },
    // Test files - web
    {
      files: ['apps/web/**/__tests__/**/*.{js,jsx}', '**/*.config.js'],
      extends: [
        'plugin:testing-library/react',
        'plugin:vitest/recommended',
        'plugin:vitest-globals/recommended',
      ],
      plugins: ['testing-library', 'vitest', 'vitest-globals'],
      env: {
        browser: true,
        jest: true,
        'vitest-globals/env': true,
      },
      rules: {
        'testing-library/await-async-queries': 'error',
        'testing-library/no-unnecessary-act': 'warn',
      },
    },
    // Test files - api
    {
      files: ['apps/api/**/__tests__/**/*.js'],
      env: {
        jest: true,
        node: true,
      },
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
    },
  ],
};
