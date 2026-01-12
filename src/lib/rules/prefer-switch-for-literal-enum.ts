// 禁止对字面量枚举进行 if-else 判断
// 因为一旦字面量状态扩充, else 就会默默吃掉新增的状态
// 当判断字面量枚举时, 应该使用 switch 来穷尽所有情况

import ts from 'typescript'
import type { ParserServicesWithTypeInformation, TSESLint, TSESTree } from '@typescript-eslint/utils'

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
        // 只检查不是某个 else if 的 if 语句（即顶层的 if）
        const parent = node.parent
        if (parent && parent.type === 'IfStatement' && parent.alternate === node) {
          return
        }

        // 检查是否有最终的 else 分支
        if (!hasFinalElseBranch(node)) return

        // 检查是否是字面量对比（test 是 BinaryExpression === 或 == 比较）
        if (node.test.type === 'BinaryExpression' && (node.test.operator === '===' || node.test.operator === '==')) {
          const { left, right } = node.test

          // 使用 TypeScript 类型检查器检查类型
          const parserServices =
            (context.parserServices as ParserServicesWithTypeInformation) ||
            (context.sourceCode?.parserServices as ParserServicesWithTypeInformation)
          if (!parserServices || !parserServices.program || !parserServices.esTreeNodeToTSNodeMap) return

          const typeChecker: ts.TypeChecker = parserServices.program.getTypeChecker()

          // 获取比较的主体（可能是左侧或右侧，且不是字面量）
          const comparedSubject = getComparedSubject(left, right, parserServices, typeChecker)
          if (!comparedSubject) return

          const tsNode = comparedSubject

          // 尝试获取主体的声明类型而不仅仅是值的类型
          let variableType = typeChecker.getTypeAtLocation(tsNode)

          // 如果是标识符，尝试获取其符号的类型
          if (ts.isIdentifier(tsNode)) {
            const symbol = typeChecker.getSymbolAtLocation(tsNode)
            if (symbol) {
              const declarations = symbol.declarations
              if (declarations && declarations.length > 0) {
                // 尝试从变量声明获取类型
                const declaration = declarations[0]
                if (ts.isVariableDeclaration(declaration) && declaration.type) {
                  variableType = typeChecker.getTypeFromTypeNode(declaration.type)
                }
              }
            }
          }

          // 检查是否是字面量联合类型
          const literalTypeIds = getLiteralTypeIds(variableType)

          if (literalTypeIds.length === 0) return

          // 检查 if-else 链是否混合使用了相等和其他比较操作符
          // 为了避免复杂性和误伤，混合使用的情况下放行
          if (hasMixedComparisonOperators(node)) return

          // 统计 if-else if 链中已经处理的字面量值（使用 Type.id 来区分）
          const handledTypeIds = new Set<number>()
          collectHandledTypeIds(node, tsNode, typeChecker, parserServices, handledTypeIds)

          // 计算 else 分支实际处理的情况数
          const uncoveredCount = literalTypeIds.length - handledTypeIds.size

          // 只有当 else 覆盖多于一种情况时才报错
          if (uncoveredCount > 1) {
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
    if (current.alternate === null) return false
    if (current.alternate.type !== 'IfStatement') return true
    current = current.alternate
  }

  return false
}

/**
 * 检查 if-else if 链是否混合使用了相等操作符（=== 或 ==）和其他比较操作符（>, <, >=, <=, !=, !==）
 * 如果混合使用，为了避免复杂的逻辑分析和误伤，返回 true（应该放行）
 */
function hasMixedComparisonOperators(node: TSESTree.IfStatement): boolean {
  let hasEqualityOperator = false
  let hasOtherOperator = false

  let current: TSESTree.IfStatement | null = node
  while (current) {
    if (current.test.type === 'BinaryExpression') {
      const operator = current.test.operator
      // 相等操作符
      if (operator === '===' || operator === '==') {
        hasEqualityOperator = true
      }
      // 其他比较操作符
      if (
        operator === '>' ||
        operator === '<' ||
        operator === '>=' ||
        operator === '<=' ||
        operator === '!=' ||
        operator === '!=='
      ) {
        hasOtherOperator = true
      }
    }

    // 如果发现了混合使用，立即返回
    if (hasEqualityOperator && hasOtherOperator) {
      return true
    }

    // 移动到 else if
    if (current.alternate && current.alternate.type === 'IfStatement') {
      current = current.alternate
    } else {
      break
    }
  }

  return false
}

/**
 * 检查是否是字面量类型（字符串、数字或布尔字面量）
 */
function isLiteralType(type: ts.Type): boolean {
  return type.isStringLiteral() || type.isNumberLiteral() || !!(type.flags & ts.TypeFlags.BooleanLiteral)
}

/**
 * 从二元表达式的左右两侧提取被比较的"主体"（非字面量值的那一侧）
 * 支持任意表达式：Identifier, MemberExpression, CallExpression, TSAsExpression 等
 * 也支持常量引用（如 const X = 'a' as const，然后 if (y === X)）
 * 返回 TypeScript AST 节点，如果两侧都是字面量或无法确定则返回 null
 */
function getComparedSubject(
  left: TSESTree.Expression,
  right: TSESTree.Expression,
  parserServices: ParserServicesWithTypeInformation,
  typeChecker: ts.TypeChecker,
): ts.Node | null {
  const tsLeft = parserServices.esTreeNodeToTSNodeMap.get(left) as ts.Node
  const tsRight = parserServices.esTreeNodeToTSNodeMap.get(right) as ts.Node

  // 首先检查 AST 节点类型，优先识别直接的字面量
  const isLeftAstLiteral = left.type === 'Literal'
  const isRightAstLiteral = right.type === 'Literal'

  // 如果一侧是 AST 字面量，另一侧不是，直接返回
  if (isLeftAstLiteral && !isRightAstLiteral) {
    return tsRight
  } else if (!isLeftAstLiteral && isRightAstLiteral) {
    return tsLeft
  }

  // 如果都不是 AST 字面量，尝试用类型系统判断（支持 as const 常量）
  if (!isLeftAstLiteral && !isRightAstLiteral) {
    const leftType = typeChecker.getTypeAtLocation(tsLeft)
    const rightType = typeChecker.getTypeAtLocation(tsRight)

    const isLeftLiteralType = isLiteralType(leftType)
    const isRightLiteralType = isLiteralType(rightType)

    // 只有当一侧是字面量类型，另一侧不是时，才能继续
    if (isLeftLiteralType && !isRightLiteralType) {
      return tsRight
    } else if (!isLeftLiteralType && isRightLiteralType) {
      return tsLeft
    }
  }

  return null
}

/**
 * 比较两个 TypeScript AST 节点是否代表同一个主体
 * 支持：
 * - Identifier：变量名相同
 * - MemberExpression：对象和属性都相同
 * - CallExpression：函数和参数都相同
 * - TSAsExpression：忽略类型断言，比较内层表达式
 * 等等
 */
function isSameSubject(node1: ts.Node, node2: ts.Node, typeChecker: ts.TypeChecker): boolean {
  // 简单的情况：节点文本相同
  if (node1.getText() === node2.getText()) {
    return true
  }

  // 如果两个节点的符号相同，认为它们代表同一个主体
  if (ts.isIdentifier(node1) && ts.isIdentifier(node2)) {
    const symbol1 = typeChecker.getSymbolAtLocation(node1)
    const symbol2 = typeChecker.getSymbolAtLocation(node2)
    if (symbol1 && symbol2 && symbol1 === symbol2) {
      return true
    }
  }

  return false
}

/**
 * 获取字面量联合类型的所有 Type.id
 */
function getLiteralTypeIds(type: ts.Type): number[] {
  const typeIds: number[] = []

  if (type.isUnion()) {
    type.types.forEach((memberType) => {
      if (isLiteralType(memberType)) {
        typeIds.push((memberType as any).id)
      }
    })
  } else {
    if (isLiteralType(type)) {
      typeIds.push((type as any).id)
    }
  }

  return typeIds
}

/**
 * 递归收集 if-else if 链中已经处理的字面量值（使用 Type.id 来区分）
 */
function collectHandledTypeIds(
  node: TSESTree.IfStatement,
  comparedSubject: ts.Node,
  typeChecker: ts.TypeChecker,
  parserServices: ParserServicesWithTypeInformation,
  handledTypeIds: Set<number>,
): void {
  // 检查当前 if 的条件
  if (node.test.type === 'BinaryExpression' && (node.test.operator === '===' || node.test.operator === '==')) {
    const { left, right } = node.test

    // 判断哪一侧是比较的主体，哪一侧是值
    let valueNode: TSESTree.Expression | null = null

    const tsLeft = parserServices.esTreeNodeToTSNodeMap.get(left) as ts.Node
    const tsRight = parserServices.esTreeNodeToTSNodeMap.get(right) as ts.Node

    if (isSameSubject(tsLeft, comparedSubject, typeChecker)) {
      valueNode = right
    } else if (isSameSubject(tsRight, comparedSubject, typeChecker)) {
      valueNode = left
    }

    if (valueNode) {
      // 获取值表达式的 TypeScript 类型
      const tsValueNode = parserServices.esTreeNodeToTSNodeMap.get(valueNode) as ts.Node
      const valueType = typeChecker.getTypeAtLocation(tsValueNode)

      // 如果是字面量类型，添加其 id
      if (isLiteralType(valueType)) {
        handledTypeIds.add((valueType as any).id)
      }
    }
  }

  // 递归检查 else if
  if (node.alternate && node.alternate.type === 'IfStatement') {
    collectHandledTypeIds(node.alternate, comparedSubject, typeChecker, parserServices, handledTypeIds)
  }
}

export default rule
