module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Replace const and var with let',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    schema: [], // 没有配置选项
  },

  create(context) {
    return {
      VariableDeclaration(node) {
        // 检查变量声明的类型
        if (node.kind === 'const' || node.kind === 'var') {
          // 使用修复功能将 const 或 var 替换为 let
          context.report({
            node,
            message: 'Use let instead of const or var',
            fix(fixer) {
              return fixer.replaceTextRange(
                [node.start, node.start + node.kind.length],
                'let'
              );
            },
          });
        }
      },
    };
  },
};
