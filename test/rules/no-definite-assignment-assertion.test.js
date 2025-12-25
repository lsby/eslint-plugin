const { RuleTester } = require('eslint')
const plugin = require('../../dist/index.js')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
})

describe('no-definite-assignment-assertion', () => {
  ruleTester.run('no-definite-assignment-assertion', plugin.rules['no-definite-assignment-assertion'], {
    valid: [
      `
      class User {
        name: string

        constructor(name: string) {
          this.name = name
        }
      }
      `,
      `
      class Config {
        value: string = 'default'
      }
      `,
    ],
    invalid: [
      {
        code: `
        class User {
          name!: string
        }
        `,
        errors: [{ messageId: 'noDefiniteAssignment' }],
      },
      {
        code: `
        class Config {
          apiUrl!: string
          timeout!: number
        }
        `,
        errors: [{ messageId: 'noDefiniteAssignment' }, { messageId: 'noDefiniteAssignment' }],
      },
    ],
  })
})
