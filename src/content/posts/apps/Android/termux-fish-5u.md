---
title: 使用 Termux 中的 fish shell 连接远程 fish shell 时显示 `5u` 等奇怪字符
published: 2025-09-10
tags: [Android, termux]
category: app::android
---

> <https://fishshell.com/blog/new-in-40>

在本地和远程的 fish 执行如下指令以禁用不支持的协议
```sh
set -Ua fish_features no-keyboard-protocols
```
