---
title: 修复 PVE 系统网卡无法获取公网 IPv6
published: 2026-04-06
tags: [Linux, PVE, IP, IPv6]
category: app::linux::PVE
---

为了启用 PVE 系统 IPv6, 同时避免系统启动时一直等待, 请遵循如下方法

## 配置
在 sysctl 配置文件中写入如下内容
```path
/etc/sysctl.conf
```

```ini
# IPv6 Support
net.ipv6.conf.all.forwarding = 1
net.ipv6.conf.<interface>.forwarding = 1

net.ipv6.conf.default.accept_ra = 2
net.ipv6.conf.all.accept_ra = 2
net.ipv6.conf.<interface>.accept_ra = 2

net.ipv6.conf.<interface>.autoconf = 1
```
> 其中 `<interface>` 字样为你的 PVE 桥接网卡名称, 一般为 `vmbr0`, 可以查看如下文件获得:
> ```path
> /etc/network/interfaces
> ```
> 中
> ```
> ...
> auto lo
> iface lo inet loopback
> 
> iface enp2s0 inet manual
> 
> auto vmbr0  # 差不多是这里
> iface vmbr0 inet dhcp
> 	bridge-ports enp2s0
> 	bridge-stp off
> 	bridge-fd 0
> ```

> [!WARNING]
> 不得在 `/etc/network/interfaces` 添加 `iface <interface> inet6 auto`, 这可能导致系统启动时一直等待

重载并应用配置
```sh
sudo sysctl -p
```

要验证是否成功获取 IPv6, 请使用
```sh
ip -6 a show <interface>
```
例如
```sh
ip -6 a show vmbr0
```

## BTW
要在 Cloudflared 服务中启用 IPv6 边缘节点, 请添加参数:
```sh
--edge-ip-version 6
```
