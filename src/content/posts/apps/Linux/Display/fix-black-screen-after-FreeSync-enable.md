---
title: 修复显示器在 OSD 菜单中启用 FreeSync 后黑屏
published: 2025-09-10
tags: [Linux, display, OSD]
category: app::linux::display
---

::: warning 警告
这可能并不适用于所以显示器, 请优先寻找售后服务支持, 或自行酌情决定是否使用
:::

## 使用 `ddcutil` 重置显示器
1. 安装
```sh
sudo pacman -S ddcutil
```

2. 查看连接的显示器
```sh
ddcutil detect

# example output
Display 1
   I2C bus:  /dev/i2c-1
   DRM connector:           card0-HDMI-A-1
   EDID synopsis:
      Mfg id:               FKS - UNK
      Model:                FKS-C215J
      Product code:         4132  (0x1024)
      Serial number:        000000000000
      Binary serial number: 0 (0x00000000)
      Manufacture year:     2022,  Week: 1
   VCP version:         2.2

Display 2
   I2C bus:  /dev/i2c-4
   DRM connector:           card0-DP-3
   EDID synopsis:
      Mfg id:               RTK - UNK
      Model:                Type_C
      Product code:         447  (0x01bf)
      Serial number:        
      Binary serial number: 1666187265 (0x63500001)
      Manufacture year:     2020,  Week: 1
   VCP version:         2.2
```

3. 重置对应显示器
::: warning 警告
这可能会导致显示器 OSD 界面重置或消失 进入出厂较色模式, 解决方案参见 步骤4
:::

```sh
ddcutil --display <number> setvcp 0x04 0x01
```
其中, `<number>` 为显示器序号

4. 移除显示器电源连接后重新连接电源方可. 若显示器进入出厂较色模式 (不同颜色屏幕来回切换), 长按电源键并重启显示器即可
