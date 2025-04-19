# 修复 MangoHud 在 Intel CPU 上功率始终为 0.0 W
> <https://github.com/ChimeraOS/chimeraos/issues/622>

运行如下指令修改权限即可
```sh
sudo chmod 444 /sys/class/powercap/intel-rapl:0/energy_uj
```
