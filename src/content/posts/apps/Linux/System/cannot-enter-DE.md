---
title: 修复 Linux 无法进入 DE 问题
published: 2025-10-19
tags: [Linux, NVIDIA, GPU]
category: app::linux::system
---

在我尝试按照 [archlinux 显卡驱动 | archlinux 简明指南](https://arch.icekylin.online/guide/rookie/graphic-driver.html#%E5%8F%8C%E6%98%BE%E5%8D%A1-%E9%9B%86%E6%98%BE-%E7%8B%AC%E6%98%BE) 安装 *optimus* 后, 无法进入 KDE 主界面, *plasmashell* coredump

## 前言
经过一些列 debug, 最终我还是尝试使用 *timeshift* 回滚系统. 之后, 由于我没有第一时间找到是 *optimus* 的问题, 我仍然安装了它, 但是发现复现的上述问题, 便尝试卸载它

## 解决方法
卸载 *optimus*

0. 使用 `yay -Qo` 查找到 *optimus* 的实际包名

> [!IMPORTANT]
> 这是个小坑, AUR 的 *optimus-manager-git* 安装生成的包名不是 *optimus-manager-git*, 而是类似于 `optimus-manager.python-xxxx` 什么的, 导致我没有成功卸载卡了好久

```sh
yay -Qo /etc/modprobe.d/optimus-manager.conf
```

1. 清除 Xorg 配置文件
```sh
sudo optimus-manager --cleanu
```

2. 卸载 *optimus*
```sh
yay -R optimus-manager-qt <real-package-name-of-optimus-manager>
```

3. 重新生成 initfs
```sh
sudo mkinitcpio -P
```

4. 重启
```sh
sudo reboot
```
