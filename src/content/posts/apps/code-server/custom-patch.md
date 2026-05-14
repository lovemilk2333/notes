---
title: 在 Archlinux 上对 Code Server 自动 Patch JS
published: 2026-05-14
tags: [Code Server, VS Code, Chrome]
category: app::code-server
---

由于我的部分客户端 Chrome 版本过旧, 导致 `structuredClone` 函数不存在, 或是 `window.globalThis` 不存在, 造成 Code Server 终端打开空白 或 直接无法加载

## 配置 Code Server Patch 脚本
Code Server 的主要 HTML 位于 `/usr/lib/code-server/lib/vscode/out/vs/code/browser/workbench/workbench.html`, 我们可以对该 HTML 进行 Path

一个可能的操作, 在
```path
/usr/local/bin/patch-code-server.sh
```
写入
```sh
#!/usr/bin/bash

# Exit on error, display commands, and treat unset variables as errors
set -xeu

# Define core paths
readonly BASE_DIR="/usr/lib/code-server"
readonly HTML_FILE="$BASE_DIR/lib/vscode/out/vs/code/browser/workbench/workbench.html"
# Patch directory inside static asset tree for web accessibility
readonly PATCH_DIR="$BASE_DIR/lib/vscode/out/vs/code/browser/workbench/patch"
readonly BACKUP_FILE="${HTML_FILE}.bak"

# Ensure we are running as root
if [[ $EUID -ne 0 ]]; then
    echo "This script must be run with sudo or as root."
    exit 1
fi

# 1. Check if the file is already patched
# Using -F for fixed string and -q for quiet exit status
if ! grep -Fq "patch/patch.js" "$HTML_FILE"; then
    echo "Fresh HTML detected. Updating backup: $BACKUP_FILE"
    cp "$HTML_FILE" "$BACKUP_FILE"

    # 2. Create patch directory and placeholders
    mkdir -p "$PATCH_DIR"

    # Create empty JS files if they don't exist
    [[ ! -f "$PATCH_DIR/patch.js" ]] && echo "/* Custom Header Patch */" > "$PATCH_DIR/patch.js"
    [[ ! -f "$PATCH_DIR/postpatch.js" ]] && echo "/* Custom Body Patch */" > "$PATCH_DIR/postpatch.js"

    # Ensure correct permissions for the web server
    chmod -R 755 "$PATCH_DIR"

    # 3. Inject Header Patch
    # Insert before </head>
    sed -i '/<\/head>/i \		<script src="{{WORKBENCH_WEB_BASE_URL}}/out/vs/code/browser/workbench/patch/patch.js"></script>' "$HTML_FILE"

    # 4. Inject Body Patch
    # Insert before </body>
    sed -i '/<\/body>/i \		<script src="{{WORKBENCH_WEB_BASE_URL}}/out/vs/code/browser/workbench/patch/postpatch.js"></script>' "$HTML_FILE"

    echo "Successfully applied patches and created backup."
else
    echo "HTML already contains patch markers. Skipping backup and injection to avoid corruption."
fi
```

授予权限
```sh
sudo chown root:root /usr/local/bin/patch-code-server.sh
sudo chmod +x /usr/local/bin/patch-code-server.sh
``` 

## 创建 Pacman Hook
在
```path
/etc/pacman.d/hooks/code-server-patch.hook
```
写入
```ini
[Trigger]
Operation = Install
Operation = Upgrade
Type = Package
Target = code-server

[Action]
Description = Re-applying custom JS patches to code-server HTML...
When = PostTransaction
Exec = /usr/local/bin/patch-code-server.sh
```

## 创建/修改 Patch 脚本
为了保证 `structuredClone` 可被 Fallback, 可以在
```path
/usr/lib/code-server/lib/vscode/out/vs/code/browser/workbench/patch/patch.js
```
写入
```js
console.debug('Chrome Fix Compatibility loaded')
if (typeof globalThis === "undefined") {
    window.globalThis = window
    console.debug('Chrome Fix Compatibility patched `globalThis`');
}

if (!window.structuredClone || typeof window.structuredClone !== 'function') {
    window.structuredClone = (obj) => JSON.parse(JSON.stringify(obj))
    console.debug('Chrome Fix Compatibility patched `window.structuredClone`');
}
```

## 运行 Patch Code Server 脚本或重新安装 Code Server
```sh
sudo pacman -S code-server
```

## 重启 Code Server 服务
```sh
systemctl restart --user code-server.service
```

## 在客户端刷新页面
在客户端使用 `Ctrl+F5` 以在刷新页面同时清除页面缓存
