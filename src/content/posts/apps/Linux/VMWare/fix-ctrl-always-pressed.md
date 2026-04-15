---
title: 修复在 ArchLinux (KDE) 下, VMWare 会导致 `Ctrl` 键一直被按下
published: 2025-09-10
tags: [Linux, vm]
category: app::linux::vmware
---

## 猜测原因
VMWare 试图 hook `Ctrl` 键以监听 `Hot Key` (从虚拟机里返回的热键), 但是对 `Ctrl` 的处理存在问题

## 解决方法
1. 打开 `VMware Workstation`
2. 选择菜单项 `Edit` > `Preferences` (或 使用快捷键 `Ctrl + P`)
3. 在弹出的 `Preferences` 配置窗口中, 打开 `Hot Keys` 子项
4. 取消对 `Ctrl` 键的选定 (`Ctrl` 键图标没有被按下)
