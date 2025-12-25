// 禁止对字面量枚举进行 if-else 判断
// 因为一旦字面量状态扩充, else 就会默默吃掉新增的状态
// 当判断字面量枚举时, 应该使用 switch 来穷尽所有情况

import ts from 'typescript'
import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

const rule: TSESLint.RuleModule<'preferSwitch', []> = {
  meta: {
    type: 'suggestion',
    docs: { description: '禁止对字面量枚举进行 if-else 判断，应使用 switch' },
    messages: { preferSwitch: '对字面量联合类型应使用 switch 语句而不是 if-else，以确保穷尽所有分支' },
    schema: [],
  },
  defaultOptions: [],
  create(context: TSESLint.RuleContext<'preferSwitch', []>): TSESLint.RuleListener {
    return {
      IfStatement(node: TSESTree.IfStatement) {
        // 检查是否有最终的 else 分支（递归检查）
        const hasFinalElse = hasFinalElseBranch(node)

        if (!hasFinalElse) return

        // 检查是否是字面量对比（test 是 BinaryExpression === 或 == 比较）
        if (node.test.type === 'BinaryExpression' && (node.test.operator === '===' || node.test.operator === '==')) {
          const { left, right } = node.test

          // 获取比较的变量（可能是左侧或右侧）
          const variableNode = left.type === 'Identifier' ? left : right.type === 'Identifier' ? right : null

          if (!variableNode) return

          // 使用 TypeScript 类型检查器检查类型
          const parserServices = context.parserServices
          if (!parserServices || !parserServices.program) return

          const typeChecker: ts.TypeChecker = parserServices.program.getTypeChecker()
          const tsNode = parserServices.esTreeNodeToTSNodeMap.get(variableNode)
          const variableType = typeChecker.getTypeAtLocation(tsNode)

          // 检查是否是字面量联合类型
          const isLiteralUnion = isLiteralUnionType(variableType, typeChecker)

          if (isLiteralUnion) {
            context.report({ node, messageId: 'preferSwitch' })
          }
        }
      },
    }
  },
}

/**
 * 检查 if-else 链是否有最终的 else 分支
 */
function hasFinalElseBranch(node: TSESTree.IfStatement): boolean {
  let current: TSESTree.IfStatement | TSESTree.Statement = node

  while (current.type === 'IfStatement') {
    if (current.alternate === null) {
      // 没有 else 分支
      return false
    }

    if (current.alternate.type !== 'IfStatement') {
      // 有最终的 else 分支
      return true
    }

    // 继续检查 else if
    current = current.alternate
  }

  return false
}

/**
 * 检查类型是否是字面量联合类型
 */
function isLiteralUnionType(type: ts.Type, typeChecker: ts.TypeChecker): boolean {
  // 如果是联合类型，检查每个成员是否都是字面量类型
  if (type.isUnion()) {
    return type.types.every((memberType) => {
      const flags = memberType.flags
      return (
        (flags & ts.TypeFlags.StringLiteral) !== 0 ||
        (flags & ts.TypeFlags.NumberLiteral) !== 0 ||
        (flags & ts.TypeFlags.BooleanLiteral) !== 0
      )
    })
  }

  // 如果是单个字面量类型，也认为是字面量联合（只有一个成员的联合）
  const flags = type.flags
  return (
    (flags & ts.TypeFlags.StringLiteral) !== 0 ||
    (flags & ts.TypeFlags.NumberLiteral) !== 0 ||
    (flags & ts.TypeFlags.BooleanLiteral) !== 0
  )
}

export default rule
