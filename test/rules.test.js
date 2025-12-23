const { RuleTester } = require('eslint')
const plugin = require('../dist/index.js')

// 为不需要类型信息的规则进行测试
const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
})

describe('ESLint Plugin Rules', () => {
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
        { code: 'const x = 1', errors: [{ messageId: 'preferLet' }], output: 'let x = 1' },
        { code: 'var y = 2', errors: [{ messageId: 'preferLet' }], output: 'let y = 2' },
        { code: 'const obj = { a: 1 }', errors: [{ messageId: 'preferLet' }], output: 'let obj = { a: 1 }' },
        { code: 'var arr = []', errors: [{ messageId: 'preferLet' }], output: 'let arr = []' },
      ],
    })
  })

  describe('no-else', () => {
    ruleTester.run('no-else', plugin.rules['no-else'], {
      valid: [
        `
        if (x === 200) {
          return 'success'
        }
        return 'error'
        `,
        `
        if (x > 10) {
          console.log('greater')
        }
        `,
      ],
      invalid: [
        {
          code: `
          if (x === 200) {
            return 'success'
          } else {
            return 'error'
          }
          `,
          errors: [{ messageId: 'noElse' }],
        },
        {
          code: `
          if (code > 0) {
            console.log('positive')
          } else {
            console.log('non-positive')
          }
          `,
          errors: [{ messageId: 'noElse' }],
        },
      ],
    })
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

  describe('prefer-switch-over-multi-if', () => {
    ruleTester.run('prefer-switch-over-multi-if', plugin.rules['prefer-switch-over-multi-if'], {
      valid: [
        `
        if (x > 10) {
          console.log('greater than 10')
        }
        `,
        `
        if (x === 1) {
          doOne()
        }
        // unrelated code
        if (y === 2) {
          doTwo()
        }
        `,
      ],
      invalid: [
        {
          code: `
          if (status === 'active') {
            handleActive()
          } else if (status === 'inactive') {
            handleInactive()
          } else if (status === 'pending') {
            handlePending()
          }
          `,
          errors: [{ messageId: 'preferSwitch' }],
        },
        {
          code: `
          if (x === 1) {
            doOne()
          } else if (x === 2) {
            doTwo()
          }
          `,
          errors: [{ messageId: 'preferSwitch' }],
        },
      ],
    })
  })
})
