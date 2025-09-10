---
title: 修复 MangoHud 在 Intel CPU 上功率始终为 0.0 W
published: 2025-09-10
tags: [Linux, UI, GUI, MangoHud]
category: app::linux::mangohud
---

> <https://www.reddit.com/r/linux_gaming/comments/13g4qpz/comment/jlxda0x>

运行如下指令修改权限即可
```sh
sudo chmod o+r /sys/class/powercap/intel-rapl\:0/energy_uj
```

为免更新后权限恢复, 可在 `/etc/systemd/system` 中添加如下 `.service` System Unit 配置文件, 并 `enable`
```conf
[Service]
Type=oneshot
RemainAfterExit=true
# NOTE: root permission is required
User=root
Group=root
ExecStart=chmod o+r /sys/class/powercap/intel-rapl:0/energy_uj

[Install]
WantedBy=multi-user.target
```

enable 配置文件
```sh
systemctl enable --now <your-named>.service
```
