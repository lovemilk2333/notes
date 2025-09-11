---
title: 自定义显示器 `EDID` 以自定义 分辨率和/或刷新率
published: 2025-09-10
tags: [Linux, display, virtual-display]
category: app::linux::display
---

## 描述
使用显卡欺骗器 (FakeDisplay) 时无法使用自定义的分辨率刷新率, 使得串流时无法适配客户端分辨率刷新率

## 解决
:::caution
本教程仅提供一个可能的解决方案, 内容可能并不适用于所有的设备, 后果须由用户自行承担

经过实测, NVIDIA 驱动加载非标准分辨率比率的显示器会使得显示器无法连接;  
加载标准分辨率比率但刷新率过高的显示器时会导致显卡掉驱动:
```log
[141.637776] nvidia-modeset: ERROR: GPU:0: Idling display engine timed out: 0x0000c67e:6:0:1176
```
:::

如下项目提供了使用 `cvt` 指令生成 `Modeline` 格式的显示器分辨率刷新率 转为 `EDID` 二进制文件的脚本 <https://github.com/akatrevorjay/edid-generator>

1. 下载脚本或 `clone` 仓库  
    对于 `Archlinux` 用户, 可以使用 AUR 的 `edid-generator` 包
    :::warning
    `edid-generator` 包存在小问题, 使用 stdin 的文件输入会导致没有办法退出 (`Ctrl+C` 退出后无法自动运行 `make`), 可以手动 `cd /tmp/edid-generator-<4个任意字母>` 文件夹下手动运行 `make`
    :::

2. 运行
    ```sh
    $ cvt -v <分辨率_长> <分辨率_宽> <刷新率>
    ```
    例如: 
    ```sh
    $ cvt -v 2400 1080 120

    Warning: Aspect Ratio is not CVT standard.
    Warning: Refresh Rate 120.00 is not CVT standard (50, 60, 75 or 85Hz).
    # 2400x1080 119.93 Hz (CVT) hsync: 139.12 kHz; pclk: 460.75 MHz
    Modeline "2400x1080_120.00"  460.75  2400 2592 2856 3312  1080 1083 1093 1160 -hsync +vsync
    ```
    生成 `2400x1080@120` 的 `Modeline` 格式信息, 将 `Modeline` 紧随的名称 (如 `"2400x1080_120.00"`) 改写至 12 字符以内, 非标准分辨率的在最后加上分辨率比率 `ratio=<比率x>:<比率y>` 并 复制改写后的整行

3. 运行 `./modeline2edid` (`Archlinux` 运行 `edid-generator`) 并粘贴复制内容, 例如
    ```sh
    $ edid-generator
    Searching for modelines in '/dev/stdin'

    # 输入
    Modeline "2400x1080"  460.75  2400 2592 2856 3312  1080 1083 1093 1160 -hsync +vsync ratio=20:9

    Wrote 2400x1080.S
    ```
    这样, 就会在 当前文件夹 (`Archlinux` 用户为 `/tmp/edid-generator-<4个任意字母>` 文件夹) 下生成以 `Wrote ` 后内容为文件名的文件了

4. 切换至生成文件所在目录
    `Archlinux` 用户请运行
    ```sh
    $ cd /tmp/edid-generator-*
    ```
    > 如果有两个或多个类似目录, 请 `cd` 至修改/创建时间与当前时间最为接近的目录
5. 运行
    ```sh
    $ make
    ```
    :::tip
    该脚本 **支持的标准分辨率比率** 包括: 4:3, 16:10, 5:4, 16:9  
    如果使用非标准分辨率比率, 可能会遇到 ```Error: invalid operands (*UND* and *ABS* sections) for `<<'``` 问题  
    (参见 [issue#19](https://github.com/akatrevorjay/edid-generator/issues/19))  
    
    可能的临时解决方案是在工作路径下的 `edid.S` 的 `/* EDID 1.3 standard definitions */` 下方添加
    ```c
    #define XY_RATIO_<比率x>_<比率y> 0b<任意不重复的数值>
    ```
    例如 `2400x1080` (20:9) 的屏幕则写为
    ```c
    #define XY_RATIO_20_9 0b100
    ```
    后运行 `make`
    
    :::warning
    `0b<任意不重复的数值>` 为显示器比率识别码, 进行自定义可能造成部分老旧的 `EDID` 解析器无法识别
    :::

6. 将 `make` 生成出来的 `.bin` 文件 (例如 `2400x1080.bin`) 复制或移动至 `/usr/lib/firmware/edid/` (`edid` 文件夹不存在时请自行创建)
    > 该操作可能需要 root 权限
    ```sh
    $ cp 2400x1080.bin /usr/lib/firmware/edid/
    ```
    并在内核参数加上
    ```conf
    drm.edid_firmware=<显示器标识>:edid/<`.bin`文件路径>
    ```
    例如
    ```conf
    drm.edid_firmware=DP-2:edid/2400x1080.bin
    ```
    > GRUB 用户可以修改 `/etc/default/grub` 的 `GRUB_CMDLINE_LINUX_DEFAULT` 并更新引导  

    > If you want to set multiple edid files, use:  
    > 如果需要定义多个显示器的 `EDID`, 请使用:
    >  ```
    > drm.edid_firmware=VGA-1:edid/your_edid.bin,VGA-2:edid/your_other_edid.bin
    > ```

    :::tip
    显示器标识请使用如下命令获取
    ```sh
    $ for p in /sys/class/drm/*/status; do con=${p%/status}; echo -n "${con#*/card?-}: "; cat $p; done
    ```
    :::

7. 修改 `/etc/mkinitcpio.conf` 并生成配置
    修改 `/etc/mkinitcpio.conf` 中的 `FILES` 字段, 添加新的 `EDID` 文件路径
    ```conf
    FILES=(/usr/lib/firmware/edid/<`.bin`文件路径>)
    ```
    例如:
    ```conf
    FILES=(/usr/lib/firmware/edid/2400x1080.bin)
    ```

    后重新生成配置
    ```sh
    $ sudo mkinitcpio -P
    ```

8. 重启系统
    :::warning
    如果重启系统后显示器未连接, 可能是您使用了非标准分辨率比率显示器造成的

    如果在 `dmesg` 中出现 `[CONNECTOR:110:<显示器标识>] Requesting EDID firmware "edid/<`.bin`文件路径>" failed (err=-2)`, 可能是遗漏了 ```7. 修改 `/etc/mkinitcpio.conf` 并生成配置``` 造成的
    ```log
    [    3.977294] nvidia 0000:01:00.0: Direct firmware load for edid/2400x1080.bin failed with error -2
    [    3.977382] nvidia 0000:01:00.0: [drm] *ERROR* [CONNECTOR:110:DP-2] Requesting EDID firmware "edid/2400x1080.bin" failed (err=-2)
    [    3.977504] nvidia 0000:01:00.0: Direct firmware load for edid/2400x1080.bin failed with error -2
    [    3.977582] nvidia 0000:01:00.0: [drm] *ERROR* [CONNECTOR:110:DP-2] Requesting EDID firmware "edid/2400x1080.bin" failed (err=-2)
    [    4.070439] [drm] Initialized nvidia-drm 0.0.0 for 0000:01:00.0 on minor 0
    [    4.070525] Console: switching to colour dummy device 80x25
    [    4.070550] nvidia 0000:01:00.0: vgaarb: deactivate vga console
    [    4.154474] nvidia 0000:01:00.0: Direct firmware load for edid/2400x1080.bin failed with error -2
    [    4.154478] nvidia 0000:01:00.0: [drm] *ERROR* [CONNECTOR:110:DP-2] Requesting EDID firmware "edid/2400x1080.bin" failed (err=-2)
    [    4.154497] nvidia 0000:01:00.0: Direct firmware load for edid/2400x1080.bin failed with error -2
    [    4.154499] nvidia 0000:01:00.0: [drm] *ERROR* [CONNECTOR:110:DP-2] Requesting EDID firmware "edid/2400x1080.bin" failed (err=-2)
    ```
    :::

## 参考
1. akatrevorjay/edid-generator: Hackerswork to generate an EDID blob from given Xorg Modelines, complete with valid checksum.: <https://github.com/akatrevorjay/edid-generator?tab=readme-ov-file#edid-generator>

2. Kernel mode setting - Forcing modes and EDID - ArchWiki: <https://wiki.archlinux.org/title/Kernel_mode_setting#Forcing_modes_and_EDID>

3. How to override the EDID data of a monitor under Linux | foosel.net: <https://foosel.net/til/how-to-override-the-edid-data-of-a-monitor-under-linux/>

4. Error: invalid operands (\*UND* and \*ABS* sections) for `<<' · Issue #19 · akatrevorjay/edid-generator: <https://github.com/akatrevorjay/edid-generator/issues/19>

5. archlinux交流群 (1039561926@QQ) 群友 `Norman`
