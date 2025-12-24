import noDefiniteAssignmentAssertion from './lib/rules/no-definite-assignment-assertion'
import noEarlyReturnOnEquality from './lib/rules/no-early-return-on-equality'
import noElseOnEquality from './lib/rules/no-else-on-equality'
import noNegation from './lib/rules/no-negation'
import noSwitchDefault from './lib/rules/no-switch-default'
import preferLet from './lib/rules/prefer-let'

module.exports = {
  rules: {
    'prefer-let': preferLet,
    'no-negation': noNegation,
    'no-definite-assignment-assertion': noDefiniteAssignmentAssertion,
    'no-early-return-on-equality': noEarlyReturnOnEquality,
    'no-else-on-equality': noElseOnEquality,
    'no-switch-default': noSwitchDefault,
  },
}
