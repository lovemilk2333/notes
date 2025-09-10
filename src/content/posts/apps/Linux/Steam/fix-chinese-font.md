---
title: 修复 Linux 原生游戏中文字体显示空白
published: 2025-09-10
tags: [Linux, Steam, font]
category: app::linux::steam
---

1. 安装所需字体 `wqy-microhei` \
    对于 ArchLinux, 请使用
    ```sh
    sudo pacman -Sy wqy-microhei
    ```

2. 使用 Steam 兼容层运行
    1. 打开 `库 > <name-of-your-game>` 页面
    2. 单击右侧小齿轮并打开属性面板
    3. 单击左侧兼容层选项卡
    4. 勾选 "强制使用特定 Steam Play 兼容性工具", 下方选择 "Legacy runtime 1.0"
