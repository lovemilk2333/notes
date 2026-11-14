---
title: Selkies WebUI 操控方案 (NEW) | 部署适用于 ArchLinux KDE (Wayland) 桌面环境的 Selkies
published: 2026-11-14
tags: [Linux, UI, GUI, DE, KDE, Selkies, VNC, ReversedProxy, Wayland]
category: deployment::Selkies
---

[Selkies](https://selkies.io/) 是一个开源的低延迟高性能 Linux 原生 GPU/CPU 加速可用的支持 WebRTC/WebSocket HTML5 远程桌面流媒体平台, 适用于自托管 容器 Kubernetes 或 云/HPC 平台, 其原型由 Google 工程师开发[^what-is-Selkies]

Selkies 设计上就是为了高性能游戏或远程桌面串流设计的, 可以直接调用 GPU 硬件编解码, 相较于 noVNC 等传统 VNC 解决方案, 配置更简单.

同时, Selkies 支持免配置音频传输, 仅需保证后端兼容 `PulseAudio` (例如 PulseAudio 与 PipeWire-Pulse)

高版本的 Selkies 已经支持 Wayland 并拥有出色的弱网串流能力 (支持 WebSocket)

## 安装并配置基于 Wayland 的 KDE 桌面环境

> <https://wiki.archlinux.org/title/KDE>

使用如下指令安装基于 Wayland 的 KDE 桌面环境及其相关组件

```sh
sudo pacman -S plasma-meta konsole dolphin pipewire pipewire-pulse xorg-server xorg-xinit xf86-video-dummy polkit-kde-agent
```

### 启动 KDE 所需的 Pipewire 服务系列

```sh
systemctl --user enable --now pipewire.service pipewire-pulse.service wireplumber.service
```

## 安装 Selkies
> <https://docs.selkies.io/latest/native/>

获取当前最新的 Selkies 版本, 并配置环境变量

```sh
export SELKIES_VERSION="$(curl -fsSL "https://api.github.com/repos/selkies-project/selkies/releases/latest" | jq -r '.tag_name')"
```

对于 ArchLinux, 使用如下命令安装

```sh
# Arch Linux, which Arch publishes for x86_64 alone
PKG="selkies-${SELKIES_VERSION}-$(uname -m).pkg.tar.zst"
curl -O -fsSL "https://github.com/selkies-project/selkies/releases/download/${SELKIES_VERSION}/${PKG}"
sudo pacman -U "./${PKG}"
```

使用如下命令验证安装是否成功

```sh
selkies --version
```

### 配置 Selkies 的 Systemd Unit

在如下路径新建 Env 文件

```path
~/.selkies.env
```

修改必要配置, 诸如端口号, 用户, 密码与[编码器配置](https://docs.selkies.io/latest/settings/#stream)

```ini
# must use Wayland
SELKIES_WAYLAND=true
# listen on `::`
SELKIES_PUBLIC=true
# run KDE
SELKIES_SESSION=startplasma-wayland

# HTTPS
SELKIES_ENABLE_HTTPS=<bool>
SELKIES_HTTPS_CERT=<certpath>
SELKIES_HTTPS_KEY=<keypath>
# static cert is not needed
SELKIES_CERT_RELOAD_INTERVAL=0
# or your origins
SELKIES_ALLOWED_ORIGINS="*"

SELKIES_PORT=<port>
SELKIES_MODE=websockets
SELKIES_BASIC_AUTH_USER=<user>
SELKIES_BASIC_AUTH_PASSWORD=<password>
# change to the best encoder of your machine
SELKIES_ENCODER=h265enc
# SELKIES_USE_CPU=true
# SELKIES_ENABLE_RESIZE=false
SELKIES_MANUAL_WIDTH=1920
SELKIES_MANUAL_HEIGHT=1080
SELKIES_FRAMERATE=60
# disable STUN
SELKIES_STUN_HOST=

SELKIES_FILE_MANAGER_PATH=/path/to/filemgr
```

> [!NOTE]
> 对于无法使用 GPU 的虚拟机或者 GPU 性能较弱设备 (如我使用的 Intel UHD Graphics P630[^uhdp630]), 使用 CPU 编码可能出现跳帧问题, 可尝试降低分辨率或帧率

> [!NOTE]
> 要生成 HTTPS 证书可以使用如下 OpenSSL 命令
> ```sh
> openssl ecparam -name secp384r1 -genkey -noout -out server.key
> openssl pkey -in server.key -out private.key
> openssl req -new -x509 -days 1 -sha384 -key server.key -out server.crt
> ```
> 并
> ```ini
> SELKIES_HTTPS_CERT=server.crt
> SELKIES_HTTPS_KEY=server.key
> ```

在如下文件写入 Unit

```path
~/.config/systemd/user/selkies.service
```

```ini
[Unit]
Description=Selkies Service

[Service]
Type=simple
Environment=HOME=%h
Environment=PIPEWIRE_LATENCY=128/48000

ExecStart=/usr/bin/env bash -c 'set -a; source %h/.selkies.env; exec selkies session --session=${SELKIES_SESSION}'

Restart=always
RestartSec=5s

StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target
```

加载并启用服务

```sh
systemctl --user daemon-reload
systemctl --user enable --now selkies.service
```

## 故障排除

### 中文 XDG 文件夹导致 Selkies 默认下载文件路径不正确

若您在 XDG (X11) 初始化前启动了 KDE 或其他桌面环境, 会导致在 `$HOME` 下生成 `下载/` `桌面/` (而非 `Downloads/` `Desktop/`) 等文件夹, 这与 Selkies 下载/文件管理文件夹 (`--file-manager-path` / `$SELKIES_FILE_MANAGER_PATH` / `$FILE_MANAGER_PATH`) 的默认值 `~/Desktop` 不符
> <https://docs.selkies.io/latest/settings/#clipboard-files-printing-and-apps>

我们有两种方法解决该问题

#### 1. 修改各个文件夹的默认位置
编辑
```path
~/.config/user-dirs.dirs
```
文件并修改为如下内容

```ini
XDG_DESKTOP_DIR="$HOME/Desktop"
XDG_DOWNLOAD_DIR="$HOME/Downloads"
XDG_TEMPLATES_DIR="$HOME/Templates"
XDG_PUBLICSHARE_DIR="$HOME/Public"
XDG_DOCUMENTS_DIR="$HOME/Documents"
XDG_MUSIC_DIR="$HOME/Music"
XDG_PICTURES_DIR="$HOME/Pictures"
XDG_VIDEOS_DIR="$HOME/Videos"
XDG_PROJECTS_DIR="$HOME/"
```

后运行如下命令更新配置
```sh
LC_ALL=C xdg-user-dirs-update --force
```

确认无误后, 删除旧文件夹 (注意复制或移动需要的文件)
```sh
rm -d ~/{下载,公共,图片,文档,桌面,模板,视频,音乐}
```

#### 2. 为各个文件夹创建软链接
运行如下命令创建链接

```sh
cd ~
ln -s 下载 Downloads
ln -s 公共 Public
ln -s 图片 Pictures
ln -s 文档 Documents
ln -s 桌面 Desktop
ln -s 模板 Templates
ln -s 视频 Videos
ln -s 音乐 Music
```

### DBus 进程在 SSH 结束后退出

请确保开启了后台进程常驻

```sh
sudo loginctl enable-linger $USER
```

```sh
pactl set-default-source "default-output.monitor" >/dev/null 2>&1
```

### Selkies 客户端网路环境无法访问 TURN/STUN Server 或者 443 端口, 导致无法建立连接

由于 Selkies 默认开启了 TURN/STUN Server, 无法访问的客户端会尝试连接并失败造成无法成功传输画面. 出现类似于如下日志

Status Log

```log
[14:56:31] [webrtc] [ERROR] attempt to send data channel message before channel was open
```

Debug Log

```log
[14:44:12] [app] using TURN servers: turn:staticauth.openrelay.metered.ca:443?transport=udp
```

若客户端与服务器之间可以建立直连 (如同处一个内网) 或使用 WebSocket 建立连接, 可以禁用 Selkies 的全部 TURN/STUN Server

在 Env 文件中写入如下内容

打开

```path
~/.selkies.env
```

写入

```ini
SELKIES_TURN_HOST=
```

> [!NOTE]
> 若仍然无法加载, 请检查网路环境 UDP 连通性, 或使用 WebSocket 建立连接

### KDE Plasma 渲染卡顿

可能是由于 Plasma 在调试过程中多次崩溃导致 fallback 到软件渲染器

编辑
```path
~/.config/kwinrc
```
的
```ini
[Compositing]
Backend=OpenGL
```

或设置 [`KWIN_COMPOSE` 环境变量](https://community.kde.org/KWin/Environment_Variables#KWIN_COMPOSE)

### KDE 部分界面文本不是中文

若 `/etc/locale.gen` 中的 `zh_CN.UTF-8` 处于注释状态, 系统实际上并未生成该 Locale, 依赖 glibc Locale 的程序会回退到英文

取消注释并生成

```sh
sudo sed -i 's/^#zh_CN.UTF-8 UTF-8/zh_CN.UTF-8 UTF-8/' /etc/locale.gen
sudo locale-gen
```

### 重启后 KDE 壁纸被重置

若同时存在 SDDM 自动登录会话与本方案的 headless 会话, 两个 Plasma 实例会同时读写同一份桌面配置, 导致壁纸等设置被反复覆盖; 配置文件中残留的空 Containment 也会导致启动时绑定到错误的桌面

禁用 SDDM

```sh
sudo systemctl disable --now sddm
```

并检查 `~/.config/plasma-org.kde.plasma.desktop-appletsrc` 中是否残留了无内容的 `[Containments][n]` 段

[^what-is-Selkies]: https://docs.selkies.io/latest/design/#what-is-selkies-gstreamer

[^uhdp630]: https://www.intel.com/content/www/us/en/products/sku/134854/intel-xeon-e2124g-processor-8m-cache-up-to-4-50-ghz/specifications.html#specs-1-0-4
