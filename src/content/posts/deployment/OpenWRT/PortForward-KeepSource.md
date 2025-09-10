---
title: OpenWRT 端口转发时保留源端口 (感谢 ChatGPT)
published: 2025-09-10
tags: [OpenWRT]
category: deployment::openwrt
---

## 手动编辑
如果你在使用 OpenWrt 进行端口转发时, 内部服务器只看到路由器的 LAN IP 地址（例如 192.168.1.1）, 这意味着 SNAT（源地址转换）仍在进行. 要保留客户端的源 IP 地址, 可以尝试以下方法直接在 LuCI 面板上配置:
1. 端口转发
   - 转到 LuCI 面板 "防火墙" 页面, 点击"端口转发"选项卡, 以正常方式添加端口转发
2. 保留源 IP
   - 转到 LuCI 面板 "防火墙" 页面, 点击"自定义规则"选项卡 (或直接编辑 `/etc/firewall.user`)
   - 添加以下内容以确保源 IP 地址保留：

     ```sh
     # 允许从 WAN 进入的流量, 并保留源 IP
     iptables -t nat -A PREROUTING -p tcp --dport 外部端口 -j DNAT --to-destination 内部服务器 IP:内部端口
     iptables -t filter -A FORWARD -p tcp -d 内部服务器 IP --dport 内部端口 -m state --state NEW,ESTABLISHED,RELATED -j ACCEPT
     ```

     示例：

     ```sh
     iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 192.168.1.100:80
     iptables -t filter -A FORWARD -p tcp -d 192.168.1.100 --dport 80 -m state --state NEW,ESTABLISHED,RELATED -j ACCEPT
     ```
   - 后保存并重启防火墙即可, 命令行使用请 `/etc/init.d/firewall restart` 重启. (如果需要同时转发 TCP/UDP, 再添加并将其中的 `tcp` 改为 `udp` 即可)

## 命令行工具
参见 [lovemilk2333/openwrt-iptables-forward-adder](https://github.com/lovemilk2333/openwrt-iptables-forward-adder?tab=readme-ov-file)
