// 禁止 else（当条件是等于或不等于时）
// 对于等于/不等于的条件判断，else 表示"除当前条件外的所有可能"
// 当状态集合未来扩展时, 依然会被包含在else分支里, 导致状态遗漏却无任何报错
// 应当使用提早返回 或 switch + 穷尽检查

import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

const rule: TSESLint.RuleModule<'noElse', []> = {
  meta: {
    type: 'problem',
    docs: { description: '当条件是等于或不等于时，禁止使用 else 分支，防止隐含的状态遗漏' },
    messages: {
      noElse:
        '禁止在等于/不等于条件下使用 else 分支。当条件状态扩展时, else 分支可能遗漏新的状态。请改用提前返回(early return)或 switch 语句',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context: TSESLint.RuleContext<'noElse', []>): TSESLint.RuleListener {
    /**
     * 检查条件中是否包含等于或不等于操作符
     */
    function hasEqualityOperator(node: TSESTree.Expression): boolean {
      if (node.type === 'BinaryExpression') {
        return ['===', '!==', '==', '!='].includes(node.operator)
      }
      if (node.type === 'LogicalExpression') {
        return hasEqualityOperator(node.left) || hasEqualityOperator(node.right)
      }
      return false
    }

    return {
      IfStatement(node: TSESTree.IfStatement) {
        // 仅在 if 条件是等于或不等于的情况下，禁止 else
        if (node.alternate !== null && hasEqualityOperator(node.test)) {
          context.report({ node: node.alternate, messageId: 'noElse' })
        }
      },
    }
  },
}

export default rule
