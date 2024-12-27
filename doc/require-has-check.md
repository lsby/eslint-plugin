## 概述

`require-has-check` 是一个自定义 ESLint 规则，用于强制在对象属性检查中使用 `hasOwnProperty` 或 `Map.has`，而不是直接通过索引比较 `null` 或 `undefined`。此规则的目标是提高代码的安全性，避免由于直接索引检查带来的潜在逻辑错误和边界问题。

## 功能

- **禁止通过索引直接比较**: 自动检测代码中 `obj[key] === undefined`、`obj[key] === null` 等形式的属性检查，并禁止使用。
- **建议使用更安全的方法**: 规则会建议使用 `hasOwnProperty` 或 `Map.has`，确保属性检查的行为明确且符合预期。
- **支持自动修复**: 对于违规代码，规则会自动将其修复为使用 `hasOwnProperty` 或 `Map.has` 的形式，简化开发人员的修改工作。

## 示例

### 有效示例

```typescript
// 使用 hasOwnProperty 来检查属性是否存在
if (obj.hasOwnProperty(key)) {
  // 执行逻辑
}

// 对于 Map 类型，使用 Map.has
if (map.has(key)) {
  // 执行逻辑
}
```

### 无效示例

```typescript
// 使用直接索引和 undefined/null 比较
if (obj[key] === undefined) {
  // 这种写法可能导致误判
}

if (obj[key] !== null) {
  // 对 null 的直接比较也会被禁止
}
```

在无效示例中，ESLint 会报告错误，并建议使用 `hasOwnProperty` 或 `Map.has` 替代直接索引比较。

### 自动修复

当代码中出现无效示例时，规则将会尝试自动修复。例如：

```typescript
// 原始代码
if (obj[key] === undefined) {
  // ...
}

// 自动修复后
if (obj.hasOwnProperty(key)) {
  // ...
}
```

对于 `!== undefined` 和 `!== null`，会自动加上否定符号：

```typescript
// 原始代码
if (obj[key] !== null) {
  // ...
}

// 自动修复后
if (!obj.hasOwnProperty(key)) {
  // ...
}
```

## 配置

此规则没有额外的配置选项。启用规则后，插件会在所有 JavaScript 或 TypeScript 文件中强制禁止直接索引检查属性存在性。

启用后，所有不安全的属性检查写法都会被标记为错误，并可以通过 `eslint --fix` 自动修复。
