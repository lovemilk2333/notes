---
title: 在 Archlinux 上对 Discord 自动使用 Vencord 修补
published: 2025-09-12
tags: [Discord, VoiceChat, Vencord, Linux]
category: app::discord
---

在 Archlinux 上使用包管理器 (Pacman) 安装/更新 Discord 时, 会导致 Vencord 的修补失效, 需要每次更新后手动修补, ~~这是十分不健康的行为~~

为自动化上述行为, 我们需要用到 Pacman 的 hook

## 使用 hook
hook 是一个位于 `/etc/pacman.d/hooks/` 的 `.hook` 配置文件, 通过得当配置, 我们可以在对包进行操作的任意阶段运行自定义脚本

要实现 Discord 的 Vencord 自动修补, 请遵循如下步骤

## 创建并写入 hook 文件
创建一个任意名称的 `.hook` (以 `discord.hook` 为例) 位于 `/etc/pacman.d/hooks/`, 写入如下内容

```ini
# 触发器
[Trigger]
# 在安装时
Operation = Install
# 在更新时
Operation = Upgrade
# 触发器目标类型为 包
Type = Package
# 指定包为 `discord`
Target = discord

# 执行的操作
[Action]
# 任意内容的简介
Description = Auto patch discord with Vencord
# 在上述操作 (安装/更新) 完整后运行
When = PostTransaction
# 运行的命令 (运行指定脚本, 脚本路径须要和下步的路径相同)
Exec = /usr/bin/env sh -c 'sh -c "/path/to/your/script.sh"'
```

## 创建并写入安装脚本
在任意目录下 (以 `/path/to/your/script.sh` 为例, 保证有权限, 由于 hook 是以 root 用户运行的, 其实没有那么大讲究) 创建如下脚本

:::note
如下脚本改造自 [Vencord 官方 Linux 安装脚本](https://raw.githubusercontent.com/Vendicated/VencordInstaller/main/install.sh)
:::

```sh
#!/bin/sh
set -e

# 定义传递给 Vencord 安装器的参数, 以静默自动安装
installer_args="-install -branch=auto"
download_url="https://github.com/Vendicated/VencordInstaller/releases/latest/download/VencordInstallerCli-Linux"

if grep -q "CHROMEOS_RELEASE_NAME" /etc/lsb-release 2>/dev/null; then
	echo "ChromeOS is not supported! Use the chrome extension. https://chromewebstore.google.com/detail/vencord-web/cbghhgpcnddeihccjmnadmkaejncjndb"
	exit 1
fi


outfile=$(mktemp -t vencord-installer-XXXXXX)
trap 'rm -f "$outfile"' EXIT

echo "Downloading Installer..."

set -- "XDG_CONFIG_HOME=$XDG_CONFIG_HOME"

# 下载安装器至临时路径
if command -v aria2c >/dev/null 2>&1; then
  threads=${VENCORD_PATCH_DLTHREAD:-16}
  echo "Using aria2 to download. You can set VENCORD_PATCH_DLTHREAD=<num> to change download threads."
  aria2c -x "$threads" -s "$threads" --min-split-size=1M --allow-overwrite=true -o "$(basename "$outfile")" -d "$(dirname "$outfile")" "$download_url"
  
elif command -v wget >/dev/null 2>&1; then
  echo "Using wget to download. Installing aria2 can speed up downloading."
  wget -O "$outfile" "$download_url"
  
elif command -v curl >/dev/null 2>&1; then
  echo "Using curl to download. wget supports auto-retry, and installing aria2 is recommended for faster speeds."
  curl -sS "$download_url" --output "$outfile" --location --fail

else
  echo "Neither aria2, wget nor curl were found. Please install one of them to proceed."
  exit 1
fi

chmod +x "$outfile"

# 运行安装器
if [ "$(id -u)" -eq 0 ]; then
    env "$@" "$outfile" $installer_args
elif command -v sudo >/dev/null; then
  echo "Running with sudo"
  sudo env "$@" "$outfile" $installer_args
elif command -v doas >/dev/null; then
  echo "Running with doas"
  doas env "$@" "$outfile" $installer_args
elif command -v run0 >/dev/null; then
  echo "Running with run0" 
  run0 env "$@" "$outfile" $installer_args
elif command -v pkexec >/dev/null; then
  echo "Running with pkexec"
  pkexec env "$@" "SUDO_USER=$(whoami)" "$outfile" $installer_args
else
  echo "Neither sudo nor doas were found. Please install either of them to proceed."
fi
```

## 完成
此后, 在您每次安装/更新 Discord 时, 会自动运行上述脚本, 以自动使用 Vencord 修补
