// jsdoc的link必须存在

module.exports = {
  meta: {
    type: 'problem', // 规则类型，可以是 "problem", "suggestion", 或 "layout"
    docs: {
      description: 'Check for broken {@link} references in comments',
      category: 'Possible Errors',
      recommended: false,
    },
    schema: [], // 规则的选项配置
  },
  create: function (context) {
    return {
      Program(node) {
        const sourceCode = context.getSourceCode()
        const comments = sourceCode.getAllComments()

        comments.forEach((comment) => {
          const matches = comment.value.match(/\{@link\s+([^\s}]+)\s*\}/g)

          if (matches) {
            matches.forEach((link) => {
              const identifier = link.match(/\{@link\s+([^\s}]+)\s*\}/)[1]

              const variables = context.getScope().variables
              const isDefined = variables.some((variable) => variable.name === identifier)

              if (!isDefined) {
                context.report({
                  node: comment,
                  message: `{@link}中的标识符“${identifier}”没有定义。`,
                })
              }
            })
          }
        })
      },
    }
  },
}
