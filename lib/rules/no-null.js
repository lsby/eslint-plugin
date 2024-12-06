module.exports = {
  meta: {
    type: 'suggestion', // 表示这是个建议类型的规则
    docs: {
      description: 'Disallow usage of null and replace it with undefined',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code', // 支持自动修复
    schema: [], // 无额外配置
  },
  create(context) {
    return {
      Literal(node) {
        if (node.value === null) {
          context.report({
            node,
            message: '不允许使用‘null’。使用‘undefined’代替。',
            fix(fixer) {
              return fixer.replaceText(node, 'undefined')
            },
          })
        }
      },
    }
  },
}
