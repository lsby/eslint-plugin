const { RuleTester } = require('eslint')
const plugin = require('../../dist/index.js')
const tsParser = require('@typescript-eslint/parser')

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
  },
})

describe('prefer-let', () => {
  ruleTester.run('prefer-let', plugin.rules['prefer-let'], {
    valid: [
      'let x = 1',
      'let y = 2',
      'let z = { a: 1 }',
      'let arr = []',
      { code: 'declare const unique: unique symbol', options: [] },
    ],
    invalid: [
      { code: 'const x = 1', errors: [{ message: /使用 let 代替 const/ }], output: 'let x = 1' },
      { code: 'var y = 2', errors: [{ message: /使用 let 代替 var/ }], output: 'let y = 2' },
      { code: 'const obj = { a: 1 }', errors: [{ message: /使用 let 代替 const/ }], output: 'let obj = { a: 1 }' },
      { code: 'var arr = []', errors: [{ message: /使用 let 代替 var/ }], output: 'let arr = []' },
    ],
  })
})
