import noDefiniteAssignmentAssertion from './lib/rules/no-definite-assignment-assertion'
import noNegation from './lib/rules/no-negation'
import noObjectAssign from './lib/rules/no-object-assign'
import noSwitchDefault from './lib/rules/no-switch-default'
import preferLet from './lib/rules/prefer-let'
import preferSwitchForLiteralEnum from './lib/rules/prefer-switch-for-literal-enum'

module.exports = {
  rules: {
    'prefer-let': preferLet,
    'no-negation': noNegation,
    'no-definite-assignment-assertion': noDefiniteAssignmentAssertion,
    'prefer-switch-for-literal-enum': preferSwitchForLiteralEnum,
    'no-switch-default': noSwitchDefault,
    'no-object-assign': noObjectAssign,
  },
}
