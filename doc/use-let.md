# prefer-let

## 概述

`prefer-let` 是一个自定义 ESLint 规则，用于强制在 JavaScript 或 TypeScript 文件中使用 `let` 替代 `const` 和 `var`。此规则帮助开发人员统一代码风格，确保变量声明始终使用 `let`，并避免使用 `const` 和 `var`，不论变量是否会重新赋值。

## 功能

- **强制使用 `let`**: 自动检查代码中的所有变量声明，确保使用 `let` 来声明变量。
- **禁止使用 `const` 和 `var`**: 规则会报告 `const` 或 `var` 的使用，并建议将其替换为 `let`。
- **自动修复**: 如果 ESLint 检查到 `const` 或 `var`，它将自动将这些声明修复为 `let`。

## 示例

### 有效示例

```typescript
// 使用 let 来声明变量
let myVar = 10;

function myFunction() {
  // 其他代码
}
```

### 无效示例

```typescript
// 使用 const 来声明变量
const myVar = 10;

function myFunction() {
  // 其他代码
}
```

在无效示例中，ESLint 将报告错误，因为 `const` 被替换为 `let`。

### 自动修复

ESLint 还支持自动修复功能，将 `const` 和 `var` 自动替换为 `let`。只需运行以下命令来自动修复代码：

```bash
npx eslint . --ext .ts,.js --fix
```

## 配置

此规则没有任何选项，启用后会强制在所有变量声明中使用 `let`，并自动修复任何不符合规则的代码。
