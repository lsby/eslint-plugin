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
      // ===== 推荐做法：使用 switch 语句 =====
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

      // ===== 非相等比较（使用 > < 等）：不检查字面量枚举规则 =====
      {
        code: `
        type Count = 1 | 2 | 3 | 4 | 5
        const count: Count = 3
        if (count > 3) {
          tooHigh()
        } else {
          ok()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },
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

      // ===== 无类型声明的字符串：不是字面量联合类型 =====
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

      // ===== 只有单个 if 没有 else：不会产生隐藏的缺陷 =====
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

      // ===== if-else if 但没有最终 else：不检查 =====
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

      // ===== 完全覆盖：所有枚举值都被显式处理（if-else 覆盖 2 个值） =====
      {
        code: `
        type Status = 'active' | 'inactive'
        const status: Status = 'active'
        if (status === 'active') {
          handleActive()
        } else {
          handleInactive()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },

      // ===== 完全覆盖：布尔字面量联合（2 个值）都被处理 =====
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
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },

      // ===== 基础布尔类型：不是字面量联合 =====
      {
        code: `
        const isLoading: boolean = true
        if (isLoading) {
          showSpinner()
        } else {
          hideSpinner()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },

      // ===== 完全覆盖：3 个枚举值都被处理（if-else if-else 完整） =====
      {
        code: `
        type Status = 'loading' | 'success' | 'error'
        const status: Status = 'loading'
        if (status === 'loading') {
          showLoading()
        } else if (status === 'success') {
          showData()
        } else {
          showError()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },

      // ===== 完全覆盖：使用 == 操作符，2 个值完全覆盖 =====
      {
        code: `
        type Flag = 'on' | 'off'
        const flag: Flag = 'on'
        if (flag == 'on') {
          activate()
        } else {
          deactivate()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },

      // ===== 完全覆盖：值在左侧、变量在右侧，2 个值完全覆盖 =====
      {
        code: `
        type Action = 'save' | 'delete'
        const action: Action = 'save'
        if ('save' === action) {
          saveData()
        } else {
          deleteData()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },

      // ===== 嵌套 if：外层 if-else 中嵌套了另一个 if-else（分别独立判断） =====
      {
        code: `
        type A = 'x' | 'y'
        type B = 'p' | 'q'
        const a: A = 'x'
        const b: B = 'p'
        if (a === 'x') {
          if (b === 'p') { /* ... */ } else { /* ... */ }
        } else {
          // ...
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },

      // ===== 混合比较：相等操作符与其他比较混合使用，放行以避免复杂分析 =====
      {
        code: `
        type Status = 'active' | 'inactive' | 'pending'
        const status: Status = 'active'
        if (status === 'active') {
          handleActive()
        } else if (status > 'b') {
          handleOther()
        } else {
          handleRest()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },

      // ===== 混合比较：其他比较先，相等操作符后，放行以避免复杂分析 =====
      {
        code: `
        type Count = 1 | 2 | 3 | 4 | 5
        const count: Count = 3
        if (count > 3) {
          tooHigh()
        } else if (count === 2) {
          handleTwo()
        } else {
          handleRest()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },

      // ===== MemberExpression：对象属性的字面量枚举判断（完全覆盖 2 个值）=====
      {
        code: `
        type Status = 'active' | 'inactive'
        interface Config {
          status: Status
        }
        const config: Config = { status: 'active' }
        if (config.status === 'active') {
          handleActive()
        } else {
          handleInactive()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },

      // ===== CallExpression：函数返回值的字面量枚举判断（完全覆盖 2 个值）=====
      {
        code: `
        type Status = 'ok' | 'error'
        function getStatus(): Status {
          return 'ok'
        }
        if (getStatus() === 'ok') {
          handleOk()
        } else {
          handleError()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },

      // ===== 常量引用：使用 as const 的常量作为比较值（完全覆盖 2 个值）=====
      {
        code: `
        const ACTIVE = 'active' as const
        const INACTIVE = 'inactive' as const
        type Status = 'active' | 'inactive'
        const status: Status = 'active'
        if (status === ACTIVE) {
          handleActive()
        } else {
          handleInactive()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },

      // ===== 常量引用：对象属性 + 常量引用（完全覆盖 2 个值）=====
      {
        code: `
        const STATUS_OK = 'ok' as const
        type Status = 'ok' | 'error'
        interface Response {
          status: Status
        }
        const res: Response = { status: 'ok' }
        if (res.status === STATUS_OK) {
          handleOk()
        } else {
          handleError()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'valid.ts'),
      },
    ],
    invalid: [
      // ===== 不完全覆盖：3 个值只覆盖 1 个，else 覆盖 2 个 - 应使用 switch =====
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

      // ===== 不完全覆盖：3 个值只覆盖 1 个，else 覆盖 2 个 - 应使用 switch =====
      {
        code: `
        type Status = 'active' | 'inactive' | 'pending'
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

      // ===== 不完全覆盖：if-else if-else 覆盖 2 个值，else 覆盖 3 个 - 应使用 switch =====
      {
        code: `
        type State = 'idle' | 'loading' | 'success' | 'error' | 'canceled'
        const state: State = 'idle'
        if (state === 'idle') {
          reset()
        } else if (state === 'loading') {
          showSpinner()
        } else {
          handleResult()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'preferSwitch' }],
      },

      // ===== 不完全覆盖：3 个值只覆盖 1 个，else 覆盖 2 个（使用 == 操作符） =====
      {
        code: `
        type Role = 'admin' | 'editor' | 'viewer'
        const role: Role = 'admin'
        if ('admin' == role) {
          grantFullAccess()
        } else {
          grantLimitedAccess()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'preferSwitch' }],
      },
      // ===== 区分数字和字符串：1 和 '1' 是不同的类型，3 个值覆盖 1 个，else 覆盖 2 个 =====
      {
        code: `
        type MixedLiteral = 1 | '1' | 2
        const val: MixedLiteral = 1
        if (val === 1) {
          handleNumber()
        } else {
          handleOther()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'preferSwitch' }],
      },
      // ===== MemberExpression：对象属性不完全覆盖，3 个值只覆盖 1 个 =====
      {
        code: `
        type Status = 'active' | 'inactive' | 'pending'
        interface Config {
          status: Status
        }
        const config: Config = { status: 'active' }
        if (config.status === 'active') {
          handleActive()
        } else {
          handleOther()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'preferSwitch' }],
      },

      // ===== CallExpression：函数返回值不完全覆盖，3 个值只覆盖 1 个 =====
      {
        code: `
        type Status = 'idle' | 'loading' | 'error'
        function getStatus(): Status {
          return 'idle'
        }
        if (getStatus() === 'idle') {
          handleIdle()
        } else {
          handleOther()
        }
        `,
        filename: path.resolve(__dirname, '../fixtures', 'invalid.ts'),
        errors: [{ messageId: 'preferSwitch' }],
      },

      // ===== 常量引用：对象属性 + 常量引用，3 个值只覆盖 1 个 =====
      {
        code: `
        const STATE_IDLE = 'idle' as const
        type State = 'idle' | 'loading' | 'error'
        interface Store {
          state: State
        }
        const store: Store = { state: 'idle' }
        if (store.state === STATE_IDLE) {
          handleIdle()
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
