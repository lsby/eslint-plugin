import noDefiniteAssignmentAssertion from './lib/rules/no-definite-assignment-assertion'
import noElseOnEquality from './lib/rules/no-else-on-equality'
import noNegation from './lib/rules/no-negation'
import noSwitchDefault from './lib/rules/no-switch-default'
import preferLet from './lib/rules/prefer-let'
import preferSwitchOverMultiIf from './lib/rules/prefer-switch-over-multi-if'

module.exports = {
  rules: {
    'prefer-let': preferLet,
    'no-negation': noNegation,
    'no-definite-assignment-assertion': noDefiniteAssignmentAssertion,
    'no-else-on-equality': noElseOnEquality,
    'no-switch-default': noSwitchDefault,
    'prefer-switch-over-multi-if': preferSwitchOverMultiIf,
  },
}
