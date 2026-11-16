---
title: 修复 AFWall+ 在 Android 自启动失败导致在防泄漏模式下无法联网
published: 2026-11-16
tags: [Android, AFWall+]
category: app::android
---

AFWall+ (Android Firewall+), Your Privacy, Your Control - AFWall+ gives you complete control over which apps can access the internet on your Android device.
> <https://github.com/ukanth/afwall>


## 解决
1. 启用 AFWall+ 首选项 "规则/连接" > "活动规则" 以允许 *开机时应用规则*; 下方的各个场景 (如漫游/局域网等) 不勾选就默认使用 WIFI 和 蜂窝网络 (移动数据) 的规则
2. 修改系统应用自启动配置 及 第三方管理软件自启动配置保证 AFWall+ 可以自启动; 若仍旧无法自启动的, 可以尝试使用可以自启动的软件或模块直接调起 AFWall+ 主界面
3. 在 "防泄漏模式" 下开机时出现短暂断网是因为 AFWall+ 写入了开机自启动脚本将各个 iptables stack 默认设为 DROP, 属正常现象
