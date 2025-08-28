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
