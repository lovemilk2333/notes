---
title: Wayland + KDE 桌面环境下使用命令行唤醒屏幕
published: 2025-09-10
tags: [Linux, UI, GUI, DE, KDE]
category: app::linux::KDE
---

## 描述

sunshine 串流软件在显示器关闭情况下无法连接, 会发生 `503` 错误

## 解决

如下指令可以使显示器在熄屏(睡眠和休眠未经测试)状态下亮屏

```sh
kscreen-doctor --dpms on
```

对于使用 [SDDM](https://github.com/sddm/sddm) 的用户, 可能需要手动将 `$WAYLAND_DISPLAY` 设为 `wayland-1`, 因为 SDDM 与 KDE Plasma 不在同一个 *WAYLAND_DISPLAY* 中

对于使用 [Plasma Login Manager](https://invent.kde.org/plasma/plasma-login-manager/) 的用户则无须配置, 因为两者运行于同一 *WAYLAND_DISPLAY*

## See Also

[自定义显示器分辨率和/或刷新率](../../Display/custom-edid)
