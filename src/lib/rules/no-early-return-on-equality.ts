// 禁止等于条件的if提前返回，但允许不等于条件的提前返回
// 使用等于条件的提前返回容易遗漏状态，应该用正向的不等于条件或结构化流程

import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

const rule: TSESLint.RuleModule<'noEarlyReturnOnEquality', []> = {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止在等于条件下使用提前返回(early return)。使用不等于条件的提前返回会更清晰地表达程序的主要流程',
    },
    messages: {
      noEarlyReturnOnEquality:
        '禁止在等于条件下使用提前返回。建议改用不等于条件的提前返回，使主流程更清晰。例如：将 if (x === y) return; 改为 if (x !== y) { 主要逻辑 }',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context: TSESLint.RuleContext<'noEarlyReturnOnEquality', []>): TSESLint.RuleListener {
    /**
     * 检查条件中是否是等于操作符（不包括不等于）
     */
    function isEqualityOperator(node: TSESTree.Expression): boolean {
      if (node.type === 'BinaryExpression') {
        return ['===', '=='].includes(node.operator)
      }
      if (node.type === 'LogicalExpression') {
        return isEqualityOperator(node.left) || isEqualityOperator(node.right)
      }
      return false
    }

    /**
     * 检查语句是否是提前返回或抛出（仅包含这些语句）
     */
    function isEarlyExit(node: TSESTree.Statement | null): boolean {
      if (!node) return false

      // 直接是 return 或 throw
      if (node.type === 'ReturnStatement' || node.type === 'ThrowStatement') {
        return true
      }

      // 是 block statement，检查其中的所有语句是否都是 return 或 throw
      if (node.type === 'BlockStatement') {
        return (
          node.body.length > 0 &&
          node.body.every((stmt) => stmt.type === 'ReturnStatement' || stmt.type === 'ThrowStatement')
        )
      }

      return false
    }

    return {
      IfStatement(node: TSESTree.IfStatement) {
        // 检查：条件是等于 & if 分支是提前返回 & 没有 else 分支
        if (!node.alternate && isEqualityOperator(node.test) && isEarlyExit(node.consequent)) {
          context.report({ node, messageId: 'noEarlyReturnOnEquality' })
        }
      },
    }
  },
}

export default rule
