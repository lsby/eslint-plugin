// jsdoc的link必须存在

import type { Rule } from 'eslint'
import { Program } from 'estree'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: '禁止在 JSDoc 注解中使用未定义的 {@link} 引用' },
    messages: { undefinedLink: '{@link} 中的标识符 "{identifier}" 未定义' },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    return {
      Program(node: Program) {
        const sourceCode = context.sourceCode || context.getSourceCode()
        const comments = sourceCode.getAllComments?.() || []

        comments.forEach((comment: { value: string }) => {
          const matches = comment.value.match(/\{@link\s+([^\s}]+)\s*\}/g)

          if (matches) {
            matches.forEach((link: string) => {
              const identifier = link.match(/\{@link\s+([^\s}]+)\s*\}/)![1]

              const variables = context.getScope().variables
              const isDefined = variables.some((variable) => variable.name === identifier)

              if (!isDefined) {
                context.report({ node, messageId: 'undefinedLink', data: { identifier } })
              }
            })
          }
        })
      },
    }
  },
}

export default rule
