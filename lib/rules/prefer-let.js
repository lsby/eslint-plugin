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
        // 检查变量声明的类型（排除 declare）
        if ((node.kind === 'const' || node.kind === 'var') && !node.declare) {
          // 使用修复功能将 const 或 var 替换为 let
          context.report({
            node,
            message: '使用let代替const或var',
            fix(fixer) {
              // 获取变量声明的范围
              const range = node.range
              // 确保给定的 range 是有效的
              return fixer.replaceTextRange([range[0], range[0] + node.kind.length], 'let')
            },
          })
        }
      },
    }
  },
}
