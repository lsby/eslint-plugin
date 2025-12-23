// 永远使用let, 拒绝var和const, 并自动修复
// 禁止const是因为它有抽象泄漏
// 它只对原语值和指针不变, 不对引用值本身不变
// 要搞懂什么可变什么不可变, 必须理解原语值和引用值的区别, 以及变量在内存上的机制
// 如果真的需要表达不变, 应该在类型等级写递归只读

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Replace const and var with let',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
  },

  create(context) {
    return {
      VariableDeclaration(node) {
        // 跳过 unique symbol
        if ((node.kind === 'const' || node.kind === 'var') && !node.declare) {
          let hasUniqueSymbol = node.declarations.some((decl) => {
            const typeAnn = decl.id.typeAnnotation?.typeAnnotation
            return typeAnn?.type === 'TSTypeOperator' && typeAnn.operator === 'unique'
          })
          if (hasUniqueSymbol) return

          // 使用修复功能将 const 或 var 替换为 let
          context.report({
            node,
            message: '使用let代替const或var',
            fix(fixer) {
              const range = node.range
              return fixer.replaceTextRange([range[0], range[0] + node.kind.length], 'let')
            },
          })
        }
      },
    }
  },
}
