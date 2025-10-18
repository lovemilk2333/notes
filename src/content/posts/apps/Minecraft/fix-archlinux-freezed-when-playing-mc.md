---
title: 修复玩 MC 时 Linux 系统卡死
published: 2025-10-19
tags: [Minecraft, Linux]
category: app::minecraft
---

在 ArchLinux 内核版本 > (不含) `6.16.7`[^why-6-16-7] 时, 使用模组 *spark* 会导致系统, SSH 连接, 网络连接卡死, ICMP 正常回复.

## 解决方法
卸载该模组, 若确有需要的, 请留意 [ISSUE 与 修复进展](https://github.com/lucko/spark/issues/530)

[^why-6-16-7]: [*what i have worked out is that arch linux-6.16.7-arch1 is the last version its working on* | [Linux] Entire system freezes whilst attempting world generation with Forge 47.4.0 · Issue #530 · lucko/spark | GitHub](https://github.com/lucko/spark/issues/530#issuecomment-3368314370)