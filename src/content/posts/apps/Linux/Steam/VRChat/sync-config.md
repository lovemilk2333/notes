---
title: VRChat 同步配置 (需要注册表)
published: 2025-09-10
tags: [Linux, Steam, VRChat, WindowsReg]
category: app::linux::steam::vrchat
---

VRChat 的全部配置项位于注册表 `HKEY_CURRENT_USER\Software\VRChat\VRChat`  
(注册表数据库文件则位于 `%USERPROFILE%\NTUSER.DAT`[^path2reg])

[^path2reg]: 即 `C:\Users\<USERNAME>\NTUSER.DAT`, 其中 `<USERNAME>` 字样是你的 Windows 账户名  
(若使用在线微软帐户登录, 则为你微软帐户邮箱的前几位)

## 修复
1. 将上述注册表位置到导出 `.reg` 文件
2. 找到 `<compatdata>/438100/pfx` 文件夹 其中, `438100` 是 VRChat 的 APPID / [获取 `compatdata` 文件夹位置](../../compatdata/#描述)
3. 打开上述文件夹的 `user.reg` 文件, 找到 `[Software\\VRChat\\VRChat]` 字样 (如果没有请在任意空白位置自行创建), 替换下方字段内的内容为导出的 `.reg` 文件的内容 (不包括 `Windows Registry Editor Version` 开头的和 `[HKEY_...]` 的内容 (`...` 代表任意字符))
4. 启动 VRChat 方可
