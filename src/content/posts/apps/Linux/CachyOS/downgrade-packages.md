---
title: 在 CachyOS 上降级 CachyOS 专有软件包
published: 2026-05-11
tags: [Linux, CachyOS, downgrade]
category: app::linux::CachyOS
description: 在 CachyOS 上使用 CachyOS 提供的脚本降级 CachyOS 专有软件包
---

> https://discuss.cachyos.org/t/cachyos-downgrade-a-script-to-downgrade-packages-for-cachy/27949

## 安装
安装 AUR 软件包 `cachyos-downgrade-git`
```sh
yay -S cachyos-downgrade-git
```

或者,
> https://gitlab.com/cscs/cachyos-downgrade

将如上脚本下载至
```path
/usr/local/bin
```
并给予可执行权限

```sh
curl -O https://gitlab.com/cscs/cachyos-downgrade/-/raw/main/cachyos-downgrade
chmod +x ./cachyos-downgrade
sudo mv ./cachyos-downgrade /usr/local/bin
rm ./cachyos-downgrade
```

## 使用
```sh
sudo cachyos-downgrade <package>
```

例如, 要降级 `linux-cachyos`:
```sh
sudo cachyos-downgrade linux-cachyos
```
