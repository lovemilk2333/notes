# 修复在 Linux 上解压含有非 ASCII 字符的 Windows 压缩的压缩包乱码

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
