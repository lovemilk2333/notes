# 修复 Docker 网桥无法正常工作

运行如下命令, 讲网桥的流量绕过 `iptables`
```sh
sudo sysctl -w net.bridge.bridge-nf-call-iptables=0
```

重启容器后发现 Docker 流量正常
