module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止类属性使用确定赋值断言 (foo!: T)',
      recommended: 'error',
    },
    messages: {
      noDefiniteAssignment: '类属性不允许使用确定赋值断言 (!:)',
    },
    schema: [],
  },
  create(context) {
    return {
      ClassProperty(node) {
        if (node.definite) {
          context.report({
            node,
            messageId: 'noDefiniteAssignment',
          })
        }
      },
      PropertyDefinition(node) {
        if (node.definite) {
          context.report({
            node,
            messageId: 'noDefiniteAssignment',
          })
        }
      },
    }
  },
}
