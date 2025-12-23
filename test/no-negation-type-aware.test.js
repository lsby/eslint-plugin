const { RuleTester } = require('eslint')
const plugin = require('../dist/index.js')
const path = require('path')

// Type-aware rule tests require real TypeScript compilation context
// using actual file paths and parserOptions.project configuration
const typeAwareRuleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    tsconfigRootDir: path.resolve(__dirname, 'fixtures'),
    project: './tsconfig.json',
  },
})

describe('no-negation (Type-Aware)', () => {
  typeAwareRuleTester.run('no-negation', plugin.rules['no-negation'], {
    valid: [
      {
        code: 'let flag: boolean = true; !flag;',
        filename: path.resolve(__dirname, 'fixtures', 'no-negation-valid.ts'),
      },
      {
        code: 'function isValid(): boolean { return true; } !isValid();',
        filename: path.resolve(__dirname, 'fixtures', 'no-negation-valid.ts'),
      },
      {
        code: 'let value: true = true; !value;',
        filename: path.resolve(__dirname, 'fixtures', 'no-negation-valid.ts'),
      },
    ],
    invalid: [
      {
        code: 'let count: number = 5; !count;',
        filename: path.resolve(__dirname, 'fixtures', 'no-negation-invalid.ts'),
        errors: [{ messageId: 'noNegationOnNonBoolean' }],
      },
      {
        code: 'let name: string = "test"; !name;',
        filename: path.resolve(__dirname, 'fixtures', 'no-negation-invalid.ts'),
        errors: [{ messageId: 'noNegationOnNonBoolean' }],
      },
      {
        code: 'let obj: object = {}; !obj;',
        filename: path.resolve(__dirname, 'fixtures', 'no-negation-invalid.ts'),
        errors: [{ messageId: 'noNegationOnNonBoolean' }],
      },
    ],
  })
})
