---
title: Snipaste 在 Linux 自启动存在的问题
published: 2026-02-18
tags: [Linux, UI, GUI, DE, KDE, Snipaste]
category: app::linux::KDE
---

由于 Snipaste 的 "开机启动" 选项点击无反应, 本人尝试在 KDE 设置的 "自动启动" 中添加 Snipaste 的启动项, 但由于未知原因, 使用该功能启动的 Snipaste 会删除 `~/.config/autostart` 下的 `Snipaste.desktop` (可能是 "开机启动" 选项无法设置为 True, 导致 Snipaste 认为需要禁用开机启动), 后开机启动失败

## 环境信息
```
Snipaste 2.11.3 (2026.01.18) Linux (Free Version)

Operating System: Arch Linux
KDE Plasma Version: 6.5.5
KDE Frameworks Version: 6.22.0
Qt Version: 6.10.2
Kernel Version: 6.18.9-arch1-2 (64-bit)
Graphics Platform: X11
```

## 解决方法
一个可能的解决方法: 创建与 `Snipaste.desktop` 不同名称的 `.desktop` 文件自启动 Snipaste

对于 KDE, 可以在 "自动启动" 中新建 Snipaste 的自动启动, 而后修改 `~/.config/autostart` 下的 `Snipaste.desktop` 为其他名称 (并不再创建该名称的文件), 例如:
```sh
mv ~/.config/autostart/Snipaste.desktop ~/.config/autostart/Snipaste-custom.desktop
```
