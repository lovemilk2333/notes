---
title: 修复 Krkr 游戏引擎全 CG 存档导致游戏分辨率异常的问题
published: 2026-04-26
tags: [krkr, galgame]
category: app::galgame
---

起因是我在玩 *創作彼女の恋愛公式* 并加载全 CG 存档时, 上游提供的存档存在问题, 使用该存档会导致游戏画面分辨率不对

我尝试了多种方案, 最终决定查看存档存储数据以排查是否是存档的问题

## 解决方法
对于 Krkr 引擎制作的游戏, 部分存档会被加密, 可以使用 [KirikiriTools](https://github.com/arcusmaximus/KirikiriTools) 解密

1. 下载 [Release](https://github.com/arcusmaximus/KirikiriTools/releases/latest) 中的 `KirikiriDescrambler.exe`
2. 在游戏存档同目录打开终端 (Windows 用户可以在 Explorer 地址栏直接输入 `cmd` 或 `powershell`)
3. 在弹出的终端中运行如下指令
    ```bat
    .\KirikiriDescrambler.exe <save>
    ```
    > 其中, `save` 是存档路径, 例如
    ```bat
    .\KirikiriDescrambler.exe sousakukanojosu.ksd
    ```
    > [!WARNING]
    > 该操作会直接覆写存档文件, 请注意备份
4. 然后, 会发现存档文件已经变成了纯文本明文了. 该文本格式为 `.ks` / `.tjs`, 类似于 JavaScript[^js-!=-java] 脚本语言. 在本游戏的存档中, 意外存储了 `"storeWindowWidth" => 1552` 与 `"storeWindowHeight" => 902`, 导致渲染的内容区域分辨率被定死了
5. 解决其实很简单, 只要直接删除这两行就可以了 (注意保证语法正确)
    > 大部分的 Krkr 引擎游戏会自己识别存档格式为加密存档还是纯文本存档, 直接将纯文本文档放入游戏存档位置即可自动识别
6. 然后, 启动游戏就会把修改后的存档重新加密为加密存档格式. 你可以分享这个存档给需要的人

> BTW, *創作彼女の恋愛公式* 要求必须要打完一次其他全部女主的线至少一次才可以选择女一, 如果想绕过这个限制, 可以先加载全 CG 存档选择女一后保存到其他槽位, 然后替换回原来存档并加载这个槽位绕过

[^js-!=-java]: 注意: JavaScript 与 Java 截然不同
