// 禁止使用 Object.assign

import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

const rule: TSESLint.RuleModule<'noObjectAssign', []> = {
  meta: {
    type: 'problem',
    docs: { description: '禁止使用 Object.assign' },
    messages: { noObjectAssign: '禁止使用 Object.assign' },
    schema: [],
  },
  defaultOptions: [],
  create(context: TSESLint.RuleContext<'noObjectAssign', []>): TSESLint.RuleListener {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'Object' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'assign'
        ) {
          context.report({ node, messageId: 'noObjectAssign' })
        }
      },
    }
  },
}

export default rule
