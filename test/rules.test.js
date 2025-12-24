const { RuleTester } = require('eslint')
const plugin = require('../dist/index.js')
const path = require('path')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
})

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

describe('ESLint Plugin Rules', () => {
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

  describe('no-else-on-equality', () => {
    typeAwareRuleTester.run('no-else-on-equality', plugin.rules['no-else-on-equality'], {
      valid: [
        {
          code: `
        if (x === 200) {
          return 'success'
        }
        return 'error'
        `,
          filename: path.resolve(__dirname, 'fixtures', 'valid.ts'),
        },
        {
          code: `
        if (x > 10) {
          console.log('greater')
        } else {
          console.log('not greater')
        }
        `,
          filename: path.resolve(__dirname, 'fixtures', 'valid.ts'),
        },
        {
          code: `
        if (x !== 'admin') {
          return 'not admin'
        }
        return 'admin'
        `,
          filename: path.resolve(__dirname, 'fixtures', 'valid.ts'),
        },
        // 布尔类型允许 else（2 个状态）
        {
          code: `
        let flag: boolean = true
        if (flag === true) {
          console.log('true')
        } else {
          console.log('false')
        }
        `,
          filename: path.resolve(__dirname, 'fixtures', 'valid.ts'),
        },
        // 字面量联合类型允许 else（2 个状态）
        {
          code: `
        let status: 'good' | 'bad' = 'good'
        if (status === 'good') {
          console.log('good')
        } else {
          console.log('bad')
        }
        `,
          filename: path.resolve(__dirname, 'fixtures', 'valid.ts'),
        },
        // 数字字面量联合类型允许 else（2 个状态）
        {
          code: `
        let code: 1 | 2 = 1
        if (code === 1) {
          console.log('one')
        } else {
          console.log('two')
        }
        `,
          filename: path.resolve(__dirname, 'fixtures', 'valid.ts'),
        },
        // 不同类型的联合起来也可以
        {
          code: `
        let code: 1 | null = 1
        if (code === 1) {
          console.log('one')
        } else {
          console.log('two')
        }
        `,
          filename: path.resolve(__dirname, 'fixtures', 'valid.ts'),
        },
        // 支持undefined和null
        {
          code: `
        let value: undefined | null = null
        if (value === null) {
          console.log('one')
        } else {
          console.log('two')
        }
        `,
          filename: path.resolve(__dirname, 'fixtures', 'valid.ts'),
        },
        // 反向写法也允许
        {
          code: `
        let status: 'active' | 'inactive' = 'active'
        if ('active' === status) {
          console.log('active')
        } else {
          console.log('inactive')
        }
        `,
          filename: path.resolve(__dirname, 'fixtures', 'valid.ts'),
        },
      ],
      invalid: [
        {
          code: `
          let x: number = 200
          if (x === 200) {
            return 'success'
          } else {
            return 'error'
          }
          `,
          filename: path.resolve(__dirname, 'fixtures', 'invalid.ts'),
          errors: [{ messageId: 'noElse' }],
        },
        {
          code: `
          let code: string = 'success'
          if (code !== 'success') {
            console.log('not success')
          } else {
            console.log('success')
          }
          `,
          filename: path.resolve(__dirname, 'fixtures', 'invalid.ts'),
          errors: [{ messageId: 'noElse' }],
        },
        // 3 个以上的状态不允许 else
        {
          code: `
          let type: 'a' | 'b' | 'c' = 'a'
          if (type === 'a') {
            console.log('a')
          } else {
            console.log('not a')
          }
          `,
          filename: path.resolve(__dirname, 'fixtures', 'invalid.ts'),
          errors: [{ messageId: 'noElse' }],
        },
      ],
    })
  })

  describe('no-negation', () => {
    typeAwareRuleTester.run('no-negation', plugin.rules['no-negation'], {
      valid: [
        { code: 'let flag: boolean = true; !flag;', filename: path.resolve(__dirname, 'fixtures', 'valid.ts') },
        {
          code: 'function isValid(): boolean { return true; } !isValid();',
          filename: path.resolve(__dirname, 'fixtures', 'valid.ts'),
        },
        { code: 'let value: true = true; !value;', filename: path.resolve(__dirname, 'fixtures', 'valid.ts') },
      ],
      invalid: [
        {
          code: 'let count: number = 5; !count;',
          filename: path.resolve(__dirname, 'fixtures', 'invalid.ts'),
          errors: [{ messageId: 'noNegationOnNonBoolean' }],
        },
        {
          code: 'let name: string = "test"; !name;',
          filename: path.resolve(__dirname, 'fixtures', 'invalid.ts'),
          errors: [{ messageId: 'noNegationOnNonBoolean' }],
        },
        {
          code: 'let obj: object = {}; !obj;',
          filename: path.resolve(__dirname, 'fixtures', 'invalid.ts'),
          errors: [{ messageId: 'noNegationOnNonBoolean' }],
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
})
