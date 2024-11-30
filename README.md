# eslint-plugin

## 概述

一些自己写的eslint插件

## 安装

1. **安装包**

    ```
    npm i @lsby/eslint-plugin
    ```

2. **安装 ESLint**

    确保你的项目中已安装 ESLint 和 TypeScript ESLint 解析器。如果尚未安装，可以使用以下命令进行安装：

    ```
    npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
    ```

3. **配置 ESLint**

    在你的 ESLint 配置文件中引入并启用规则：

    ```javascript
    module.exports = {
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        '@lsby/no-broken-link': 'error',
        '@lsby/prefer-let': 'error',
      },
    };
    ```
