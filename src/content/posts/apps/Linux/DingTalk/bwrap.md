---
title: 在 Archlinux 上配置 钉钉 (DingTalk) 的 Bwrap 隔离
published: 2026-04-17
tags: [Linux, DingTalk]
category: app::linux::DingTalk
---

由于近日 DingTalk 的 [Flatpak 版本](https://flathub.org/zh-Hans/apps/com.dingtalk.DingTalk) 不再维护, 要在 Linux 上使用文件系统隔离的 DingTalk, 须要自己配置沙盒或隔离环境

## 配置
### 配置 Pacman Hook 以自动将 DingTalk 调用脚本从 `/usr/bin` 移动到不可执行位置
> 要手动移动, 请在安装后运行
> ```sh
> sudo mv /usr/bin/dingtalk /usr/lib/dingtalk_raw
> ```

```sh
sudo mkdir -p /etc/pacman.d/hooks
```

并在
```path
/etc/pacman.d/hooks/dingtalk-isolate.hook
```
写入
```ini
[Trigger]
Operation = Install
Operation = Upgrade
Type = Path
Target = usr/bin/dingtalk

[Action]
Description = Moving DingTalk binary to non-PATH location and ensuring isolation...
When = PostTransaction
Exec = /usr/bin/sh -c 'if [ -L /usr/bin/dingtalk ] || [ -f /usr/bin/dingtalk ]; then mv /usr/bin/dingtalk /usr/lib/dingtalk_raw; fi'
```

### 安装 Bwrap 与 DingTalk
```sh
sudo pacman -S bubblewrap
yay -S dingtalk-bin
```

### 配置 Bwrap 隔离脚本
创建隔离的 HOME 路径
```sh
mkdir -p ~/.var/app-custom
```

为了保证调用 DingTalk 可以直接打开, 须要在如下路径
```path
/usr/local/bin/dingtalk
```
写入
```sh
#!/bin/bash

SANDBOX_HOME="$HOME/.var/app-custom/com.dingtalk.DingTalk"
mkdir -p "$SANDBOX_HOME"

export XDG_DOWNLOAD_DIR="$HOME/Downloads"

exec bwrap \
    --ro-bind / / \
    --dev /dev \
    --proc /proc \
    --tmpfs /tmp \
    --bind "$SANDBOX_HOME" "$HOME" \
    --bind "$HOME/Downloads" "$HOME/Downloads" \
    --ro-bind "$HOME/.config/fontconfig" "$HOME/.config/fontconfig" \
    --share-net \
    --die-with-parent \
    --setenv XDG_DOWNLOAD_DIR "$HOME/Downloads" \
    /usr/lib/dingtalk_raw "$@"
```

> 要挂载自定义路径, 请在最后一个 `--bind=` 后一行添加
> ```sh
> --bind <host-path/主机路径> <container-path/沙盒路径> \
> ```
>  
> 或者使用 `--ro-bind` 以只读挂载

并赋予可执行权限
```sh
sudo chmod +x /usr/local/bin/dingtalk
```

## See Also
### 在 Tmpfs 自动创建目录
例如, 要创建 `/tmp/swap4flat` 目录, 并修改权限为 `a:b` 的 770, 可以在如下路径
```path
/etc/tmpfiles.d/flatpak-swap.conf
```
写入
```conf
# 类型 / 路径 / 模式 / 用户 / 组 / 年龄 / 参数
d /tmp/swap4flat 0770 a b - -
```

然后加载该配置
```sh
sudo systemd-tmpfiles --create /etc/tmpfiles.d/flatpak-swap.conf
```
