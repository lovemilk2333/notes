# 修复 Linux Steam wine 兼容层 `compatdata` 文件夹问题

## 描述
因部分游戏仅原生支持 Windows 操作系统, 所以 Steam 需要使用 Wine 兼容层在 Linux 上运行 PE (`.exe`) 可执行文件, `compatdata` 文件夹 (位于 `SteamLibrary/steamapps`) 是 Wine 所需的文件  
又因 `compatdata` 文件夹中存在 NTFS (Windows 的文件系统) 难以或不可识读字符, 若该文件夹位于 NTFS 上, 会造成文件系统意外损坏

## 修复
使用 软链接 链接 `compatdata` 文件夹至非 NTFS 文件系统
```sh
ln -s <将文件夹迁移后的文件夹绝对路径> <`compatdata` 原来位置>
```
