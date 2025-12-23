module.exports = {
  rules: {
    'no-broken-link': require('./lib/rules/no-broken-link'),
    'prefer-let': require('./lib/rules/prefer-let'),
    'no-negation': require('./lib/rules/no-negation'),
    'no-definite-assignment-assertion': require('./lib/rules/no-definite-assignment-assertion'),
    'no-else': require('./lib/rules/no-else'),
  },
}
