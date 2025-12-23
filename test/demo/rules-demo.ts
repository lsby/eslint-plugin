/**
 * ESLint Rules Demo
 * 这是一个展示所有规则效果的演示文件
 * 打开此文件，IDE会显示ESLint错误提示
 */

// !!!!!!!!!!!!!!!!!!
// 测试前先编译
// !!!!!!!!!!!!!!!!!!

// ============================================
// 1. prefer-let: 禁止使用 const 和 var
// ============================================

// ❌ 错误: 使用 const
const x = 1

// ❌ 错误: 使用 var
var y = 2

// ✅ 正确: 使用 let
let z = 3

// ============================================
// 2. no-else: 禁止使用 else 分支
// ============================================

function checkStatus(code: number) {
  // ❌ 错误: 使用了 else
  if (code === 200) {
    return 'success'
  } else {
    return 'error'
  }
}

function checkStatusGood(code: number) {
  // ✅ 正确: 使用提早返回，没有 else
  if (code === 200) {
    return 'success'
  }
  return 'error'
}

// ============================================
// 3. no-negation: 禁止对非布尔值使用否定操作符
// ============================================

function processValue(value: string | number) {
  // ❌ 错误: 对非布尔值使用 ! 会导致类型强制转换
  // 这里 !value 会将 string/number 转换为 boolean
  if (!value) {
    console.log('empty value')
  }
}

function processValueGood(value: string | number) {
  // ✅ 正确: 对布尔值使用否定
  let isEmpty = value === '' || value === 0
  if (!isEmpty) {
    console.log('has value')
  }
}

function checkUser(user: { name: string } | null) {
  // ❌ 错误: 对非布尔值对象使用 !
  if (!user) {
    console.log('no user')
  }
}

function checkUserGood(user: { name: string } | null) {
  // ✅ 正确: 显式检查 null
  if (user === null) {
    console.log('no user')
  }
}

// ============================================
// 4. no-definite-assignment-assertion: 禁止使用明确赋值断言
// ============================================

// ❌ 错误: 在类属性上使用明确赋值断言 (!:)
class UserBad {
  name!: string
  age!: number
  email!: string
}

// ✅ 正确: 在构造函数中初始化属性
class UserGood {
  name: string
  age: number
  email: string

  constructor(name: string, age: number, email: string) {
    this.name = name
    this.age = age
    this.email = email
  }
}

// ✅ 正确: 使用默认值初始化
class UserDefault {
  name: string = ''
  age: number = 0
  email: string = ''
}

// ============================================
// 5. no-switch-default: 禁止使用 switch default
// ============================================

function handleAction(action: 'add' | 'remove' | 'update') {
  // ❌ 错误: 使用了 default
  switch (action) {
    case 'add':
      console.log('adding')
      break
    case 'remove':
      console.log('removing')
      break
    default:
      console.log('unknown action')
  }
}

function handleActionGood(action: 'add' | 'remove' | 'update') {
  // ✅ 正确: 使用穷尽检查，没有 default
  switch (action) {
    case 'add':
      console.log('adding')
      break
    case 'remove':
      console.log('removing')
      break
    case 'update':
      console.log('updating')
      break
  }
}

// ============================================
// 6. prefer-switch-over-multi-if: 多个 if 用 switch
// ============================================

function categorize(type: string) {
  // ❌ 错误: 多个连续 if 检查相同变量应该用 switch
  if (type === 'admin') {
    console.log('administrator')
  } else if (type === 'user') {
    console.log('normal user')
  } else if (type === 'guest') {
    console.log('guest user')
  }
}

function testMultipleIfs() {
  // ❌ 错误: 多个连续 if 检查相同变量应该用 switch
  let a = 1
  if (a > 1) {
    console.log('x')
  }
  if (a > 1) {
    console.log('x')
  }

  // ❌ 错误: 多个连续 if 检查相同变量应该用 switch
  let b = 1
  if (b > 1) {
    console.log('x')
  }
  if (b < 1) {
    console.log('x')
  }

  // ❌ 错误: 多个连续 if 检查相同变量应该用 switch
  let x = 1
  let y = 1
  if (x > 1) {
    console.log('x')
  }
  if (x < 1) {
    console.log('x')
  }
  if (y < 1) {
    console.log('x')
  }
}

function categorizeGood(type: string) {
  // ✅ 正确: 使用 switch
  switch (type) {
    case 'admin':
      console.log('administrator')
      break
    case 'user':
      console.log('normal user')
      break
    case 'guest':
      console.log('guest user')
      break
  }
}
