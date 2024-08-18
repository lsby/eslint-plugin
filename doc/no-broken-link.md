# no-broken-link

## 概述

`no-broken-link` 是一个自定义 ESLint 规则，用于检查 TypeScript 注释中 `{@link}` 标签是否引用了不存在的标识符。此规则帮助开发人员确保代码注释中的链接引用正确有效，避免在文档中出现无效的链接。

## 功能

- **检查 `{@link}` 标签**: 自动扫描 TypeScript 文件中的注释，确保 `{@link}` 标签中引用的标识符在代码中是定义的。
- **报告未定义的引用**: 如果 `{@link}` 标签引用了一个在代码中未定义的标识符，规则会报告一个错误。

## 使用

在你的 TypeScript 文件中，如果 `{@link}` 标签引用了一个未定义的标识符，ESLint 会报告错误。你可以在项目中运行 ESLint 来验证代码中是否存在无效的 `{@link}` 引用：

```bash
npx eslint . --ext .ts
```

## 示例

### 有效示例

```typescript
import type myFunc from 'xxx'

/**
 * 这个函数的说明文档
 * 使用 {@link myFunc} 来实现功能
 */
function f() {}
```

### 无效示例

```typescript
/**
 * 这个函数的说明文档
 * 使用 {@link missingFunction} 来实现功能
 */
function f() {}
```

在无效示例中，ESLint 将报告错误，因为 `missingFunction` 在代码中未定义。
