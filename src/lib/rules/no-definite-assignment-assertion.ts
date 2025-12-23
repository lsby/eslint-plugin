// 禁止类属性使用确定赋值断言语法, 否则很容易出现空指针

import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

const rule: TSESLint.RuleModule<'noDefiniteAssignment', []> = {
  meta: {
    type: 'problem',
    docs: { description: '禁止在类属性上使用明确赋值断言 (!:)' },
    messages: { noDefiniteAssignment: '类属性不允许使用明确赋值断言 (!:), 应使用初始化或构造函数赋值' },
    schema: [],
  },
  defaultOptions: [],
  create(context: TSESLint.RuleContext<'noDefiniteAssignment', []>): TSESLint.RuleListener {
    return {
      PropertyDefinition(node: TSESTree.PropertyDefinition & { definite?: boolean }) {
        if (node.definite === true) {
          context.report({ node, messageId: 'noDefiniteAssignment' })
        }
      },
    }
  },
}

export default rule
