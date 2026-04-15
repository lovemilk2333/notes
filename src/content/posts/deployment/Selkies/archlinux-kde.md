---
title: Selkies WebUI 操控方案 | 部署适用于 ArchLinux KDE 桌面环境的 Selkies 与 KasmVNC
published: 2026-03-17
tags: [Linux, UI, GUI, DE, KDE, Selkies, VNC, ReversedProxy, KasmVNC]
category: deployment::Selkies
---

Selkies, 全称 Selkies-GStreamer, 是一个开源的低延迟高性能 Linux 原生 GPU/CPU 加速 WebRTC HTML5 远程桌面流媒体平台, 适用于自托管 容器 Kubernetes 或 云/HPC 平台, 其原型由 Google 工程师开发[^what-is-Selkies]

Selkies 设计上就是为了高性能游戏或远程桌面串流设计的, 可以直接调用 GPU 硬件编解码, 相较于 noVNC 等传统 VNC 解决方案, 配置更简单.

同时, Selkies 支持免配置音频传输, 仅需保证后端兼容 `PulseAudio` (例如 PulseAudio 与 PipeWire-Pulse)

> [!NOTE]
> Selkies 暂未支持 Wayland

## 安装并配置基于 X11 的 KDE 桌面环境

> <https://wiki.archlinux.org/title/KDE>\
> <https://archlinux.org/news/plasma-640-will-need-manual-intervention-if-you-are-on-x11/>

使用如下指令安装基于 X11 的 KDE 桌面环境及其相关组件

```sh
sudo pacman -S plasma-meta plasma-x11-session konsole dolphin pipewire pipewire-pulse xorg-server xorg-xinit xf86-video-dummy polkit-kde-agent
```

### 配置 KDE 的 X11 启动脚本

在如下路径写入如下内容

```path
~/.xinitrc
```

```sh
#!/usr/bin/sh

unset DBUS_SESSION_BUS_ADDRESS
unset DBUS_SESSION_BUS_PID

export DESKTOP_SESSION=plasma
export XDG_CURRENT_DESKTOP=KDE
export XDG_SESSION_TYPE=x11

if [ -x /usr/bin/dbus-run-session ]; then
  exec dbus-run-session -- startplasma-x11
else
  exec dbus-launch --exit-with-session startplasma-x11
fi
```

> 若需调整系统音量, 请参阅 [故障排除 > KDE 显示无音频设备导致无法调节系统音量](#kde-显示无音频设备导致无法调节系统音量)

并配置可执行权限

```sh
chmod +x ~/.xinitrc
```

### 配置 X11 虚拟显示器

在 X11 配置目录写入如下配置文件

```path
/etc/X11/xorg.conf.d/20-dummy.conf
```

```x11
Section "Device"
    Identifier  "DummyDevice"
    Driver      "dummy"
    VideoRam    512000
EndSection

Section "Monitor"
    Identifier  "DummyMonitor"
    Modeline    "1920x1080_60.00"  173.00  1920 2048 2248 2576  1080 1083 1088 1120 -hsync +vsync
    HorizSync   28.0-110.0
    VertRefresh 43.0-90.0
EndSection

Section "Screen"
    Identifier  "DummyScreen"
    Device      "DummyDevice"
    Monitor     "DummyMonitor"
    DefaultDepth 24
    SubSection "Display"
        Depth 24
        Modes "1920x1080_60.00"
    EndSubSection
EndSection
```

### 配置 X11 启动服务

为了保证 X11 Server 可以随系统自启动, 我们需要使用自定义 Systemd Unit

```path
~/.config/systemd/user/headless-x11-kde.service
```

```ini
[Unit]
Description=Headless KDE Plasma X11 Session on :0
After=network.target

[Service]
Environment=DISPLAY=:0
Environment=XDG_SESSION_TYPE=x11
Environment=XAUTHORITY=%h/.Xauthority

ExecStart=/usr/bin/startx %h/.xinitrc -- :0 -config 20-dummy.conf

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
systemctl --user enable --now headless-x11-kde.service
```

### 启动 KDE 所需的 Pipewire 服务系列

```sh
systemctl --user enable --now pipewire.service pipewire-pulse.service wireplumber.service
```

## 安装 Selkies

参考 [Selkies 官方文档 的 Getting Started > Quick Start](https://selkies-project.github.io/selkies/start/) 页面下载并安装 Selkies

默认安装路径位于 `<workpath>/selkies-gstreamer`

### 配置 Selkies 的 Systemd Unit

在如下路径新建 Env 文件

```path
~/selkies-gstreamer/selkies.env
```

修改必要配置, 诸如端口号, 用户, 密码与[编码器配置](https://selkies-project.github.io/selkies/component/#encoders)

```ini
SELKIES_ADDR=0.0.0.0
SELKIES_PORT=<port>
SELKIES_USER=<user>
SELKIES_PASS=<password>
SELKIES_ENCODER=av1enc
SELKIES_RESIZE=false
```

> [!NOTE]
> 对于无法使用 GPU 的虚拟机或者 GPU 性能较弱设备 (如我使用的 Intel UHD Graphics P630[^uhdp630]), 使用 `x264enc` 等编码方式可能出现跳帧问题, 推荐使用 `svtav1enc` 或 `av1enc` 编码方式

在如下文件写入 Unit

```path
~/.config/systemd/user/selkies.service
```

```ini
[Unit]
Description=Selkies GStreamer Service
# 必须和上面定义的 KDE Unit 名称对应, `Wants` 同理
After=headless-x11-kde.service
Wants=headless-x11-kde.service

[Service]
Type=simple
# 设置默认环境变量, 参考官方文档
Environment=DISPLAY=:0
Environment=PIPEWIRE_LATENCY=128/48000
Environment=XDG_RUNTIME_DIR=%t
Environment=PIPEWIRE_RUNTIME_DIR=%t
Environment=PULSE_RUNTIME_PATH=%t/pulse
Environment=PULSE_SERVER=unix:%t/pulse/native

EnvironmentFile=%h/selkies-gstreamer/selkies.env

ExecStart=%h/selkies-gstreamer/selkies-gstreamer-run \
    --addr=${SELKIES_ADDR} \
    --port=${SELKIES_PORT} \
    --enable_https=false \
    --basic_auth_user=${SELKIES_USER} \
    --basic_auth_password=${SELKIES_PASS} \
    --encoder=${SELKIES_ENCODER} \
    --enable_resize=${SELKIES_RESIZE}

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

### Selkies 画面有显示但仍在画面中间显示 `Waiting for stream.`

发生该情况可能存在多种原因:

1. 由于 Selkies 只接收到了视频画面, 无法获取到音频. 尝试检查 Pipewire 和 PulseAudio 等服务的状态.
2. 客户端不支持该编解码格式, 导致解码时出现错误 (多数情况是客户端不支持 Opus 音频格式)

### DBus 进程在 SSH 结束后退出

请确保开启了后台进程常驻

```sh
sudo loginctl enable-linger $USER
```

### KDE 显示无音频设备导致无法调节系统音量

我们可以使用 `pactl` 加载虚拟音频模块, 并将其设为系统默认输出

为了自动化地设置虚拟音频输出, 请在 `~/.xinitrc` 的 `exec` 前添加如下内容

```sh
VIRTUAL_SINK_NAME="default"

if ! pactl list sinks short | awk '{print $2}' | grep -Fxq "$VIRTUAL_SINK_NAME"; then
  pactl load-module module-null-sink sink_name="$VIRTUAL_SINK_NAME" sink_properties=device.description="$VIRTUAL_SINK_NAME" >/dev/null 2>&1
fi

pactl set-default-sink "$VIRTUAL_SINK_NAME" >/dev/null 2>&1
```

### Selkies 客户端网络环境无法访问 TURN/STUN Server 或者 443 端口, 导致无法建立连接

由于 Selkies 默认开启了 TURN/STUN Server, 无法访问的客户端会尝试连接并失败造成无法成功传输画面. 出现类似于如下日志

Status Log

```log
[14:56:31] [webrtc] [ERROR] attempt to send data channel message before channel was open
```

Debug Log

```log
[14:44:12] [app] using TURN servers: turn:staticauth.openrelay.metered.ca:443?transport=udp
```

一个可能的解决方法是禁用 Selkies 的全部 TURN/STUN Server, 全部流量直接通过反向代理或部署 Selkies 的服务器传输

在 Env 文件中写入如下内容

打开

```path
~/selkies-gstreamer/selkies.env
```

写入

```ini
SELKIES_TURN_HOST=
```

> [!NOTE]
> 若仍然无法加载, 请检查网络环境 UDP 连通性

## 针对 UDP 不佳网络环境的共存部署 KasmVNC

> <https://kasmweb.com/kasmvnc/docs/1.3.4/index.html>

由于 WebRTC 很大程度上依赖 UDP, 并且在受限网络工况中表现不佳, 我们可以使用 KasmVNC 与 Selkies 同时部署的方式, 使得客户端可以选择一个合适的 WebUI 操控方案

### 安装 KasmVNC

安装 KasmVNC Server

```sh
yay -S kasmvncserver-bin openssl-1.1
```

### 配置 WebUI 用户名密码

```sh
kasmvncpasswd -u <USER>
```

> 若要配置与当前用户名称一样的用户名, 请使用
>
> ```sh
> kasmvncpasswd -u $USER
> ```

### 创建证书文件

由于 KasmVNC 强制要求配置 TLS 证书 (无论是否启用 HTTPS), 我们需要使用 OpenSSL 创建证书

```sh
openssl req -x509 -nodes -days 90 -newkey rsa:4096 \
  -keyout ~/ssl-cert-snakeoil.key \
  -out ~/ssl-cert-snakeoil.pem \
  -subj "/C=CN/ST=Default/L=Default/O=KasmVNC/CN=${HOST:-default-host}"

chmod 644 ~/ssl-cert-snakeoil.pem
chmod 600 ~/ssl-cert-snakeoil.key
```

### 编辑 KasmVNC 配置文件

```path
~/.vnc/kasmvnc.yaml
```

写入

```yml
network:
  protocol: http
  interface: 0.0.0.0
  websocket_port: <port>  # edit
  use_ipv4: true
  use_ipv6: true
  udp:
    public_ip: auto
    port: auto
    payload_size: auto
    stun_server: auto
  ssl:
    pem_certificate: /home/<USER>/ssl-cert-snakeoil.pem  # edit
    pem_key: /home/<USER>/ssl-cert-snakeoil.key  # edit
    require_ssl: false
```

> 若服务启动耗时较长, 或显示 `Failed to get public IP, please specify it with -publicIP` 字样, 请修改配置文件的 `network.udp.public_ip` 字段, 或在启动 `kasmvncserver` 时使用 `-publicIP <public-ipaddr>` 指定 公网 IP 地址 (没有者尝试填写内网地址)

### \[可选] 启用 GPU 加速

GPU 加速请按需启用

找到设备上的 Render 设备, 对于拥有单个 GPU 的设备一般来说为 `/dev/dri/renderD128`, 同时拥有核显与独显的设备一般来说编号较大者为独显, 常见于 `/dev/dri/renderD129`

```path
~/.vnc/kasmvnc.yaml
```

添加

```yml
desktop:
  gpu:
    hw3d: true
    drinode: /dev/dri/renderD<id>
```

### 使用不同方法共存部署

目前, 将 Selkies 与 KasmVNC 共存部署共有两种方法 (任选其一即可):

1. [使用 KasmVNC 作为 X11 Session 启动者](#11-禁用-kde-启动程序)
2. [使用 kasmxproxy 转发现有 X11 Display](#21-使用-kasmxproxy-转发现有-x11-display)

### 1.1 禁用 KDE 启动程序

由于 KasmVNC Server 会自己启动一个 X11 Session 调起 DE, 我们需要禁用先前定义的 `headless-x11-kde.service`

```sh
systemctl --user disable --now headless-x11-kde.service
```

### 1.2 配置 DE 启动脚本

由于我们先前已经在 `~/.xinitrc` 写入了启动脚本, 我们可以直接使用 startx 调用

在如下文件

```path
~/.vnc/xstartup
```

写入

```sh
#!/usr/bin/sh

exec ~/.xinitrc
```

> [!WARNING]
> 由于 KasmVNC 启动并接管了 X11 Session, 我们无法使其加载 `20-dummy.conf`, 导致 GPU 加速不可用 (显著表现为在 Session 内运行 `glxinfo -B` 无法找到渲染信息或显示软件渲染)
>
> 这可以通过 [使用 kasmxproxy 转发现有 X11 Display](#21-使用-kasmxproxy-转发现有-x11-display) 解决

并授予可执行权限

```sh
chmod +x ~/.vnc/xstartup
```

### 1.3 配置 KasmVNC 为 Systemd Unit

```path
~/.config/systemd/user/kasmvnc.service
```

写入

```ini
[Unit]
Description=KasmVNC Service
After=network.target

[Service]
Type=simple

ExecStart=/usr/bin/vncserver :0 -fg
ExecStop=/usr/bin/vncserver -kill :0

Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

由于我们禁用了 `headless-x11-kde.service`, 需要将 Selkies Systemd Unit 的等待服务设置为 `kasmvnc.service`

```path
~/.config/systemd/user/selkies.service
```

修改

```ini
After=headless-x11-kde.service
Wants=headless-x11-kde.service
```

为

```ini
After=kasmvnc.service
Wants=kasmvnc.service
```

重载并启用服务

```sh
systemctl --user daemon-reload
systemctl --user restart selkies.service
systemctl --user enable --now kasmvnc.service
```

### 2.1 使用 kasmxproxy 转发现有 X11 Display

先前的 `headless-x11-kde.service` 我们已经在 Display `:0` 启动了一个 X11 Session, 我们需要使用 `kasmxproxy` 转发这个 Display

### 2.2 配置 KasmVNC 与 kasmxproxy 为 Systemd Unit
> 对 `vncserver` 使用 `-noxstartup` 选项以创建空白的 X11 Session, 不启动 DE

```path
~/.config/systemd/user/kasmvnc.service
```
写入
```ini
[Unit]
Description=KasmVNC Service
After=network.target

[Service]
Type=simple
# 不能使用 ExecStartPre, 因为 vncserver 启动不是立即的
ExecStart=/usr/bin/sh -c '/usr/bin/vncserver :99 -noxstartup && /usr/bin/kasmxproxy -a :0 -v :99 -r -f ${KASM_FPS:-60}'
ExecStop=/usr/bin/vncserver -kill :99

Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```
> 如果需要自动修改远程显示器大小, 请携带 `-r` 参数  
> 参数配置请参阅 <https://kasmweb.com/kasmvnc/docs/1.3.4/man/kasmxproxy.html#options>

### 2.3 配置剪切板同步
由于我们使用 `kasmxproxy` 转发了 Display 的内容, 使得 KasmVNC 读取屏幕以及写入剪切板的目标并不是实际上 X11 Session 所在屏幕, 我们需要使用 `xclip` 工具并编写脚本轮询同步剪切板

安装
```sh
yay -S xclip
```

```path
~/.config/systemd/user/kasmvnc-clipboard.sh
```
写入
```sh
#!/bin/bash
export XAUTHORITY="${XAUTHORITY:-$HOME/.Xauthority}"

LAST_0=""
LAST_99=""

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Clipboard Sync Service Started..."
echo "Monitoring :0 (KDE) <-> :99 (KasmVNC)"

while true; do
    CUR_0=$(/usr/bin/xclip -display :0 -o -selection clipboard 2>/dev/null)
    CUR_99=$(/usr/bin/xclip -display :99 -o -selection clipboard 2>/dev/null)

    if [[ "$CUR_0" != "$LAST_0" && -n "$CUR_0" ]]; then
        echo -n "$CUR_0" | /usr/bin/xclip -display :99 -i -selection clipboard
        LAST_0="$CUR_0"
        LAST_99="$CUR_0"
        echo "[$(date '+%H:%M:%S')] Sync: :0 -> :99"

    elif [[ "$CUR_99" != "$LAST_99" && -n "$CUR_99" ]]; then
        echo -n "$CUR_99" | /usr/bin/xclip -display :0 -i -selection clipboard
        LAST_99="$CUR_99"
        LAST_0="$CUR_99"
        echo "[$(date '+%H:%M:%S')] Sync: :99 -> :0"
    fi

    sleep 0.25
done
```

配置为 Systemd Unit
```path
~/.config/systemd/user/kasmvnc-clipboard.service
```
写入
```ini
[Unit]
Description=KasmVNC Clipboard Sync
After=headless-x11-kde.service kasmvnc.service
Requires=headless-x11-kde.service kasmvnc.service

[Service]
ExecStart=/usr/bin/bash "%h/.config/systemd/user/kasmvnc-clipboard.sh"

StandardOutput=journal
StandardError=journal

Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

重载并启用服务
```sh
systemctl --user daemon-reload
systemctl --user enable --now kasmvnc-clipboard.service
```

### 重载并启用服务
```sh
systemctl --user daemon-reload
systemctl --user enable --now kasmvnc.service
```

### [可选] 反向代理配置
KasmVNC 使用 Websocket 作为长连接, 所以可以直接使用一般的现代化反向代理软件. 这里以 Caddy 为例

要使 Caddy 反向代理忽略 TLS 证书有效性, 请使用如下配置
```Caddyfile
host:port {
  reverse_proxy https://<url> {
      transport http {
          tls_insecure_skip_verify
      }
  }
}
```

> [!NOTE]
> 在实际访问页面时, 可能会在弹出 HTTP Basic Auth 时显示 "不安全" (没有 TLS 证书或 TLS 握手失败) 的提示, 这其实是因为浏览器弹窗阻塞了主窗口, 导致握手成功后一瞬间的小🔒图标 (代表 HTTPS 握手成功) 没有被正确显示  
> 本人使用 Wireshark 抓包, 发现 Basic Auth 的讯息是使用 QUIC 发送的, 故不必担心隐私泄露问题

[^what-is-Selkies]: https://selkies-project.github.io/selkies/design/#what-is-selkies-gstreamer

[^uhdp630]: https://www.intel.com/content/www/us/en/products/sku/134854/intel-xeon-e2124g-processor-8m-cache-up-to-4-50-ghz/specifications.html#specs-1-0-4
