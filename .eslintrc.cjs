/** @type {import("eslint").Linter.Config} */
const config = {
  overrides: [
    {
      extends: [
        'plugin:@typescript-eslint/stylistic-type-checked',
        'plugin:@typescript-eslint/recommended-type-checked',
      ],
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: true,
      },
    },
    {
      files: ['*.js', '*.jsx'],
      extends: [
        'plugin:import/recommended',
        'plugin:@typescript-eslint/stylistic',
        'plugin:@typescript-eslint/recommended',
        'prettier',
      ],
      settings: {
        'import/resolver': {
          alias: {
            map: [
              ['react', 'next/dist/compiled/react/cjs/react.development.js'],
            ],
            extensions: ['.js', '.jsx'],
          },
          typescript: {
            project: './tsconfig.json',
            alwaysTryTypes: true,
          },
        },
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'next/core-web-vitals', 'prettier'],
  ignorePatterns: ['node_modules', '*.stories.*', 'public'],
  rules: {
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@next/next/no-img-element': 'off',
    'import/no-cycle': 'error',
    'import/no-anonymous-default-export': 'off',
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    'no-process-env': 'error',
    'no-console': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        caughtErrors: 'none',
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false,
      },
    ],
    'no-unreachable': 'error',
  },
};

module.exports = config;
