// 禁止对于等于/不等于条件的 else 处理多种状态
// 因为对于这些条件，else 表示"除给定状态外的所有可能"
// 对于状态小于等于两个的条件, else 只会兜底一种情况, 这是正确的
// 但如果状态继续增加, else 兜底必然匹配一个以上种状态
// 此时 else 部分会默默吃掉新增状态却无任何提示, 这很容易造成意外的状态逻辑遗漏
// 这种情况下应当使用提早返回(early return)或 switch 穷尽

import * as ts from 'typescript'
import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

const rule: TSESLint.RuleModule<'noElse', []> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        '禁止在非二值状态的等于/不等于条件中使用 else。当状态扩张时，else 会隐匿地处理新状态，容易造成状态逻辑遗漏。',
    },
    messages: {
      noElse:
        '禁止在非二值状态的等于/不等于条件中使用 else。若逻辑本质为二值状态，请先通过辅助变量表示为布尔值；若为多状态逻辑，请使用提早返回(early return)或 switch 穷尽。',
    },

    schema: [],
  },
  defaultOptions: [],
  create(context: TSESLint.RuleContext<'noElse', []>): TSESLint.RuleListener {
    const parserServices = context.parserServices
    const typeChecker = parserServices?.program?.getTypeChecker()

    /**
     * 计算类型中的字面量值个数
     */
    function countLiteralVariants(type: ts.Type): number {
      // 先检查联合类型，因为它可能包含其他标志
      if ((type.flags & ts.TypeFlags.Union) !== 0) {
        const union = type as ts.UnionType
        // Count distinct types in union
        let count = 0
        for (const t of union.types) {
          count += countLiteralVariants(t)
        }
        return count
      }

      // 布尔类型有 2 个值：true 和 false
      if ((type.flags & ts.TypeFlags.Boolean) !== 0) {
        return 2
      }

      // 布尔字面量类型（true 或 false）
      if ((type.flags & ts.TypeFlags.BooleanLiteral) !== 0) {
        return 1
      }

      // null 类型（1 个值）
      if ((type.flags & ts.TypeFlags.Null) !== 0) {
        return 1
      }

      // undefined 类型（1 个值）
      if ((type.flags & ts.TypeFlags.Undefined) !== 0) {
        return 1
      }

      // 字面量类型
      if ((type.flags & (ts.TypeFlags.StringLiteral | ts.TypeFlags.NumberLiteral)) !== 0) {
        return 1
      }

      // 其他类型（如 number、string 等）认为是无限的
      return Infinity
    }

    /**
     * 检查条件中是否包含等于或不等于操作符，以及被比较的值
     * 返回 [operand1, operand2] 或 null
     */
    function getEqualityOperands(node: TSESTree.Expression): [TSESTree.Expression, TSESTree.Expression] | null {
      if (node.type === 'BinaryExpression') {
        const binExpr = node as unknown as { operator: string; left: TSESTree.Expression; right: TSESTree.Expression }
        if (['===', '!==', '==', '!='].includes(binExpr.operator)) {
          return [binExpr.left, binExpr.right]
        }
        return null
      }
      if (node.type === 'LogicalExpression') {
        const left = getEqualityOperands(node.left)
        if (left) return left
        return getEqualityOperands(node.right)
      }
      return null
    }

    /**
     * 检查是否应该允许 else（状态数 ≤ 2）
     * 返回 true 表示允许 else，false 表示不允许
     */
    function shouldAllowElse(leftExpr: TSESTree.Expression, rightExpr: TSESTree.Expression): boolean {
      if (!typeChecker || !parserServices?.esTreeNodeToTSNodeMap) {
        // 无法获取类型信息时，按原始规则：不允许 else
        return false
      }

      try {
        // 获取 TypeScript 节点
        const leftNode = parserServices.esTreeNodeToTSNodeMap.get(leftExpr)
        const rightNode = parserServices.esTreeNodeToTSNodeMap.get(rightExpr)

        if (!leftNode || !rightNode) {
          // 无法映射节点时，按原始规则：不允许 else
          return false
        }

        // 获取两个操作数的类型
        let leftType = typeChecker.getTypeAtLocation(leftNode)
        let rightType = typeChecker.getTypeAtLocation(rightNode)

        // 对于标识符，尝试获取声明的类型
        if (leftExpr.type === 'Identifier') {
          const leftSymbol = typeChecker.getSymbolAtLocation(leftNode)
          if (leftSymbol && leftSymbol.valueDeclaration) {
            leftType = typeChecker.getTypeOfSymbolAtLocation(leftSymbol, leftSymbol.valueDeclaration)
          }
        }
        if (rightExpr.type === 'Identifier') {
          const rightSymbol = typeChecker.getSymbolAtLocation(rightNode)
          if (rightSymbol && rightSymbol.valueDeclaration) {
            rightType = typeChecker.getTypeOfSymbolAtLocation(rightSymbol, rightSymbol.valueDeclaration)
          }
        }

        // 计算每边的字面量值个数
        const leftCount = countLiteralVariants(leftType)
        const rightCount = countLiteralVariants(rightType)

        // 只有当两边都是有限的且都 ≤ 2 个状态时，才允许 else
        const bothFinite = isFinite(leftCount) && isFinite(rightCount)
        const allow = bothFinite && leftCount <= 2 && rightCount <= 2

        return allow
      } catch {
        // 如果出错，按原始规则：不允许 else
        return false
      }
    }

    return {
      IfStatement(node: TSESTree.IfStatement) {
        // 仅在 if 条件是等于或不等于的情况下，禁止 else
        if (node.alternate !== null) {
          const operands = getEqualityOperands(node.test)
          if (operands) {
            const [left, right] = operands
            // 检查是否应该允许 else（基于类型的字面量值个数）
            if (!shouldAllowElse(left, right)) {
              context.report({ node: node.alternate, messageId: 'noElse' })
            }
          }
        }
      },
    }
  },
}

export default rule
