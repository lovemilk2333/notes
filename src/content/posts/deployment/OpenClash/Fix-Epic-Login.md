---
title: 修复 Epic Game 登录 500 错误
published: 2025-09-10
tags: [OpenWRT, proxy]
category: deployment::openclash
---

## 原因

`store.epicgames.com`, `www.twinmotion.com` 与 `www.fortnite.com` API 获取的 客户端 IP 不一样造成鉴权失败

## 修复

在 rules 添加如下内容, 并保证其使用同一个节点 (推荐 `DIRECT`)  
其中, `EPIC-Web` 是一个规则组

```yml
- DOMAIN,store.epicgames.com,EPIC-Web
- DOMAIN,static-assets-prod.epicgames.com,EPIC-Web
- DOMAIN,static-assets-dev.epicgames.com,EPIC-Web
- DOMAIN,tracking.epicgames.com,EPIC-Web
- DOMAIN,www.twinmotion.com,EPIC-Web
- DOMAIN,www.fortnite.com,EPIC-Web
```

## 扩展

要在 Linux 上使用 Epic Online Service, 可以使用第三方客户端 [_Heroic Games Launcher_](https://heroicgameslauncher.com/) 或 [_Lutris_](https://lutris.net/)
::: danger 危险
使用第三方客户端造成账户安全性问题须由用户自行承担
:::
