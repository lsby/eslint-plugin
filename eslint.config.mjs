import tsParser from '@typescript-eslint/parser'
import plugin from './dist/index.js'

export default [
  { ignores: ['node_modules/**', 'dist/**'] },
  {
    files: ['test/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2024, sourceType: 'module', project: './tsconfig.json' },
    },
    plugins: { lsby: plugin },
    rules: {
      'lsby/prefer-let': 'error',
      'lsby/no-else': 'error',
      'lsby/no-negation': 'error',
      'lsby/no-definite-assignment-assertion': 'error',
      'lsby/no-switch-default': 'error',
      'lsby/prefer-switch-over-multi-if': 'error',
    },
  },
]
