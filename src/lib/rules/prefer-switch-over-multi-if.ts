// 建议使用 switch 替代多个 if 判断同一变量
// 当有多个连续的 if 语句判断同一个表达式时, 应该使用 switch 来提高代码的可读性

import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

const rule: TSESLint.RuleModule<'preferSwitch', []> = {
  meta: {
    type: 'suggestion',
    docs: { description: '检测多个连续 if 判断同一个表达式，建议使用 switch 提高可读性' },
    messages: { preferSwitch: '检测到 {{count}} 个连续的 if 判断同一个表达式，可以考虑使用 switch 提高可读性' },
    schema: [],
  },
  defaultOptions: [],
  create(context: TSESLint.RuleContext<'preferSwitch', []>) {
    const sourceCode = context.sourceCode
    const minIfs = 2

    function getText(node: TSESTree.Node): string {
      return sourceCode.getText(node)
    }

    function isValidCaseValue(node: TSESTree.Expression): boolean {
      return (
        node.type === 'Literal' ||
        node.type === 'TemplateLiteral' ||
        node.type === 'Identifier' ||
        node.type === 'MemberExpression'
      )
    }

    function getSwitchInfo(test: TSESTree.Expression): { variable: string; value: string } | null {
      if (test.type !== 'BinaryExpression') return null
      // 支持所有的二元比较操作符
      const comparisonOps = ['===', '==', '!==', '!=', '>', '<', '>=', '<=']
      if (!comparisonOps.includes(test.operator)) return null

      const left = test.left as TSESTree.Expression
      const right = test.right as TSESTree.Expression

      if ((left.type === 'Identifier' || left.type === 'MemberExpression') && isValidCaseValue(right)) {
        return { variable: getText(left), value: getText(right) }
      }

      if ((right.type === 'Identifier' || right.type === 'MemberExpression') && isValidCaseValue(left)) {
        return { variable: getText(right), value: getText(left) }
      }

      return null
    }

    function collectIfChain(node: TSESTree.IfStatement): TSESTree.IfStatement[] {
      const chain: TSESTree.IfStatement[] = [node]
      let current: TSESTree.IfStatement | null = node

      // 收集 else-if 链
      while (current.alternate && current.alternate.type === 'IfStatement') {
        chain.push(current.alternate)
        current = current.alternate
      }

      // 如果没有 else-if，尝试收集相邻的 if 语句
      if (chain.length === 1 && node.parent) {
        const parent = node.parent
        let body: TSESTree.Statement[] | null = null

        if (parent.type === 'BlockStatement') {
          body = parent.body
        } else if (parent.type === 'Program') {
          body = parent.body
        }

        if (body) {
          const nodeIndex = body.indexOf(node)
          if (nodeIndex !== -1) {
            const firstInfo = getSwitchInfo(node.test)
            if (firstInfo) {
              let nextIndex = nodeIndex + 1
              while (nextIndex < body.length && body[nextIndex].type === 'IfStatement') {
                const nextIfStmt = body[nextIndex] as TSESTree.IfStatement
                if (nextIfStmt.alternate) break // 如果有 else/else-if，停止

                const nextInfo = getSwitchInfo(nextIfStmt.test)
                if (!nextInfo || nextInfo.variable !== firstInfo.variable) break // 变量不同，停止

                chain.push(nextIfStmt)
                nextIndex++
              }
            }
          }
        }
      }

      return chain
    }

    function allSameVariable(chain: TSESTree.IfStatement[]): { variable: string; count: number } | null {
      if (chain.length < minIfs) return null

      const firstInfo = getSwitchInfo(chain[0].test)
      if (!firstInfo) return null

      for (const stmt of chain.slice(1)) {
        const info = getSwitchInfo(stmt.test)
        if (!info || info.variable !== firstInfo.variable) return null
      }

      return { variable: firstInfo.variable, count: chain.length }
    }

    return {
      IfStatement(node) {
        if (node.parent?.type === 'IfStatement' && node.parent.alternate === node) return

        const chain = collectIfChain(node)
        const info = allSameVariable(chain)
        if (!info) return

        context.report({ node, messageId: 'preferSwitch', data: { count: info.count } })
      },
    }
  },
}

export default rule
