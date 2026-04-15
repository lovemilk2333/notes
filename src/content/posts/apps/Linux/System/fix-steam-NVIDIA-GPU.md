---
title: 修复因 NVIDIA 缺 GPU 驱动造成的 核心转储
published: 2025-09-10
tags: [Linux, NVIDIA, Steam]
category: app::linux::system
---

## 问题

```log
/home/<username>/.local/share/Steam/steam.sh: 第 960 行： 5750 总线错误            （核心已转储）"$STEAMROOT/$STEAMEXEPATH" "$@"

❯ coredumpctl info 5750
           PID: 5750 (steam)
           UID: 1000 (<username>)
           GID: 1000 (<username>)
        Signal: 7 (BUS)
     Timestamp: Sat 2025-06-28 13:27:14 CST (6s ago)
  Command Line: /home/<username>/.local/share/Steam/ubuntu12_32/steam -srt-logger-opened
    Executable: /home/<username>/.local/share/Steam/ubuntu12_32/steam
 Control Group: /user.slice/user-1000.slice/user@1000.service/app.slice/app-org.kde.konsole@edc27db08dc24bbab>
          Unit: user@1000.service
     User Unit: app-org.kde.konsole@edc27db08dc24bbab66e0b79d60c4373.service
         Slice: user-1000.slice
     Owner UID: 1000 (<username>)
       Boot ID: e7949097facb424f80ecfcd6297d565b
    Machine ID: dd8e2d47052c44b58edbf084c4922872
      Hostname: ****
       Storage: /var/lib/systemd/coredump/core.steam.1000.e7949097facb424f80ecfcd6297d565b.5750.1751088434000>
  Size on Disk: 22.7M
       Message: Process 5750 (steam) of user 1000 dumped core.

                Stack trace of thread 5750:
                #0  0x00000000e936e3b0 n/a (libnvidia-gpucomp.so.575.64 + 0x2ba83b0)
                #1  0x00000000e69b94e4 n/a (libnvidia-gpucomp.so.575.64 + 0x1f34e4)
                #2  0x00000000e9a23f0a n/a (libnvidia-gpucomp.so.575.64 + 0x325df0a)
                ELF object binary architecture: Intel 80386
```

## 解决

安装 `lib32-nvidia-utils`

```sh
sudo pacman -S lib32-nvidia-utils
```
