// 禁止 else
// else 表示"除当前条件外的所有可能"
// 当状态集合未来扩展时, 依然会被包含在else分支里, 导致状态遗漏却无任何报错
// 应当使用提早返回 或 switch + 穷尽检查

module.exports = {
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
