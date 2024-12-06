module.exports = {
  create(context) {
    return {
      UnaryExpression(node) {
        if (node.operator === '!' && !(node.argument.type === 'Literal' && typeof node.argument.value === 'boolean')) {
          context.report({
            node,
            message: "禁止对非布尔值使用 '!' 运算符。",
          })
        }
      },
    }
  },
}
