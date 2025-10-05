---
title: 在 ArchLinux 上使用 Gwenview 打开 HEIF 图片
published: 2025-10-05
tags: [Linux, UI, GUI, DE, KDE, photo]
category: app::linux::KDE
---

高效率图像文件格式（英语：High Efficiency Image File Format， HEIF，也称高效图像文件格式[1]），是一个用于单张图像或图像序列的文件格式。它由动态影像专家小组（MPEG）开发，并在MPEG-H Part 12（ISO/IEC 23008-12）中定义。[^wikipedia]

## 安装所需依赖
<https://bugs.archlinux.org/task/74754>  
打开 HEIF 图片需要 `kimageformats` 及其依赖 `libheif`

```sh
sudo pacman -S kimageformats libheif
```

---
[^wikipedia]: <https://zh.wikipedia.org/zh-cn/HEIF>
