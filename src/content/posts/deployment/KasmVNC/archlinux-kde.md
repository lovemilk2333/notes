---
title: 配置适用于 ArchLinux KDE 桌面环境的 KasmVNC
published: 2025-12-19
tags: [Linux, UI, GUI, DE, KDE, KasmVNC, VNC, ReversedProxy]
category: deployment::KasmVNC
---

## 安装基于 X11 的 KDE 桌面环境
> <https://wiki.archlinux.org/title/KDE>  
> <https://archlinux.org/news/plasma-640-will-need-manual-intervention-if-you-are-on-x11/>
```sh
sudo pacman -S plasma-meta plasma-x11-session konsole dolphin pipewire
```

## 安装 KasmVNC
1. 使用 AUR 安装
```sh
yay -S kasmvncserver-bin openssl-1.1
```

2. 生成初始配置
```sh
kasmvncserver
```
选择手动设置密码 (键入选项 1)  
完成后, 会出现文件 `~/.kasmpasswd`

## 配置 KasmVNC
> <https://kasmweb.com/kasmvnc/docs/1.0.0/configuration.html>

修改如下位置的配置文件
```
/etc/kasmvnc/kasmvnc.yaml
```

如下配置文件会在 59000 端口开启外部可访问的 WebVNC
```yml
network:
  protocol: http
  interface: 0.0.0.0
  websocket_port: 59000
  use_ipv4: true
  use_ipv6: true
  udp:
    public_ip: auto
    port: auto
    payload_size: auto
    stun_server: auto
  ssl:
    pem_certificate: /etc/ssl/certs/ssl-cert-snakeoil.pem
    pem_key: /etc/ssl/private/ssl-cert-snakeoil.key
    require_ssl: false
```
当 `network.ssl.require_ssl` 为 `false` 时 允许 HTTP 访问, 但是仍需要指定同级配置下的 `pem_key` 与 `pem_certificate`

要使用 openssl 生成 key 与 certificate, 请使用如下命令生成有效期 90 天的 RSA 4096bit 证书至默认位置:
```sh
sudo openssl req -x509 -nodes -days 90 -newkey rsa:4096 \
  -keyout /etc/ssl/private/ssl-cert-snakeoil.key \
  -out /etc/ssl/certs/ssl-cert-snakeoil.pem \
  -subj "/C=CN/ST=Default/L=Default/O=KasmVNC/CN=${HOST:default-host}"

sudo chmod 644 /etc/ssl/certs/ssl-cert-snakeoil.pem
sudo chmod 600 /etc/ssl/private/ssl-cert-snakeoil.key
```

> ### SEE ALSO
> 要使 Caddy 反向代理忽略 TLS 证书有效性, 请使用:
> ```Caddyfile
> reverse_proxy https://<url> {
>     transport http {
>         tls_insecure_skip_verify
>     }
> }
> ```

## 配置 VNC 启动脚本
打开如下位置脚本文件
```
~/.vnc/xstartup
```

写入如下脚本内容
```sh
#!/bin/bash
unset DBUS_SESSION_BUS_ADDRESS
unset SESSION_MANAGER

export XDG_RUNTIME_DIR="/run/user/$(id -u)"
mkdir -p "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR"

export KWIN_COMPOSE=O2  # use OpenGL 2 as render, change it in need
export XDG_CURRENT_DESKTOP="KDE"

launch_session() {
    pipewire &
    pipewire-pulse &
    wireplumber &

    exec startplasma-x11
}

export -f launch_session

# launch with dbus
exec dbus-run-session bash -c launch_session
```

## 尝试运行
运行如下命令后, 会在上方配置的 `network.websocket_port` 端口启动位于 X11 的 DISPLAY 0 的 WebVNC
```sh
vncserver :0
```

如果该命令较长时间未能成功, 或显示 `Failed to get public IP, please specify it with -publicIP` 字样, 请修改配置文件的 `network.udp.public_ip` 字段, 或在启动 `vncserver` 时使用 `-publicIP <public-ipaddr>` 指定 公网 IP 地址 (没有者尝试填写内网地址)

经测试: 位于反向代理后的 KasmVNC 将 `network.udp.public_ip` 字段配置为内网地址是通过反向代理访问的

## 使用 systemd 开机自启动服务
1. 以免用户服务在 SSH 终止后退出
```sh
loginctl enable-linger lovemilk
```

2. 写入如下位置文件 (文件(夹)不存在就创建)
```
~/.config/systemd/user/kasmvnc.service
```

```ini
[Unit]
Description=KasmVNC Service for <username>
After=network.target

[Service]
Type=simple

Environment="XDG_SESSION_TYPE=x11"
Environment="XDG_CURRENT_DESKTOP=KDE"
# `-fg` to run at foreground
ExecStart=/usr/bin/bash -c "/usr/bin/vncserver :0 -fg"

Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

3. 使 Systemd 刷新出该服务
```sh
systemctl --user daemon-reload
```

4. 启用并启动该服务
```sh
systemctl --user enable --now kasmvnc.service
```
