const { RuleTester } = require('eslint')
const plugin = require('../../dist/index.js')
const tsParser = require('@typescript-eslint/parser')

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
  },
})

describe('no-object-assign', () => {
  ruleTester.run('no-object-assign', plugin.rules['no-object-assign'], {
    valid: [
      `
      const obj = { a: 1 }
      const newObj = { ...obj, b: 2 }
      `,
      `
      const target = {}
      Object.keys(source).forEach(key => {
        target[key] = source[key]
      })
      `,
    ],
    invalid: [
      {
        code: `
        const target = {}
        const source = { a: 1 }
        Object.assign(target, source)
        `,
        errors: [{ messageId: 'noObjectAssign' }],
      },
      {
        code: `
        const obj = Object.assign({}, { a: 1 }, { b: 2 })
        `,
        errors: [{ messageId: 'noObjectAssign' }],
      },
    ],
  })
})
