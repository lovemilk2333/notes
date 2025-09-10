---
title: Koishi Context 一些魔术技巧 (不保证稳定性)
published: 2025-09-10
tags: [Koishi, bot, Nonebot, pl:js]
category: app::koishi
---

> 感谢 [CyanChanges](https://github.com/CyanChanges) 对 Koishi 源码解读的大力支持

## 获取插件所有 `ident`
`ident` 是插件在配置文件中的 ID (见 `koishi.yml`) <br>
注意: 需要在 `apply` 函数运行完成之后调用, 否则始终返回空数组
```ts
/**
 * @return string[]
 */
ctx.loader.paths(ctx.scope)
```

## 重载插件 / 重写插件配置
```ts
// 需要依赖 loader
export const inject = [..., 'loader']

...

const pluginid = `${name}:${iden}`
ctx.emit('manager/reload', parent, pluginid, config?)
```
其中, `parent` 为父插件, `pluginid` 为 `shortname` + `:` + `inden`, `config` 为新的配置对象

## 向 `Command.Action` 的第一个参数 (`Argv`) 注入类型
```ts
declare module 'koishi' {
    interface Argv {
        // key: value-type
    }
}
```
