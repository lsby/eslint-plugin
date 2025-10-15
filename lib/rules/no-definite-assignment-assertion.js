module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止类属性使用确定赋值断言 (foo!: T)',
      recommended: 'error',
    },
    messages: {
      noDefiniteAssignment: '类属性 "{{name}}" 不允许使用确定赋值断言 (!:)',
    },
    schema: [],
  },
  create(context) {
    return {
      ClassProperty(node) {
        if (node.definite) {
          let name = '未知属性名'
          if (node.key && node.key.type === 'Identifier') {
            name = node.key.name
          }
          context.report({
            node,
            messageId: 'noDefiniteAssignment',
            data: { name },
          })
        }
      },
      PropertyDefinition(node) {
        if (node.definite) {
          let name = '未知属性名'
          if (node.key && node.key.type === 'Identifier') {
            name = node.key.name
          }
          context.report({
            node,
            messageId: 'noDefiniteAssignment',
            data: { name },
          })
        }
      },
    }
  },
}
