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

从 [Selkies Releases](https://github.com/selkies-project/selkies/releases) 下载便携版压缩包并解压, 该版本自带 Python 与 GStreamer 运行环境, 不依赖系统 Python

```sh
curl -LO https://github.com/selkies-project/selkies/releases/download/v<version>/selkies-gstreamer-portable-v<version>_amd64.tar.gz
tar -xzf selkies-gstreamer-portable-v<version>_amd64.tar.gz -C ~
```

默认安装路径位于 `~/selkies-gstreamer`

### 配置 Selkies 的 Systemd Unit

在如下路径新建 Env 文件

```path
~/selkies-gstreamer/selkies.env
```

修改必要配置, 诸如端口号, 用户, 密码与[编码器配置](https://selkies-project.github.io/selkies/component/#encoders)

```ini
SELKIES_ADDR=0.0.0.0
SELKIES_PORT=<port>
SELKIES_MODE=webrtc
SELKIES_BASIC_AUTH_USER=<user>
SELKIES_BASIC_AUTH_PASSWORD=<password>
SELKIES_ENCODER=h264enc
SELKIES_USE_CPU=true
SELKIES_ENABLE_RESIZE=false
SELKIES_MANUAL_WIDTH=1920
SELKIES_MANUAL_HEIGHT=1080
SELKIES_STUN_HOST=<stun-host>
SELKIES_STUN_PORT=<stun-port>
```

> [!NOTE]
> 编码器名称必须在 `selkies-gstreamer-run --help` 输出的可选值列表中. 本机使用 `h264enc` 并设置 `SELKIES_USE_CPU=true`, 让 Selkies 使用软件编码. 该参数只切换视频编码器, 不改变 X11 捕获的 Display

> [!NOTE]
> 对于无法使用 GPU 的虚拟机或者 GPU 性能较弱设备 (如我使用的 Intel UHD Graphics P630[^uhdp630]), 使用 CPU 编码可能出现跳帧问题, 可尝试降低分辨率或帧率

在如下文件写入 Unit

```path
~/.config/systemd/user/selkies.service
```

```ini
[Unit]
Description=Selkies GStreamer Service
# 必须和 KasmVNC Unit 名称对应, `Wants` 同理
After=kasmvnc.service
Wants=kasmvnc.service

[Service]
Type=simple
# 设置默认环境变量, 参考官方文档
Environment=DISPLAY=:0
Environment=XAUTHORITY=%h/.local/state/kasmvnc.auth
Environment=PIPEWIRE_LATENCY=128/48000
Environment=XDG_RUNTIME_DIR=%t
Environment=PIPEWIRE_RUNTIME_DIR=%t
Environment=PULSE_RUNTIME_PATH=%t/pulse
Environment=PULSE_SERVER=unix:%t/pulse/native

EnvironmentFile=%h/selkies-gstreamer/selkies.env

ExecStart=%h/selkies-gstreamer/selkies-gstreamer-run \
    --addr=${SELKIES_ADDR} \
    --port=${SELKIES_PORT} \
    --enable-https=false \
    --encoder=${SELKIES_ENCODER} \
    --manual-width=${SELKIES_MANUAL_WIDTH} \
    --manual-height=${SELKIES_MANUAL_HEIGHT} \
    --enable-resize=${SELKIES_ENABLE_RESIZE} \
    --framerate=60 \
    --video-on-start=true \
    --use-cpu=${SELKIES_USE_CPU}

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

## 配置 TURN 服务器以支持公网访问

> 截至 v1.6.2, Selkies 的媒体传输仅支持 WebRTC, WebSocket 传输模式尚未发布

WebRTC 优先尝试 P2P 直连, 当客户端与服务器之间无法建立直连时 (例如服务器位于 NAT 后, 公网出口为代理, 或客户端网路封禁 UDP), 必须通过 TURN 服务器中继媒体流. Selkies 默认使用公共 TURN 服务, 可用性无法保证, 公网访问场景推荐自建

### 安装并配置 coturn

```sh
sudo pacman -S coturn
```

coturn 的静态用户库为 SQLite 数据库, 无法直接写入明文文件, 需要使用 `turnadmin` 生成

```sh
sudo -u turnserver turnadmin -a -u <user> -r <realm> -p <password> -b /etc/turnserver/turnuserdb.conf
```

在如下路径写入配置

```path
/etc/turnserver/turnserver.conf
```

```ini
listening-port=3478
min-port=49152
max-port=65535
realm=<realm>
userdb=/etc/turnserver/turnuserdb.conf
lt-cred-mech
fingerprint
```

> [!WARNING]
> Arch 的 coturn 服务读取的配置文件为 `/etc/turnserver/turnserver.conf`, 而非 `/etc/turnserver.conf`, 配置写错位置时所有配置会静默失效, 包括鉴权, 使 TURN 退化为任意人可用的开放中继

> [!NOTE]
> 若客户端直接连接 TURN 服务器且服务器位于 NAT 后, 需增加 `external-ip=<内网地址>/<公网地址>`, 否则下发的 TURN 中继地址不可达; 若客户端经由反向代理接入, 则不需要该配置

启动服务

```sh
sudo systemctl enable --now turnserver
```

> [!NOTE]
> 验证是否生效可查看 coturn 日志, 客户端连接后出现的会话记录中应带有 `realm` 与 `username` 字段

### 配置 Selkies 使用自建 TURN

打开

```path
~/selkies-gstreamer/selkies.env
```

添加

```ini
SELKIES_TURN_HOST=<turn-host>
SELKIES_TURN_PORT=<turn-port>
SELKIES_TURN_PROTOCOL=tcp
SELKIES_TURN_TLS=false
SELKIES_TURN_USERNAME=<user>
SELKIES_TURN_PASSWORD=<password>
```

> [!NOTE]
> 若 TURN 端口无法直接暴露, 或者想要统一使用 Caddy 管理 TLS 证书, 可使用 L4 反向代理转发, 由代理终结 TLS 后以明文转发至 coturn 的 3478 端口. 此时 `SELKIES_TURN_TLS=true`, `SELKIES_TURN_PORT` 填写代理的监听端口, coturn 侧无需配置证书
> 
> 对于带有 `https://github.com/mholt/caddy-l4` 插件的 Caddy, 可以直接参考如下 Caddyfile
> ```Caddyfile
> # 全局配置
> {
> layer4 {
>       :5349 {
>           @my-domain {
>               tls sni <sni>
>           }
>
>           route @my-domain {
>               tls
>               proxy <internal-ip>:3478
>           }
>       }
>   }
> }
> ```

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

> [!NOTE]
> 无实体音频输入设备的机器还需要将默认录音源指向虚拟输出的 Monitor, 否则 Selkies 的音频管线会因找不到默认源而失败 (报 `Failed to connect stream: No such entity`)

```sh
pactl set-default-source "$VIRTUAL_SINK_NAME.monitor" >/dev/null 2>&1
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

若客户端与服务器之间可以建立直连 (如同处一个内网), 可以禁用 Selkies 的全部 TURN/STUN Server; 若需要公网访问, 请参阅 [配置 TURN 服务器以支持公网访问](#配置-turn-服务器以支持公网访问)

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
> 若仍然无法加载, 请检查网路环境 UDP 连通性

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

## 针对 UDP 不佳网路环境的共存部署 KasmVNC

> <https://kasmweb.com/kasmvnc/docs/1.3.4/index.html>

由于 WebRTC 很大程度上依赖 UDP, 并且在受限网路工况中表现不佳, 我们可以使用 KasmVNC 与 Selkies 同时部署的方式, 使得客户端可以选择一个合适的 WebUI 操控方案

### 安装 KasmVNC

安装 KasmVNC Server

```sh
yay -S kasmvncserver-bin openssl-1.1
```

> [!WARNING]
> `kasmvncserver-bin` 1.5.0 存在启动崩溃问题 (Xvnc 在编码器探测阶段段错误, 导致服务无限重启), 请使用 1.4.0

```sh
git clone https://aur.archlinux.org/kasmvncserver-bin.git
cd kasmvncserver-bin
git checkout 63d4b2c  # 1.4.0-2
makepkg -si
```

并在 `/etc/pacman.conf` 中阻止其被升级

```ini
IgnorePkg = kasmvncserver-bin
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

先检查 Render 设备及其 PCIe 路径

```sh
ls -l /dev/dri /dev/dri/by-path/*-render 2>/dev/null
```

若存在 PCIe Render 设备, 使用实际存在的设备路径. 例如 `/dev/dri/renderD128`

```path
~/.vnc/kasmvnc.yaml
```

添加

```yml
desktop:
  gpu:
    hw3d: true
    drinode: /dev/dri/renderD<id>
  resolution:
    width: 1920
    height: 1080
```

`hw3d` 开启后, KasmVNC 的 X Server 会提供 DRI3 扩展, 应用可自行分配 GPU 缓冲并直接渲染, 即使 Xvnc 不提供 GLX 也能获得硬件加速

若不存在 PCIe Render 设备, 只保留分辨率配置, 不要填写 `desktop.gpu`

```yml
desktop:
  resolution:
    width: 1920
    height: 1080
```

> [!WARNING]
> `drinode` 必须指向实际存在且当前用户可访问的 Render 设备. 没有 PCIe Render 设备时仍填写该字段, 可能导致 KasmVNC 中的 KDE 启动动画结束后黑屏

> [!NOTE]
> 分辨率必须通过 `desktop.resolution` 指定, `vncserver -geometry` 参数在新版本中不会生效

> [!NOTE]
> Xvnc 不提供 GLX 扩展, Chrome 的 ANGLE GL 后端会因此回退到软件渲染, 需要添加启动参数强制使用 EGL

打开

```path
~/.config/chrome-flags.conf
```

写入

```txt
--use-angle=gl-egl
```

在会话内运行 `eglinfo` 确认渲染器为 `iris` (Intel) 等硬件驱动名称即配置成功

### 使用 KasmVNC 作为主会话

KasmVNC 直接启动 KDE 的 X11 Session, Selkies 捕获同一个 Display. 不再启动独立的 Xorg, 也不使用 `kasmxproxy` 转发画面.

### 1.1 禁用 KDE 启动程序

由于 KasmVNC Server 会自己启动一个 X11 Session, 我们需要禁用先前定义的 `headless-x11-kde.service`

```sh
systemctl --user disable --now headless-x11-kde.service
```

### 1.2 启动 DE

创建 `~/.vnc/xstartup`, 使 KasmVNC 启动前面配置的 KDE X11 脚本

```sh
#!/usr/bin/sh

exec ~/.xinitrc
```

配置可执行权限

```sh
chmod +x ~/.vnc/xstartup
```

Selkies 需要在没有客户端连接 KasmVNC 时也能采集画面, 因此不能使用 `-noxstartup`

### 1.3 配置 KasmVNC 为 Systemd Unit

```path
~/.config/systemd/user/kasmvnc.service
```

写入

```ini
[Unit]
Description=KasmVNC Service (KDE session on :0)
After=network.target

[Service]
Type=simple
Environment=DISPLAY=:0
Environment=XAUTHORITY=%h/.local/state/kasmvnc.auth
Environment=XDG_SESSION_TYPE=x11
Environment=XDG_CURRENT_DESKTOP=KDE
Environment=DESKTOP_SESSION=plasma
ExecStartPre=/usr/bin/sh -c '/usr/bin/vncserver -kill :0 >/dev/null 2>&1 || true; rm -f /tmp/.X0-lock /tmp/.X11-unix/X0'
ExecStart=/usr/bin/vncserver :0 -fg -xstartup %h/.vnc/xstartup -geometry 1920x1080 -depth 24 -SecurityTypes None -DisableBasicAuth
ExecStop=/usr/bin/vncserver -kill :0

Restart=on-failure
RestartSec=5

StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target
```

将 Selkies Systemd Unit 的等待服务设置为 `kasmvnc.service`

```path
~/.config/systemd/user/selkies.service
```

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
