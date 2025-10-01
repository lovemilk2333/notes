---
title: 关于 ColorOS 默认软件包安装程序与解除其锁定
published: 2025-10-01
tags: [Android, ColorOS, adb]
category: app::android
description: 修复 ColorOS 锁定默认软件包安装程序, 无法切换为其他软件包安装程序
---

## 原由
近些日子我购入了 OnePlus Ace 5 Ultra, 并进行了 Root 环境配置

当我尝试使用第三方软件包安装程序时, 第三方的锁定为默认安装器功能无效, 会被立刻重置, 我尝试使用 Thanox 的 `pm disable` 冻结方案禁用了系统的软件包安装程序, 造成系统卡开机动画无限重启

在经历了无数次尝试~~与数据丢失~~后, 我找到了这期视频
[一加用户还有colorOs用户用不了installerX应用替换安装器和爱玩机应用安装器的解决方法如下，操作非常简单 省流:后面才是重点_哔哩哔哩_bilibili'](https://www.bilibili.com/video/BV1p7MUzyE7v/)
并在类似评论区找到了卡开开机动画的原因:
![reason-of-auto-reboot](./images/color-os-fix-package-installer/reason-of-auto-reboot.png)

故记录了本文章, 以便大家~~与未来的我~~参阅

## 解决方法
对于 ColorOS, 禁止以 `pm disable-user` / `pm disable` 的方式禁用系统软件 (特别是软件包安装程序), 要解除默认软件包安装程序的锁定, 请下载选择对应 Android 版本的 `兼容性测试套件 (CTS)`, 并安装 [`CrossProfileTestApp.apk` (大陆应该可以直连)](https://source.android.google.cn/docs/compatibility/cts/downloads), 打开并单击应用内的 `Open Settings` 按钮后, 你的第三方安装器锁定为默认应该就可以工作了

> [!IMPORTANT]
> 在评论区的一些用户反馈安装该软件后会导致系统设置内的部分界面回(退)到 Android 类原生样式或发生错位等问题, 请自行酌情考量, 或在尝试后卸载并清除副作用

要卸载并清除副作用, 请卸载该软件即可 (若无效, 请在卸载后重启系统)

## 故障排除
如果您已经发生了 系统卡开机动画无限重启, 请尝试在开机动画时快速三击 音量+ 按键, 进入安全模式后重启

貌似进入安全模式会重置和修复一部分的系统软件及其权限, 这就是为什么能够修好系统

---
最后, 感谢 Google 的大手要求安卓合规必须要过 [CTS](https://source.android.com/docs/compatibility/cts)
