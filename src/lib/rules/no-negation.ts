// 禁止对非布尔值使用 "!" 运算符, 否则可能导致意外的类型强制转换

import type { Rule } from 'eslint'
import ts from 'typescript'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: '禁止对非布尔值使用逻辑取反操作符 (!)' },
    messages: { noNegationOnNonBoolean: '禁止对非布尔值使用 "!" 运算符' },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    return {
      UnaryExpression(node) {
        if (node.operator !== '!') return

        const parserServices = context.parserServices
        if (!parserServices) return

        const typeChecker: ts.TypeChecker = parserServices.program.getTypeChecker()
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node.argument)
        const argumentType = typeChecker.getTypeAtLocation(tsNode)

        const isBoolean =
          (argumentType.flags & ts.TypeFlags.Boolean) !== 0 || (argumentType.flags & ts.TypeFlags.BooleanLiteral) !== 0

        if (!isBoolean) {
          context.report({ node, messageId: 'noNegationOnNonBoolean' })
        }
      },
    }
  },
}

export default rule
