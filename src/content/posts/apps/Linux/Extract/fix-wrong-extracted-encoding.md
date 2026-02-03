---
title: 修复在 Linux 上解压含有非 ASCII 字符的 Windows 压缩的压缩包乱码
published: 2025-09-10
tags: [Linux, extract, compress]
category: app::linux::extract
---

## 使用 unzip 的 `-I` / `-O` 指定编码 (推荐)
```sh
# -O CHARSET  specify a character encoding for DOS, Windows and OS/2 archives
# -I CHARSET  specify a character encoding for UNIX and other archives

# CP936 is GBK or GB18030

unzip -O CP936 /path/to/compressed.zip -d /path/to/extracted
```

如果您的 unzip 不支持 `-I` / `-O` 参数指定编码, 可以使用更为强大的 unar 工具
```sh
unar -e GBK /path/to/compressed.zip -o /path/to/extracted
```

## 使用 `convmv` 修复解压出来的文件夹乱码
1. 安装
```sh
sudo pacman -S convmv
```

2. 修复 \
`/path/to/extracted` 即为解压出来的文件夹
```sh
convmv -f GBK -t UTF-8 --notest -r /path/to/extracted
```
