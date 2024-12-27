module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce using `hasOwnProperty` or `Map.has` instead of unsafe index checks',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code', // 自动修复支持
    messages: {
      useHas:
        'Avoid comparing with `undefined` or `null` directly. Use `hasOwnProperty` or `Map.has` for existence checks.',
    },
    schema: [], // No options
  },
  create(context) {
    return {
      BinaryExpression(node) {
        if (
          ['===', '!=='].includes(node.operator) &&
          node.left.type === 'MemberExpression' &&
          ['undefined', 'null'].includes(node.right.type === 'Identifier' ? node.right.name : node.right.raw)
        ) {
          context.report({
            node,
            messageId: 'useHas',
            fix(fixer) {
              // 自动修复逻辑
              const sourceCode = context.getSourceCode()
              const objectCode = sourceCode.getText(node.left.object)
              const propertyCode = sourceCode.getText(node.left.property)
              const isNegative = node.operator === '!=='
              const replacement = `${objectCode}.hasOwnProperty(${propertyCode})`
              return fixer.replaceText(node, isNegative ? `!${replacement}` : replacement)
            },
          })
        }
      },
    }
  },
}
