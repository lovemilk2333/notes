# 修复 MangoHud 在 Intel CPU 上功率始终为 0.0 W
> <https://www.reddit.com/r/linux_gaming/comments/13g4qpz/comment/jlxda0x>

运行如下指令修改权限即可
```sh
sudo chmod o+r /sys/class/powercap/intel-rapl\:0/energy_uj
```
