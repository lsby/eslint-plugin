module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce using `hasOwnProperty` instead of unsafe `null` checks',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code', // 自动修复支持
    messages: {
      useHas: 'Avoid comparing with `null` directly. Use `hasOwnProperty` for existence checks.',
    },
    schema: [], // No options
  },
  create(context) {
    return {
      BinaryExpression(node) {
        // 检查是不是 a[x] === null 或 a[x] !== null
        if (
          ['===', '!=='].includes(node.operator) &&
          node.left.type === 'MemberExpression' &&
          node.right.raw === 'null'
        ) {
          // 检查是不是类实例的 null 比较, 比如 this.x === null
          const isClassPropertyCheck = node.left.object.type === 'ThisExpression'
          if (isClassPropertyCheck) {
            // 如果是类实例的 null 检查，则跳过修复
            return
          }

          // 默认的 hasOwnProperty 检查
          context.report({
            node,
            messageId: 'useHas',
            fix(fixer) {
              const sourceCode = context.getSourceCode()
              const objectCode = sourceCode.getText(node.left.object)
              const propertyCode = sourceCode.getText(node.left.property)

              let replacement = `${objectCode}.hasOwnProperty(${propertyCode})`
              replacement = `!${replacement}`

              return fixer.replaceText(node, replacement)
            },
          })
        }
      },
    }
  },
}
