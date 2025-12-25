// 禁止对字面量枚举进行 if 判断并使用 else
// 当判断字面量枚举时，应该使用 switch 来穷尽所有情况

import * as ts from 'typescript'
import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

const rule: TSESLint.RuleModule<'useSwitchForEnumLiteral', []> = {
  meta: {
    type: 'suggestion',
    docs: { description: '禁止对字面量枚举进行 if 判断并使用 else，应该使用 switch 来穷尽所有情况.' },
    messages: { useSwitchForEnumLiteral: '检测到对字面量枚举的 if-else 判断，建议改用 switch 来穷尽所有情况.' },

    schema: [],
  },
  defaultOptions: [],
  create(context: TSESLint.RuleContext<'useSwitchForEnumLiteral', []>): TSESLint.RuleListener {
    const parserServices = context.parserServices
    const typeChecker = parserServices?.program?.getTypeChecker()

    /**
     * 检查类型是否是字面量联合类型（枚举）
     * 返回 true 如果是纯字面量联合类型，false 否则
     * 排除布尔值类型（true | false 是语言的基本类型，不属于枚举）
     */
    function isLiteralUnionType(type: ts.Type): boolean {
      if (!typeChecker) return false

      // 如果是布尔类型或只包含布尔字面量，排除掉
      if ((type.flags & ts.TypeFlags.Boolean) !== 0) {
        return false
      }

      // 检查是否是联合类型
      if ((type.flags & ts.TypeFlags.Union) === 0) {
        return false
      }

      const union = type as ts.UnionType

      // 联合类型中必须至少有 2 个成员
      if (union.types.length < 2) {
        return false
      }

      // 检查所有类型成员是否都是字面量类型（只接受字符串和数字字面量，排除布尔值）
      for (const t of union.types) {
        const isStringLiteral = (t.flags & ts.TypeFlags.StringLiteral) !== 0
        const isNumberLiteral = (t.flags & ts.TypeFlags.NumberLiteral) !== 0

        // 注意：不接受布尔字面量，布尔值是语言基本类型
        if (!isStringLiteral && !isNumberLiteral) {
          return false
        }
      }

      return true
    }

    /**
     * 获取被比较的变量的类型
     */
    function getComparisonVariableType(expr: TSESTree.Expression): ts.Type | null {
      if (!typeChecker || !parserServices?.esTreeNodeToTSNodeMap) {
        return null
      }

      try {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(expr)
        if (!tsNode) return null

        if (expr.type === 'Identifier') {
          const symbol = typeChecker.getSymbolAtLocation(tsNode)
          if (symbol && symbol.valueDeclaration) {
            return typeChecker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)
          }
        }

        return typeChecker.getTypeAtLocation(tsNode)
      } catch {
        return null
      }
    }

    /**
     * 检查条件是否是简单的等于比较
     */
    function getEqualityOperands(node: TSESTree.Expression): [TSESTree.Expression, TSESTree.Expression] | null {
      if (node.type === 'BinaryExpression') {
        const binExpr = node as unknown as { operator: string; left: TSESTree.Expression; right: TSESTree.Expression }
        if (['===', '!==', '==', '!='].includes(binExpr.operator)) {
          return [binExpr.left, binExpr.right]
        }
      }
      return null
    }

    return {
      IfStatement(node: TSESTree.IfStatement) {
        // 仅在 if 有 else 分支时检查
        if (node.alternate === null) {
          return
        }

        // 检查是否是等于/不等于比较
        const operands = getEqualityOperands(node.test)
        if (!operands) {
          return
        }

        const [left, right] = operands

        // 尝试从两边获取类型，判断是否是字面量枚举
        const leftType = getComparisonVariableType(left)
        const rightType = getComparisonVariableType(right)

        if (leftType && isLiteralUnionType(leftType)) {
          context.report({ node: node.alternate, messageId: 'useSwitchForEnumLiteral' })
          return
        }

        if (rightType && isLiteralUnionType(rightType)) {
          context.report({ node: node.alternate, messageId: 'useSwitchForEnumLiteral' })
        }
      },
    }
  },
}

export default rule
