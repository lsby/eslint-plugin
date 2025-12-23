
export var noElseRule = {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止使用 else, 避免不稳定的否定剩余分支',
    },
    messages: {
      noElse: '禁止使用 else, 请改用 early return 或 switch',
    },
    schema: [],
  },

  create(context) {
    return {
      IfStatement(node) {
        if (node.alternate !== null) {
          context.report({
            node: node.alternate,
            messageId: 'noElse',
          })
        }
      },
    }
  },
}
