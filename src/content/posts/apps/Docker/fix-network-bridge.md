---
title: 修复 (主要在 OpenWRT 上) Docker 网桥无法正常工作
published: 2025-09-10
tags: [Docker, k8s, container]
category: app::docker
---

运行如下命令, 将网桥的流量绕过 `iptables`
```sh
sudo sysctl -w net.bridge.bridge-nf-call-iptables=0
```

重启容器后发现 Docker 流量正常
