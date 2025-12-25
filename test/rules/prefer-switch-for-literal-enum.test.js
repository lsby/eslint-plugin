const { RuleTester } = require('eslint')
const plugin = require('../../dist/index.js')
const path = require('path')

const typeAwareRuleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    tsconfigRootDir: path.resolve(__dirname, '../fixtures'),
    project: './tsconfig.json',
  },
})

describe('prefer-switch-for-literal-enum', () => {
  typeAwareRuleTester.run('prefer-switch-for-literal-enum', plugin.rules['prefer-switch-for-literal-enum'], {
    valid: [
      // switch 语句是好的
      {
        code: `
        type Status = 'active' | 'inactive'
        const status: Status = 'active'
        switch (status) {
          case 'active':
            handleActive()
            break
          case 'inactive':
            handleInactive()
            break
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },
      // 没有 else 分支的 if 语句
      {
        code: `
        type Status = 'active' | 'inactive'
        const status: Status = 'active'
        if (status === 'active') {
          handleActive()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },
      // 非字面量联合类型的变量
      {
        code: `
        const count: number = 10
        if (count > 10) {
          // ...
        } else {
          // ...
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },
      // 字符串类型（不是字面量联合）
      {
        code: `
        const name: string = 'john'
        if (name === 'john') {
          // ...
        } else {
          // ...
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },
      // if-else if 没有最终 else
      {
        code: `
        type Status = 'active' | 'inactive' | 'pending'
        const status: Status = 'active'
        if (status === 'active') {
          handleActive()
        } else if (status === 'inactive') {
          handleInactive()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },
      // 布尔类型
      {
        code: `
        const flag: boolean = true
        if (flag) {
          // ...
        } else {
          // ...
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },
    ],
    invalid: [
      // 字符串字面量联合类型
      {
        code: `
        type Status = 'active' | 'inactive'
        const status: Status = 'active'
        if (status === 'active') {
          handleActive()
        } else {
          handleOther()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'preferSwitch' }],
      },
      // 数字字面量联合类型
      {
        code: `
        type Code = 200 | 404 | 500
        const code: Code = 200
        if (code === 200) {
          success()
        } else {
          fail()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'preferSwitch' }],
      },
      // 布尔字面量联合类型
      {
        code: `
        type Flag = true | false
        const flag: Flag = true
        if (flag === true) {
          handleTrue()
        } else {
          handleFalse()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'preferSwitch' }],
      },
      // else if 最后跟 else
      {
        code: `
        type Status = 'active' | 'inactive' | 'pending'
        const status: Status = 'active'
        if (status === 'active') {
          handleActive()
        } else if (status === 'inactive') {
          handleInactive()
        } else {
          handlePending()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'preferSwitch' }],
      },
      // 单个字面量类型（也是字面量联合的一种）
      {
        code: `
        const status: 'active' = 'active'
        if (status === 'active') {
          handleActive()
        } else {
          handleOther()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'preferSwitch' }],
      },
    ],
  })
})
