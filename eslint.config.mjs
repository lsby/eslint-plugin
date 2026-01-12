import tsParser from '@typescript-eslint/parser'
import plugin from './dist/index.js'

export default [
  { ignores: ['node_modules/**', 'dist/**'] },
  {
    files: ['test/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2024, sourceType: 'module', projectService: true },
    },
    plugins: { lsby: plugin },
    rules: {
      'lsby/no-definite-assignment-assertion': 'error',
      'lsby/no-else-on-equality': 'error',
      'lsby/no-negation': 'error',
      'lsby/no-switch-default': 'error',
      'lsby/prefer-let': 'error',
      'lsby/prefer-switch-over-multi-if': 'error',
    },
  },
]
