module.exports = {
  create(context) {
    return {
      UnaryExpression(node) {
        if (node.operator === '!') {
          context.report({
            node,
            message: "禁止使用 '!' 运算符, 写出更明确的判断条件会减少可能的问题, 如果存在重用逻辑就封装函数.",
          })
        }
      },
    }
  },
}
