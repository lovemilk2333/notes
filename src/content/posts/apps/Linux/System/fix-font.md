---
title: 修复 Linux 下默认字体出现异常
published: 2025-09-10
tags: [Linux, font]
category: app::linux::system
copyright: {name: CC BY 4.0, url: https://creativecommons.org/licenses/by/4.0/}
---

> 转载自 [Linux 下配置默认 emoji 字体 | SourLemonJuice-blog](https://sourlemonjuice.github.io/posts/简体中文/2024/02/03/linux下配置默认emoji字体的方式) / [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## 描述
使用 KDE 桌面环境系统设置工具, 修改系统默认字体后, 部分软件无法生效

## 修复
1. 安装 `fontconfig` 软件包
2. 配置 `~/.config/fontconfig/fonts.conf` 文件 (若无请自行创建) 为如下内容, 被 `<family>` 与 `</family>` 包裹的内容为目标字体的匹配名称

    ### 配置概览
    `~/.config/fontconfig/fonts.conf`

    ```xml
    <?xml version="1.0"?>
    <!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
    <fontconfig>
        <alias>
        <family>sans-serif</family>
        <prefer>
            <family>HarmonyOS Sans SC</family>
            <family>HarmonyOS Sans TC</family>
        </prefer>
        </alias>
        <alias>
        <family>serif</family>
        <prefer>
            <family>HarmonyOS Sans SC</family>
            <family>HarmonyOS Sans TC</family>
        </prefer>
        </alias>
    </fontconfig>
    ```

修改完成后, 重启应用程序方可

## 可能用到的命令

```sh
# 刷新字体缓存
fc-cache -fv

# 匹配字体
fc-match <name>
```
