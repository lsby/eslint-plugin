module.exports = {
  rules: {
    'no-broken-link': require('./lib/rules/no-broken-link'),
    'prefer-let': require('./lib/rules/prefer-let'),
    'no-negation': require('./lib/rules/no-negation'),
    'no-null': require('./lib/rules/no-null'),
    'require-has-check': require('./lib/rules/require-has-check'),
  },
}
