const { RuleTester } = require('eslint')
const rule = require('../lib/rules/no-console')

const ruleTester = new RuleTester()

ruleTester.run('no-console', rule, {
  valid: ['var a = 1;'],
  invalid: [
    {
      code: 'console.log("test");',
      errors: [{ message: '测试报错' }],
    },
  ],
})
