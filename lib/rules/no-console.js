module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow console.log statements',
      category: 'Possible Errors',
      recommended: false,
    },
    schema: [], // no options
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'console' &&
          node.callee.property.name === 'log'
        ) {
          context.report({
            node,
            message: '测试报错',
          })
        }
      },
    }
  },
}
