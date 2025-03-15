# 修复 VirtualBox 增强功能的 screen size 无法自动适配窗口的问题

> 原帖
> <https://forums.virtualbox.org/viewtopic.php?p=534679&sid=cf95f15e93ae6e2364239202e1661628#p534679>

## 解决
尝试结束 `VBoxService` 进程, 然后在命令行中运行 `VBoxService -f` 后, 即可解决, 重启也不会出现上述问题
