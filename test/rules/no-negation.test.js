const { RuleTester } = require('eslint')
const plugin = require('../../dist/index.js')
const path = require('path')
const tsParser = require('@typescript-eslint/parser')

const typeAwareRuleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true }, project: true },
  },
})

describe('no-negation', () => {
  typeAwareRuleTester.run('no-negation', plugin.rules['no-negation'], {
    valid: [
      { code: 'let flag: boolean = true; !flag;', filename: path.resolve(__dirname, '../fixtures', 'valid.ts') },
      {
        code: 'function isValid(): boolean { return true; } !isValid();',
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },
      { code: 'let value: true = true; !value;', filename: path.resolve(__dirname, '../fixtures', 'valid.ts') },
    ],
    invalid: [
      {
        code: 'let count: number = 5; !count;',
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'noNegationOnNonBoolean' }],
      },
      {
        code: 'let name: string = "test"; !name;',
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'noNegationOnNonBoolean' }],
      },
      {
        code: 'let obj: object = {}; !obj;',
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'noNegationOnNonBoolean' }],
      },
    ],
  })
})
