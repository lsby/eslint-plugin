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
      // 没有 else 的 if 判断允许
      {
        code: `
        if (x === 200) {
          return 'success'
        }
        return 'error'
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },
      // 不是等于/不等于的判断允许
      {
        code: `
        if (x > 10) {
          console.log('greater')
        } else {
          console.log('not greater')
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },
      // 与 null 比较允许
      {
        code: `
        let value: string | null = null
        if (value === null) {
          console.log('null')
        } else {
          console.log('not null')
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },
      // 与 undefined 比较允许
      {
        code: `
        let value: string | undefined = undefined
        if (value === undefined) {
          console.log('undefined')
        } else {
          console.log('defined')
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },
      // 布尔值允许
      {
        code: `
        let flag: boolean = true
        if (flag === true) {
          console.log('true')
        } else {
          console.log('false')
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },
      // 普通的变量比较允许（不是字面量枚举）
      {
        code: `
        let x: number = 200
        if (x === 200) {
          return 'success'
        } else {
          return 'error'
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },
    ],
    invalid: [
      // 对字符串字面量枚举的 if-else 不允许
      {
        code: `
        let status: 'good' | 'bad' = 'good'
        if (status === 'good') {
          console.log('good')
        } else {
          console.log('bad')
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'useSwitchForEnumLiteral' }],
      },
      // 3 个以上的字符串字面量枚举不允许
      {
        code: `
        let type: 'a' | 'b' | 'c' = 'a'
        if (type === 'a') {
          console.log('a')
        } else {
          console.log('not a')
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'useSwitchForEnumLiteral' }],
      },
      // 数字字面量枚举不允许
      {
        code: `
        let code: 1 | 2 = 1
        if (code === 1) {
          console.log('one')
        } else {
          console.log('two')
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'useSwitchForEnumLiteral' }],
      },
      // 反向写法也不允许
      {
        code: `
        let status: 'active' | 'inactive' = 'active'
        if ('active' === status) {
          console.log('active')
        } else {
          console.log('inactive')
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'useSwitchForEnumLiteral' }],
      },
      // 不等于操作符也不允许
      {
        code: `
        let code: 'success' | 'error' = 'success'
        if (code !== 'success') {
          console.log('not success')
        } else {
          console.log('success')
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'useSwitchForEnumLiteral' }],
      },
    ],
  })
})
