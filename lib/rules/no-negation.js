// 禁止对非布尔值使用取反
// 对于 number | null 的值x, if(!x)在x等于null和0时都会触发, 这可能是非预期的

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
