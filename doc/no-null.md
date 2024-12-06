# no-null

## 概述

`no-null` 是一个自定义 ESLint 规则，用于禁止在 JavaScript 或 TypeScript 文件中使用 `null`，并强制将其替换为 `undefined`。此规则帮助开发人员统一代码风格，避免使用 `null`，从而减少潜在的错误和不一致的行为。

## 功能

- **禁止使用 `null`**: 自动检查代码中的所有 `null` 值，确保使用 `undefined` 作为替代。
- **自动修复**: 规则会报告 `null` 的使用，并在启用 `--fix` 时将其自动替换为 `undefined`。

## 示例

### 有效示例

```javascript
// 使用 undefined 替代 null
let value = undefined

function myFunction() {
  return undefined
}
```

### 无效示例

```javascript
// 使用 null（不符合规则）
let value = null

function myFunction() {
  return null
}
```

在无效示例中，ESLint 将报告错误，并建议用 `undefined` 替代 `null`。

### 自动修复

ESLint 提供自动修复功能，将所有的 `null` 替换为 `undefined`。运行以下命令即可修复代码：

```bash
npx eslint . --ext .js,.ts --fix
```

修复后，代码会从以下形式：

```javascript
let value = null
```

变为：

```javascript
let value = undefined
```

## 配置

此规则没有可配置选项，启用后会强制在所有代码中禁止使用 `null`，并自动修复不符合规则的代码。
