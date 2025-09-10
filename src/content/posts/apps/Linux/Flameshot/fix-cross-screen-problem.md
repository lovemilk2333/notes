---
title: 修复 Flameshot 跨屏 UI 问题
published: 2025-09-10
tags: [Linux, screenshot, UI, GUI]
category: app::linux::flameshot
---

## 描述
默认情况下, `flameshot gui` 命令会将多个显示器拼接后的画面缩小并渲染在主显示器上

## 解决
设置环境变量 `QT_QPA_PLATFORM=xcb`, 或以如下方式运行 Flameshot:
```sh
env QT_QPA_PLATFORM=xcb flameshot gui
```
::: warning 警告
wayland 用户切勿将其加入 `/etc/environment` 中, 可能会导致 KDE (或其他依赖于 QT 的桌面环境或软件) 无法正常显示
:::
