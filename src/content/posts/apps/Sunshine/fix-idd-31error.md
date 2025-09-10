---
title: 修复 IDD 虚拟显示器 Code 31 错误
published: 2025-09-10
tags: [virtual-display, Sunshine, Moonlight, Windows]
category: app::sunshine
---

## 问题描述
在使用 Sunshine 连接到 IDD 虚拟显示器时, 回退到默认显示器, 设备管理器中显示 IDD 显示适配器出现 Code 31 错误

## 猜测原因
1. 在 Sunshine 关闭连接前强制终止了 Sunshine 使得 Windows 显示器配置与 Sunshine 认为的状态不同步
2. Sunshine 没有以 管理员身份运行, 造成 `重置记忆显示设备组合态` 操作无效

## 解决方案
### 通过 Regedit 删除 Windows 记忆的显示器配置
1. 打开注册表编辑器并转到路径 `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\GraphicsDrivers\`
2. 删除 `Configuration` 和 `Connectivity` 文件夹 <br>
(其实一般仅删除 `Connectivity` 方可, 这样可以保留其他显示器配置)
::: warning
↑ 删除 `Configuration` 文件夹会删除所有历史显示器配置
:::
3. 禁用再启用虚拟显示器
4. 必要时重启 Sunshine

## 注意
1. 在使用虚拟显示器下意外退出 Sunshine 会导致本问题发生
2. 对于主屏幕缩放与虚拟显示器不同的可能导致切换显示器时发生较大卡顿
3. 不建议使用禁用其他显示器的方案, 出现问题可能性较高
