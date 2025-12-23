// 禁止 switch 中使用 default 分支
// default 分支会掩盖新增的 case, 导致代码不可演化
// 如果未来增加新的 case, default 会让错误悄悄通过编译
// 通过禁止 default, 可以强制显式列出所有可能的分支
// 这样 switch 永远保持穷举, 提升类型安全和可维护性

import type { Rule } from 'eslint'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: '禁止使用 switch 的 default 分支' },
    messages: { noSwitchDefault: '禁止在 switch 语句中使用 default 分支' },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    return {
      SwitchStatement(node) {
        for (const switchCase of node.cases) {
          if (switchCase.test === null) {
            context.report({ node: switchCase, messageId: 'noSwitchDefault' })
          }
        }
      },
    }
  },
}

export default rule
