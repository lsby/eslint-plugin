const { RuleTester } = require('eslint')
const plugin = require('../../dist/index.js')
const tsParser = require('@typescript-eslint/parser')

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
  },
})

describe('no-switch-default', () => {
  ruleTester.run('no-switch-default', plugin.rules['no-switch-default'], {
    valid: [
      `
      switch (x) {
        case 1:
          console.log('one')
          break
        case 2:
          console.log('two')
          break
      }
      `,
      `
      switch (status) {
        case 'active':
          handleActive()
          break
        case 'inactive':
          handleInactive()
          break
      }
      `,
    ],
    invalid: [
      {
        code: `
        switch (x) {
          case 1:
            console.log('one')
            break
          default:
            console.log('other')
        }
        `,
        errors: [{ messageId: 'noSwitchDefault' }],
      },
      {
        code: `
        switch (type) {
          case 'A':
            handleA()
            break
          case 'B':
            handleB()
            break
          default:
            handleDefault()
        }
        `,
        errors: [{ messageId: 'noSwitchDefault' }],
      },
    ],
  })
})
