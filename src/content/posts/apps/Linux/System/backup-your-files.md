---
title: 管好你的数据捏~ | ArchLinux 文件备份全套配置
published: 2026-04-13
tags: [Linux, filesystem, fs:cryptfs]
category: app::linux::system
---

为了保证文件不丢失不泄露, 提升文件可用性, 本文将介绍我的整套备份解决方案, 你与以便未来的我参考.

## 软件
备份主要采用 Syncthing 跨设备实时同步文件作为备份, lsyncd 在同设备不同磁盘备份

要安装 Syncthing 和 lsyncd, 请运行
> lsyncd 默认使用 rsync 复制文件, `rsync` 包是必要的
```sh
yay -S syncthing lsyncd rsync
```

## 配置
### 创建 `backup` 用户和用户组

```sh
sudo groupadd -g 9999 backup
sudo useradd -u 9999 -g 9999 -m -s /bin/bash backup
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

### 配置 lsyncd
创建如下配置文件

```sh
sudo chown :$USER /home/backup
sudo chmod 0770 /home/backup
sudo mkdir -p /home/backup/.config/lsyncd
sudo chown $USER:backup -R /home/backup/.config/lsyncd
sudo chmod 0770 -R /home/backup/.config/lsyncd
```

```path
/home/backup/.config/lsyncd/lsyncd.conf.lua
```

```lua
settings {
    logfile    = "/home/backup/.config/lsyncd/lsyncd.log",
    statusFile = "/home/backup/.config/lsyncd/lsyncd.status",
    nodaemon   = false,  -- 后台运行
    insist     = true,   -- 即使启动时失败也继续重试
}

sync {
    default.rsync,
    source = "/path/to/source",
    target = "/path/to/backup",
    
    -- delay = second,  -- 同步延迟, 避免重复写入
    rsync = {
        archive = true,
        -- compress = true,  -- 如果是网络同步, 推荐开启压缩
        _extra = {  -- 声明忽略文件
            "--filter=:- .gitignore",
			"--filter=:- .stignore",
			"--filter=:- .kopiaignore"
        }
    }
}

sync {
    default.rsync,
    source = "/path/to/source1",
    target = "/path/to/backup1",
    
    rsync = {
        archive = true,
        _extra = {
            "--filter=:- .gitignore",
			"--filter=:- .stignore",
			"--filter=:- .kopiaignore"
        }
    }
}

-- ...
```

> 要在 Rsync 中不区分大小写地匹配路径, 请手动使用诸如 `*.[Mm][Pp]4` 规则

要在前台测试配置文件, 请使用
```sh
sudo lsyncd -nodaemon /home/backup/.config/lsyncd/lsyncd.conf.lua
```

配置 Systemd Unit

可以在如下路径写入
```path
/home/backup/.config/systemd/user/lsyncd.service
```

```ini
[Unit]
Description=Lsyncd for backup user
After=network.target

[Service]
Type=simple
# 显式指定配置文件路径
ExecStart=/usr/bin/lsyncd -nodaemon %h/.config/lsyncd/lsyncd.conf.lua
Restart=on-failure

[Install]
WantedBy=default.target
```

重载并启用服务 (需要在 [`backup` 用户 Shell 环境](#进入-backup-用户-shell-环境) 中运行)
```sh
systemctl --user daemon-reload
systemctl --user enable --now lsyncd.service
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
