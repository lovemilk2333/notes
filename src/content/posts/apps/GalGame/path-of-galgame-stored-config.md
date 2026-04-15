---
title: 对于 BGI 引擎 GalGame 的配置修复和配置文件存储位置的探寻
published: 2025-09-13
tags: [Wine, Linux, Proton, galgame]
category: app::galgame
---

起因是我在玩 シークレットラブ（仮）的时候遇到了无法启动的问题, 后确保游戏路径没有非 ASCII 字符后, 出现了日文原版可以启动, 汉化版弹窗报错的问题

## 问题
启动日文原版正常, 而启动汉化版显示无法加载字体

## 解决方法
可以启动日文原版, 并将字体改为你的 Wine/Proton (或者 `C:\Windows\Fonts`) 中有的字体 (除 MS Gothic 外, 它的 fallback 字体是日文版 Windows 独有的 MS Gothic, 我的 Proton 里没有), 然后再启动汉化版

如果进行上述操作后单击 `save` 或者 `load` 按钮进入保存/加载界面出现同样的崩溃问题, 请尝试在 Wine/Proton 的 winetricks 上安装 `corefonts`

## 配置文件存储位置
我为了 debug 尝试在 `AppData` 和 `文档`, 游戏根目录下找了好久, 还是没有发现游戏把配置文件存在哪里惹, 通过一番 `strace -e open,openat -f -o <output-log-file> <command>` 之后, 发现改游戏会在退出时候写入游戏根目录下的 `BGI.gdb`, 并且删除该文件后无法启动, 将原始的该文件替换后发现配置重置

同时, 我还在 Steam 上看到这篇帖子 [Question about save files... - Wonderful Everyday Down the Rabbit-Hole](https://steamcommunity.com/app/658620/discussions/0/1474221865189120389/), 大概笃定了这个游戏引擎的配置默认会保存在 `BGI.gdb` 里面, 并且这个文件的前几个直接的 ASCII 是 `SDC FORMAT 1.00` (`53 44 43 20 46 4F 52 4D 41 54 20 31 2E 30 30 00`), 查到是 `Buriko General Interface` 引擎的存储文件

那么以后看到 `BGI.gdb` 一般来说就是 BGI 引擎写的游戏, 并且这个是配置文件了 \
~~所以这玩意和 `GNU Debugger` 有什么关系 (~~
