---
title: 安装与初始化 CachyOS
published: 2026-03-03
tags: [Linux, CachyOS, installation]
category: app::linux::CachyOS
description: 本文主要介绍 CachyOS 的安装方法, 配置 Niri 桌面环境, 并初始化个人配置与常用工具
---

:::CAUTION
本教程 (仅) 适用于 **拥有一定 Linux 知识储备的用户**, 若您无法理解并正确填写类似 Ubuntu 的交互式 Linux 安装器的选项, 请先前往 [archlinux 简明指南
](https://arch.icekylin.online) 学习安装 Linux 的基础知识
:::

## 安装
下载 CachyOS [官方 ISO](https://cachyos.org/download), 使用交互式安装器安装

> [!NOTE]
> 由于在 CachyOS Live CD 环境内, 其安装器是从云端 (GitHub) 拉取的, 请确保网络可访问性与连接通畅
>
> 对于拥有多个显示器的与用户, 请注意安装器是否从 **非主要** *(或者你没有注意到的)* **显示器** 弹出, 从而无辜等待安装器下载, ~~浪费人生~~

使用安装器时, 若需要与 Windows 共存共存安装, 请在分区时选择 "手动分区":
  1. 创建不小于 512 MiB (GRUB) 或 2 GIB (其他引导方式) 的 Fat32 Boot 分区, 挂载于 `/boot/efi`, 勾选 `boot`
  2. 创建适当大小的 Btrfs 根目录, 挂载于 `/` (CachyOS 会自动处理 `/home` 等子卷)

选择 Niri 桌面环境 (后续会使用安装脚本覆盖配置) 或 不配置桌面环境

## 配置
### Virtual Console Service 报错
> <https://github.com/nakanomikuorg/arch-guide/issues/299>

```sh
sudo touch /etc/vconsole.conf
```

### 安装 Niri
使用 [【Arch零门槛】绝美Linux桌面，一键安装Niri+DMS - BIliBili](https://www.bilibili.com/video/BV1CHZaBrEF6) 提供的安装脚本安装 Niri

```sh
bash <(curl -L shorin.xyz/archsetup)
```
> [!NOTE]
> 由于 CachyOS 默认使用 Fishshell, 导致该语法无法被识别, 请在 Bash 内运行上述脚本

> [!IMPORTANT]
> CachyOS 默认的 Niri 与 一键脚本有冲突, 请使用 **Super/Meta/Command + T** (若打不开时请使用 **Alt + T**) 打开终端, 运行如下命令卸载冲突的 Noctalia (系列包)
> ```sh
> yay -R noctalia-qs noctalia-shell cachyos-niri-noctalia
> ```

选择 Niri + DMS 或 Niri + DMS - git 安装, 并在安装 DMS 时选择 Niri 与 Kitty (常用应用可选安装)
> 由于我安装非 git 版本 DMS 安装器打开失败, 推荐选择 git 版本安装

如果安装完成出现了两个任务栏, 请禁用 `dms.service`
```sh
sudo systemctl disable --now dms.service
```

### Niri DMS 配置快捷键
由于未知原因, DMS 设置对配置好的快捷键支持存在问题, 使用设置 GUI 编辑会导致配置文件保存失败, 故手动修改配置文件

按键绑定配置文件位于
```path
~/.config/niri/dms/binds.kdl
```

> [!TIP]
> BTW, 使用 GUI 绑定 Super 按键可能出现无法保存的问题, 请手动修改 Super 为 Mod
>
> 同时, 不支持仅使用一个 Mod 键等作为快捷键, 必须为组合按键

### Niri 配置与双击标题栏相同行为的窗口最大化
不知为何, DMS 配置的 `maximize-column` (最大化) 行为与双击标题栏的行为不同, 前者会保留主题色窗口高亮边框, 后者会占据整个屏幕除 (顶部) 任务栏区域且任务栏的 margin 会缩减为 0; `fullscreen-window` (全屏) 窗口会导致 Overlay 窗口 (包括但不限于 Mod+Z 程序菜单, Mod+X 电源/登录操作菜单) 无法弹出, 并且任务栏会被隐藏


经过一翻探寻, 发现双击标题栏的实际行为是 `maximize-window-to-edges`, 故可以配置如下命令作为最大化的执行命令, 达到 *真正最大化窗口*
> 不知道为什么 DMS 设置的 Window 操作竟然没有这个 Action, 只有上述的 `maximize-column` 与 `fullscreen-window`

> [!TIP]
> 如下命令会自动应用于前台窗口, 并且该命令会 toggle 该状态, 无须判断目标窗口是否已经处于该状态
```sh
niri msg action maximize-window-to-edges
```

### 关于 DMS 窗口规则 (Window Rules)
DMS 窗口规则什么都不填写代表匹配所有窗口, 可以用于设置全局配置, 诸如窗口圆角大小等

匹配规则的 App ID 与 Title regex 貌似不能包含空格或特殊字符, 否则可能导致 Niri 配置加载失败

### Niri 配置显示器焦点跟随光标
目前, Niri 没有很好的方法配置应用程序启动菜单等于光标所在的显示器弹出, 只能配置实时根据光标所在窗口范围切换窗口焦点, 从而另类实现前者目的

> [!WARNING]
> 这会导致被光标划过的窗口会被意外激活, 个人不建议配置

在 Niri 配置文件配置如下内容
```path
~/.config/niri/config.kdl
```
配置
```conf
input {
    focus-follows-mouse
}
```

### Rime [雾凇拼音](https://github.com/iDvel/rime-ice) 设置默认为半角符号
::github{repo="iDvel/rime-ice"}

对于 fcitx5 用户, 在如下目录
```path
~/.local/share/fcitx5/rime
```

创建如下文件
```path
rime_ice.custom.yaml
```

`rime_ice.schema.yaml` 是雾凇拼音默认配置, 如下为节选
```yml
switches:
  - name: ascii_mode
    states: ["中", "Ａ"]
  - name: ascii_punct
    reset: 1
    states: ["¥", "$"]
  - name: traditionalization
    states: ["简", "繁"]
  - name: emoji
    reset: 1
    states: ["💀", "😄"]
  - name: full_shape
    reset: 0
    states: ["半角", "全角"]
  - abbrev: ["词", "单"]
    name: search_single_char
    states: ["正常", "单字"]
```

由于全角/半角符号切换配置项在 schema 文件中的 `switches` 部分的索引为 `1`, 在上述文件内写入如下内容 (如果上游有修改请自行修改, 参考 [用補靪指令修改列表 - Rime Wiki](https://github.com/rime/home/wiki/Configuration#用補靪指令修改列表))

```yml
patch:
  # @1 代表选择索引为 1 者, 并将其默认值 (`reset`) 设置为 1
  "switches/@1/reset": 1  # 半角符号
  "switches/@4/reset": 0  # 半角 CJK
```

### Dolphin 文件管理器无法识别打开方式 / 默认打开方式重置
1. 安装依赖包
```sh
sudo pacman -S archlinux-xdg-menu
```

2. 链接通用的打开方式配置
```sh
sudo ln -sf /etc/xdg/menus/plasma-applications.menu /etc/xdg/menus/applications.menu
```

3. 刷新 (默认) 打开方式缓存
```sh
XDG_MENU_PREFIX=plasma- kbuildsycoca6 --noincremental
```

4. 重启 Dolphin 即可

### Dolphin 在右键单击文本类文件时界面卡死若干秒
检查 Dolphin 的 "设置 > 右键菜单" 中 "通过 KDE Connect发送文件" 选项, 若已勾选则取消勾选, 确定或应用尝试是否解决

### 修改 KDE 系软件主题
由于 Niri 的 DMS 设置的深色模式无法应用于 KDE 系列软件, 造成应用主题割裂, 此次需要修改 KDE 系软件默认主题

修改 KDE 系列软件主题的关节点在于命令行工具 `plasma-apply-colorscheme`, 该工具仅在包 `plasma-desktop` 等中提供

1. 安装 `plasma-desktop` 或下载我从该包中提取的 `plasma-apply-colorscheme` ELF
安装  
```sh
sudo pacman -S plasma-desktop
```

或下载 ELF:
[当前网站 (实验)](/static/plasma-apply-colorscheme) / [GitHub](https://aka.lovemilk.top/github/notes/releases/tag/plasma-apply-colorscheme)
> [!WARNING]
> 该 ELF 属于 Plasma 6.6.2, 如果出现 Breaking Change 造成该 ELF 无法使用, 请使用上述安装 Plasma 软件包的解决方法
并将该 ELF 放入
```path
/usr/local/bin
```

赋予可执行权限
```sh
sudo chmod +x /usr/local/bin/plasma-apply-colorscheme
```

1. 设置颜色主题  
查看已有的主题列表
```sh
plasma-apply-colorscheme --list-schemes
```

设定主题
```sh
plasma-apply-colorscheme <name>
```
> 要设定默认的深色主题, 请使用
> ```sh
> plasma-apply-colorscheme BreezeDark
> ```

为了保证文件选择器等 **配套软件主题统一性**, 请在全局环境变量配置文件中写入如下配置
> 同时写入是为了 Niri 和在 Niri 启动前的 Services 全部都可以作用到
```path
/etc/environment

~/.config/niri/config.kdl
```
的 `environment` 部分修改或写入
```ini
QT_QPA_PLATFORMTHEME=qt5ct
QT_QPA_PLATFORMTHEME_QT6=qt5ct
```

并使用 Qt5设置 修改主题配置

> 若仍旧无效的, 请将 `qt5ct` 修改为 `kde`

### 修改 Kitty 默认 Shell, 字体以及是否连字
将如下文件
```path
~/.config/kitty/kitty.conf
```

的 `shell fish` (或 `shell <any-shell>`) 改为你想用的 Shell, 可以只写名称, 例如:
```properties
# 修改默认 Shell
shell zsh

# 字体及大小
font_family JetBrainsMono Nerd Font NL
font_size 12
# 禁用连字
disable_ligatures always

# 禁用 单击 打开链接, 新增 Ctrl+单击 打开链接
mouse_map left click ungrabbed no_op
mouse_map ctrl+left release grabbed,ungrabbed mouse_handle_click link
```

> [!IMPORTANT]
> 由于快捷键 `Mod+slash` 默认打开的是使用 `--single-instance` 的 Kitty, 需要重启 Kitty Daemon 才能使配置生效
> ```sh
> killall kitty
> ```

### 修改默认应用 (默认打开方式)
编辑如下配置文件
```path
~/.config/mimeapps.list
```

该配置文件格式为 `<MIME-Type>=<app>.desktop;<second-app>.desktop;...`

例如, 要修改默认文件管理器为 Dolphin
```ini
inode/directory=org.kde.dolphin.desktop
```

也可使用如下命令
```sh
xdg-mime default <app>.desktop <MIME-Type> <MIME-Type> <...> 
```

例如, 要修改压缩包的默认打开方式为 KDE 的 Ark
```sh
xdg-mime default org.kde.ark.desktop application/zip application/x-tar application/x-7z-compressed application/vnd.rar application/x-rar
```

> [!TIP]
> 修改实时生效

> 要验证某 MIME-Type 的默认打开方式, 请使用
> ```sh
> xdg-mime query default <MIME-Type>
> ```
> 例如:
> ```sh
> xdg-mime query default inode/directory
> ```

### Discord / Chromium 无法打开分享屏幕窗口选择器 (部分情况下屏幕可以正常选择)
为配置 Gnome 的 XDG Portal 请在如下配置文件
```path
~/.config/xdg-desktop-portal/portals.conf
```
写入
```ini
[preferred]
org.freedesktop.impl.portal.ScreenCast=gnome;wlr;
org.freedesktop.impl.portal.Screenshot=gnome;wlr;
```
并重启服务
> 该配置在部分情况下可能导致: Gnome PipeWire 选择界面可以弹出, 并成功选择; 但当 Chromium 尝试请求并弹出选择窗口后, 不进行任何窗口操作直接单击 "取消", 再次尝试打开选择窗口无窗口弹出 (OBS 等非 Chromium 仍可在此状况下弹出选择窗口)  
> 可能是因为 Electron 均使用 `org.chromium.Chromium` 作为 PipeWire 请求者, 导致 XDG Portal 内部状态比被多个 APP 覆写造成无效; 同时, 诸如 Discord 等软件的 WebRTC 实现貌似并不会在分享屏幕结束时通知 XDG Portal, 导致 PipeWire 回话永远无法结束
>
> 使用如下命令可以查看正在使用的 Freedesktop 回话
> ```sh
> busctl --user tree org.freedesktop.portal.Desktop
> ```

我们推荐更换为 KDE 的 XDG Portal `xdg-desktop-portal-kde`
> 由于部分场景下 (包括但不限于 PipeWire 屏幕/窗口选择界面) 仍需要 Gnome 的 XDG Portal, 切勿卸载
```sh
sudo pacman -S xdg-desktop-portal-kde
```

并在上述的配置文件内设置默认的 XDG Portal 实现为 `kde` 
> [!WARNING]
> KDE 窗口选择器无法正常工作, 切勿删除上述两行用于设置使用 Gnome 选择器的配置

```ini
default=kde
```

重启服务以应用配置
> 已打开的应用需要重启应用生效
```sh
systemctl --user restart xdg-desktop-portal
```

若仍然无法打开选择界面, 尝试结束 Gnome 的 XDG Portal 进程
```sh
killall -9 xdg-desktop-portal-gnome
```

> [!NOTE]
> 若出现文件选择器等颜色主题与配置的主题不符, 请参考 [修改 KDE 系软件主题](#修改-kde-系软件主题)

**替换 XDG Portal 后端会导致一些配置需要更改, 请遵循如下步骤**
1. 配置 Niri Dbus 后端
在
```path
~/.config/niri/config.kdl
```
找到 `spawn-at-starup` 字样的配置项, 并将启动 DBus 的条目的
```
/usr/lib/xdg-desktop-portal-gnome
```
改为
```
/usr/lib/xdg-desktop-portal-kde
```

1. 配置 Dolphin 守护进程
在上述配置文件内新增如下内容, 为避免 Nautilus 被 DBus 自动调起
```conf
spawn-at-startup "dolphin" "--daemon"
```

### Niri 禁用截屏声音
在 Niri 配置文件中注释如下内容
```path
~/.config/niri/config.kdl
```

注释
```conf
spawn-at-startup "~/.config/niri/shorin-niri/scripts/screenshot-sound.sh"
```

### 修复 Niri DMS 设置内光标配置选项无效
在 Niri 配置文件中注释如下内容
```path
~/.config/niri/config.kdl
```

注释
```conf
cursor {
    xcursor-theme "xxx"
    xcursor-size 30
    // hide-after-inactive-ms 15000
}
```

### Niri 安装光标
创建如下文件夹
```path
~/.icons
```

并将下载的光标主题解压放入, 符合如下文件结构
```path
~/.icons/<name>/cursors/
~/.icons/<name>/index.themes
```

### Kopia 自启动失败
使用 AUR 包的 `kopia-ui-bin` 的开机自启动功能貌似存在问题导致无法成功自启 (可能是是 Niri 导致的), 我们需要自己创建 User Level 的 Systemd Unit 以自启动 Kopia

在如下路径
```path
~/.config/systemd/user/kopia-ui.service
```

写入如下内容
```ini
[Unit]
Description=KopiaUI - Backup Tool
After=network.target

[Service]
ExecStart=/opt/KopiaUI/kopia-ui
Restart=on-failure

[Install]
WantedBy=default.target
```

并设置开机自启动
```sh
systemctl --user daemon-reload
systemctl --user enable --now kopia-ui.service
```
> [!TIP]
> 当其他软件遇到类似问题时, 可以采用相同的解决方法

### Proton (GE) 设置默认 Prefix
```sh
export STEAM_COMPAT_DATA_PATH=/path/to/pfx
```

### 编译软件包时 CMake 错误
若在编译软件包是出现 CMake 版本不兼容问题, 需要强制指定 `-DCMAKE_POLICY_VERSION_MINIMUM=x.x` (类似如下输出信息)
```txt
CMake Error at CMakeLists.txt:3 (cmake_minimum_required):

  Compatibility with CMake < 3.5 has been removed from CMake.



  Update the VERSION argument <min> value.  Or, use the <min>...<max> syntax

  to tell CMake that the project requires at least <min> but has been updated

  to work with policies introduced by <max> or earlier.



  Or, add -DCMAKE_POLICY_VERSION_MINIMUM=x.x to try configuring anyway.
```

可以使用 yay 的 `--editmenu` 选项, 并在提示如下内容是输入要修改范围, 例如 `1`

```txt
$ yay -S xxx --editmenu

...

==> 要编辑哪些 PKGBUILD？
==> [N]没有 [A]全部 [Ab]中止 [I]已安装 [No]未安装 或 (1 2 3, 1-3, ^4)
==> 1
```

然后修改 `build()` 中包含 `cmake` 的行, 添加上述提示中所需的 `-DCMAKE_POLICY_VERSION_MINIMUM=x.x` 参数 (`x.x` 需为实际版本), 保存后继续安装软件包即可

### GTK 配置样式
打开 GTK Settings 应用程序

### Microsoft Edge 在 Linux 上自动重置为亮色模式
由于未知原因, Microsoft Edge 的 Linux 版本会在浏览器进程完全退出后将外观设置的 "颜色主题" 为深色模式时配置为亮色模式, 而设置为 GTK 则不会.

> <https://www.reddit.com/r/MicrosoftEdge/comments/1rdlgpc/why_tf_does_edge_has_a_default_light_mode_even_i>
一个可能的临时解决方法, 将 Edge 降级为 Major 143 (`143.x.x.x`) 版本
> ~~F**K U Microsoft~~

可以使用 `downgrade` 命令
```sh
sudo downgrade microsoft-edge-stable-bin
```

### 使用 Prismlauncher 安装 Minecraft 整合包时出现文件损坏
> https://www.reddit.com/r/PrismLauncher/comments/1ifpbgp/issue_with_modpacks/

当启动 Minecraft 整合包时, 出现了如下日志
```
Processor failed, invalid outputs:
/home/<user>/.local/share/PrismLauncher/libraries/net/minecraft/client/1.20.1-20230612.114412/client-1.20.1-20230612.114412-slim.jar
Expected: de86b035d2da0f78940796bb95c39a932ed84834
Actual: aea60124ca903ecbb2e825805e318f9d89ac867c
/home/<user>/.local/share/PrismLauncher/libraries/net/minecraft/client/1.20.1-20230612.114412/client-1.20.1-20230612.114412-extra.jar
Expected: 8c5a95cbce940cfdb304376ae9fea47968d02587
Actual: 76e87dbc119daed8dc1861c17160e0c4b6f34d2e
Process exited with code 0.
```

尝试替换 CachyOS 的 zlib 实现为如下库, 运行如下命令安装
```sh
sudo pacman -S zlib lib32-zlib
```

### 修复 Nvidia 打开诸如 Minecraft 遇到无法使用 Zink 或者 Forge 显示无法初始化显卡问题
修改全局环境变量
```path
/etc/environment
```
添加
```ini
__GLX_VENDOR_LIBRARY_NAME=nvidia
__NV_PRIME_RENDER_OFFLOAD=1
```

> [!TIP]
> CachyOS 使用 `chwd` 工具管理 GPU 驱动, 在更新或更换驱动时注意避免与该工具行为产生冲突

### 修改 CachyOS 镜像源
> <https://discuss.cachyos.org/t/help-how-to-skip-mirror-update-during-installation-network-issues-in-china/20455>

依次修改如下文件
```path
/etc/pacman.d/mirrorlist
/etc/pacman.d/cachyos-mirrorlist
/etc/pacman.d/cachyos-v3-mirrorlist
/etc/pacman.d/cachyos-v4-mirrorlist
```

如果要使用 USTC Mirror 并刷新现有包数据库缓存, 可以使用如下命令
```sh
sudo tee /etc/pacman.d/mirrorlist << EOF
Server = https://mirrors.ustc.edu.cn/archlinux/\$repo/os/\$arch
EOF

sudo tee /etc/pacman.d/cachyos-mirrorlist << EOF
Server = https://mirrors.ustc.edu.cn/cachyos/repo/\$arch/\$repo
EOF

sudo tee /etc/pacman.d/cachyos-v3-mirrorlist << EOF
Server = https://mirrors.ustc.edu.cn/cachyos/repo/\$arch_v3/\$repo
EOF

sudo tee /etc/pacman.d/cachyos-v4-mirrorlist << EOF
Server = https://mirrors.ustc.edu.cn/cachyos/repo/\$arch_v4/\$repo
EOF

sudo pacman -Syy
```
