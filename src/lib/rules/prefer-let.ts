// 永远使用let, 拒绝var和const, 并自动修复
// 原因:
// 1 抽象泄漏
// const只约束原语值和指针不变, 不约束引用值本身不变
// 使用者要搞懂什么可变什么不可变, 必须理解原语值和引用值的区别, 以及变量在内存上的机制
// 这种"必须搞懂背后的原理才能正常使用"的情况是显然的抽象泄漏
// 2 误导
// 对于新人, 很容易被误解, 导致引用值被意外修改
// 3 心智成本
// 实际使用时, 即使是const声明值, 也必须确认其是否为引用类型, 若是则还是需要确认所有可能的修改
// 这与let无异, 反而增加了心智成本
// **错误的信息比没有信息更糟糕**
// 替代:
// 如果真的需要表达不变, 应该使用类型等级的递归只读, 建模隐藏等方法
// 这虽然复杂度更高, 但可以真正保证安全
// 这也迫使程序员思考是否真的有必要这样设计, 而不是"随手一用", 提供一个"虚假的安全感"

import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

const rule: TSESLint.RuleModule<'preferLet', []> = {
  meta: {
    type: 'suggestion',
    docs: { description: '禁止使用 const 和 var，仅允许使用 let 声明变量' },
    fixable: 'code',
    messages: { preferLet: '使用 let 代替 {kind}' },
    schema: [],
  },
  defaultOptions: [],
  create(context: TSESLint.RuleContext<'preferLet', []>): TSESLint.RuleListener {
    return {
      VariableDeclaration(node: TSESTree.VariableDeclaration) {
        // 跳过 unique symbol
        if (node.kind === 'const' || node.kind === 'var') {
          if (!('declare' in node && node.declare === true)) {
            const hasUniqueSymbol = node.declarations.some((decl) => {
              const typeAnn = decl.id.typeAnnotation?.typeAnnotation
              return typeAnn?.type === 'TSTypeOperator' && typeAnn.operator === 'unique'
            })
            if (hasUniqueSymbol) return

            context.report({
              node,
              messageId: 'preferLet',
              data: { kind: node.kind },
              fix(fixer) {
                if (!node.range) return null
                return fixer.replaceTextRange([node.range[0], node.range[0] + node.kind.length], 'let')
              },
            })
          }
        }
      },
    }
  },
}

export default rule
