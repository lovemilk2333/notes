# 修复 Minecraft 无法在 Linux 上启动的部分原因
> 转载自 [Minecraft 整合包《自然之旅3》在 Linux 上无法运行的解决方式 | SourLemonJuice-blog](https://sourlemonjuice.github.io/SourLemonJuice-blog/posts2/2024/09/mc-nature-journey-3) / [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## 修复
1. 禁用模组 `ContingameIME` (Minecraft 原版用户请忽略), 该模组使用了 Windows API, 使得其无法在 Linux / macOS 上运行
2. 对于使用 `pipewire` 作为音频处理总服务 或发现 由 `libopenal.so` 引起无法正常启动 Minecraft 的用户, 须要在运行时配置环境变量 `ALSOFT_DRIVERS=pulse` 并确保 JVM 可以正确识读该环境变量
