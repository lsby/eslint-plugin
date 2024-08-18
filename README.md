# eslint插件模板

## 使用

发布后, 在需要使用的项目安装, 然后配置文件:

```JavaScript
module.exports = {
  plugins: [<插件名称>],

  overrides: [
    {
      files: [<作用的文件>],
      rules: {
        '插件名称': 'error',
      },
    },
  ],
}
// 其中, `插件名称`不带前缀`eslint-plugin`
// 但如果插件发布在个人空间下, 例如`@lsby/my-plugin`, 则不用考虑前缀
```

## 调试

可以将这个包打包:

```
npm pack
```

然后解压并复制到其他项目的`node_modules`文件夹中

> 注意, 如果发布在个人空间下, 文件夹的结构应该是`@名字/插件名`

同样按上面的方法引入, 即可生效
