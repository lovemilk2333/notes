---
title: 管好你的数据捏~ | ArchLinux 文件备份全套配置
published: 2026-04-13
tags: [Linux, filesystem, fs:cryptfs]
category: app::linux::system
---

为了保证文件不丢失不泄露, 提升文件可用性, 本文将介绍我的整套备份解决方案, 你与以便未来的我参考.

## 软件
备份主要 Syncthing 跨设备(或跨磁盘)实时同步文件作为备份

```sh
yay -S syncthing
```

## 配置
### 创建 `backup` 用户和用户组

```sh
sudo groupadd -g 9999 backup
sudo useradd -u 9999 -g 9999 -m -s /bin/bash backup
```

### 禁用 `backup` 用户 SSH
在 SSHD 配置文件
```path
/etc/ssh/sshd_config
```
写入
```conf
# disabled users for SSH login
DenyUsers backup
```

并重启 SSHD 服务
```sh
sudo systemctl restart sshd.service
```
> 若要尝试配置是否生效, 可以实时查看 SSHD 日志
> ```sh
> journalctl -u sshd -f 
> ```
> 并在另一个终端运行
> ```sh
> # 如果不是默认的 22 端口, 请使用参数 `-p <port>`
> ssh backup@127.0.0.1
> ```
> 
> 然后可以在日志中看到类似如下内容代表配置已经生效了
> ```log
> sshd-session[xxxxxx]: User backup from 127.0.0.1 not allowed because listed in DenyUsers
> ```

### 启用自动运行 `backup` 用户的 Systemd Units
```sh
sudo loginctl enable-linger backup
```

### 配置 `backup` 用户的 Syncthing
> 本方法不适用 Syncthing 同步数据用途, 因为新的文件会被创建为 `backup:backup`, 导致权限配置失败

1. 如果已经在当前用户配置过 Syncthing, 可以进行如下迁移

```sh
sudo mkdir -p /home/backup/.local/state/syncthing
sudo cp -r ~/.local/state/syncthing /home/backup/.local/state/
sudo chown backup:backup -R /home/backup/.local/state/syncthing
sudo chmod 0700 -R /home/backup/.local/state/syncthing
```

2. 启动 Syncthing
```sh
sudo systemctl enable --now syncthing@backup.service
```

3. 配置 Syncthing
前往 <http://127.0.0.1:8384> 进行配置

4. 修改需要 Syncthing 备份的文件夹的用户组为 `backup`
若当前用户需要访问备份文件夹, 仅修改用户组
```sh
sudo chown :backup -R /path/to/backup
sudo chmod 0770 -R /path/to/backup
sudo chmod g+s /path/to/backup
```
否则, 修改为 `backup:backup` 并改为 `0700` 权限, 以防止当前用户的不法应用扫盘
```sh
sudo chown backup:backup -R /path/to/backuponly
sudo chmod 0700 -R /path/to/backuponly
sudo chmod g+s /path/to/backuponly
```

> 如果你要备份的文件在你的 HOME 目录, 请注意使用 ACL 控制权限, 否则可能导致权限与 SSH 等安全性要求高的程序无法使用
> ```sh
> sudo setfacl -m u:backup:x ~
> sudo setfacl -R -m u:backup:rX ~/path/to/backuponly
> ```

### 跨磁盘备份
跨磁盘备份可以使用 当前用户 与 `backup` 用户分别运行一个 Syncthing, 然后在两个 Syncthing 间同步

如果需要在 `backup` 用户同用户下备份, 可以使用 `mutagen` 文件监听与同步工具:
```sh
yay -S mutagen.io-bin
```

安装完成后, 可以在 `backup` 用户运行如下命令以创建同步
```sh
mutagen sync create --name=<name> -m=<sync-mode> <alpha> <beta> [--ignore=...]
```
> `alpha` 与 `beta` 是两个 endpoint, *The reason that these endpoints aren’t termed “source” and “destination” is that Mutagen has multiple synchronization modes*

要保证单项同步或其他同步方式, 请参阅 <https://mutagen.io/documentation/synchronization/#modes>

一个典型同步创建命令如下
```sh
mutagen sync create --name=cloudbackup-enc --mode=one-way-safe --ignore-vcs --ignore=".stfolder/" --ignore=".cache/" <source> <target>
```

配置 Mutagen Systemd Unit

在如下位置
```path
/home/backup/.config/systemd/user/mutagen.service
```
写入
```ini
[Unit]
Description=Mutagen Sync Daemon
After=network.target

[Service]
Type=forking
ExecStart=/usr/bin/mutagen daemon start
ExecStop=/usr/bin/mutagen daemon stop
Restart=always

[Install]
WantedBy=default.target
```

重载并启用该服务
```sh
systemctl daemon-reload --user
systemctl enable --user --now mutagen.service
```

### 进入 `backup` 用户 Shell 环境
为了可以便捷得管理备份文件, 我们可以进入 `backup` 用户

可以设置如下别名
```sh
alias enter-backup-user="sudo -E machinectl shell backup@.host"
```

要打开 `backup` 仅用户可访问的路径, 请添加如下函数
```sh
local BACKUP_DEST_DIR="/tmp/.backup-export"

getbackup() {
    local SRC_FILE="$1"

    local TARGET_PATH=$(sudo -u backup zsh -c '
        DEST="'"$BACKUP_DEST_DIR"'"
        SRC="'"$SRC_FILE"'"
        
        if [[ ! -f "$SRC" ]]; then exit 1; fi

        mkdir -p "$DEST" 1>&2
        chmod 777 "$DEST" 1>&2

        FILENAME=$(basename "$SRC")
        TARGET="$DEST/$FILENAME"
        
        cp -a "$SRC" "$TARGET" 1>&2
        chmod 644 "$TARGET" 1>&2

        echo "$TARGET"
    ')

    if [[ -z "$TARGET_PATH" ]]; then
        return 1
    fi

    sudo chown $USER:$USER "$TARGET_PATH" 1>&2
    chmod 700 "$TARGET_PATH" 1>&2

    echo "$TARGET_PATH"
}

clearbackup() {
    if [[ -z "$BACKUP_DEST_DIR" || ! -d "$BACKUP_DEST_DIR" ]]; then
        return 1
    fi

    rm -f -- "$BACKUP_DEST_DIR"/*
}
```

并使用诸如
```sh
command $(getbackup /path/to/file)
```

或者, 可以使用 Yazi
```sh
sudo pacman -S yazi
```

```sh
alias browsebackup="sudo -Eu backup yazi"
```

### 使用 Git 同步
```sh
#!/usr/bin/env bash

set -eu

PROJECT_DIR="$1"

if [ -z "$PROJECT_DIR" ]; then
    echo "Usage: $0 /path/to/your/repo"
    exit 1
fi

cd "$PROJECT_DIR" || exit 1

if [[ -z $(git status --porcelain) ]]; then
    echo "No changes to commit."
    exit 0
fi

# git pull --rebase
git pull

git add .

git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S %z')"

git push origin $(git rev-parse --abbrev-ref HEAD)

echo "[$(date)] Sync completed for $PROJECT_DIR"
```

## See Also

### 删除 Syncthing 历史记录文件

1. 列出要删除的文件(夹), 确保没有重要数据被删除
> `.stversions` 是 Syncthing "文件版本控制" 所指定的 "历史版本路径", 请与 Syncthing 配置相匹配
```sh
find /path/to/backup \( -name ".stversions" -type d \) -o \( -name ".sync-conflict-*" -type f \)
```

2. 删除文件
```sh
find /path/to/backup \( -name ".stversions" -type d -o -name ".sync-conflict-*" -type f \) -exec rm -rf {} +
```

### 使用 Rmlint 移除或链接相同文件
1. 安装
```sh
yay -S rmlint
```

2. 在目标目录下运行 `rmlint`  

其会在当前工作文件夹生成 `rmlint.json` 与 `rmlint.sh`

3. 运行 `rmlint.sh`
```sh
./rmlint.sh
```
> 默认情况下是删除相同的文件副本, 可以使用:
> - `-rl` 使用相对路径软链接
> - `-H` 使用硬链接
> - `-p` 在删除文件前再次校验 Hash, 
> - `-c` 在支持 CoW 的文件系统上使用 CoW (reflink)
> - `-d` (默认) 删除相同的文件副本

4. 清理 Rmlint 缓存文件
```sh
rm rmlint.json
```

<!-- TODO -->
<!-- ### 清理或合并 **相似** 的媒体文件 —— Czkawka
1. 安装
```sh
# 或者使用 czkawka-gui
sudo pacman -S czkawka-cli
```

2. 查找相似媒体文件  
对于图片, 可以使用
```sh
czkawka_cli image --max-difference 10 -d /path/to/images
```
其中, `10` 为 *不相似度* 等级, 可选 `[0, 100]`, 推荐 `<=15` 以免误判
`-f` 设置扫描结果保存的文件路径
 -->

### 在当前 GUI 环境下以用户 *backup* 运行应用程式

1. 授权当前的 X11 渲染环境访问权限 (Wayland 将回退到 XWayland)
```sh
xhost +SI:localuser:backup
```

2. 以 `backup` 运行应用程式 (以 `dolphin` 为例)
> `kdesu` 需要安装 `kde-cli-tools` 包
> 
> ```sh
> sudo pacman -S kde-cli-tools
> ```
```sh
sudo -E /usr/lib/kf6/kdesu -u backup dolphin
```

> BTW, 要同步 Dolphin 配置~~以及默认应用打开方式~~ (打开方式可能无效) 到 `backup`, 请使用
> ```sh
> sudo cp ~/.config/dolphinrc ~/.config/mimeapps.list /home/backup/.config/
> sudo chown backup:backup /home/backup/.config/dolphinrc /home/backup/.config/mimeapps.list
> sudo chmod 770 /home/backup/.config/dolphinrc /home/backup/.config/mimeapps.list
> ```
> 并重启 Dolphin

> 要设置 Dolphin 为深色主题并且不会在重启 Dolphin 后字体变为黑色, 可以使用
> ```sh
> # 设置颜色方案为 Breeze Dark
> sudo -u backup kwriteconfig6 --file kdeglobals --group General --key ColorScheme BreezeDark
> 
> # 设置全局主题为 Breeze Dark
> sudo -u backup kwriteconfig6 --file klaunchrc --group General --key GlobalTheme BreezeDark
> 
> # 刷新图标主题
> sudo -u backup kwriteconfig6 --file kdeglobals --group Icons --key Theme breeze-dark
> ```
> 然后在 Dolphin 右上角菜单 "配置" > "窗口配色方案" 为 "Breeze Dark" ("Breeze 微风深色")
