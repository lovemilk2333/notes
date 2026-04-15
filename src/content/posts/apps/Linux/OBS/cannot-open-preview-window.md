---
title: 修复 OBS Studio 在 NVIDIA 显卡上打开 全屏/窗口预览 会导致崩溃
published: 2025-09-10
tags: [Linux, UI, GUI, NVIDIA, OBS]
category: app::linux::OBS
---

设置环境变量
```sh
__NV_DISABLE_EXPLICIT_SYNC=1
```
