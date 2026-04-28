---
title: 在 Wifi Stick (随身 WIFI 棒子) 上配置 USB 网络共享 (RNDIS)
published: 2026-04-14
tags: [Linux, Debian, RNDIS, USB]
category: deployment::WifiStick
---

本文主要介绍如何在随身 WIFI 棒子上配置 USB 网络共享 (RNDIS), 以便 Windows 可以自动识别

由于我所使用的 [OpenStick](https://www.kancloud.cn/handsomehacker/openstick) 项目默认已经配置了适用于 *nux 的 USB 网络共享脚本, 需要直接修改该脚本, 否则 USB 接口会被占用导致无法修改

## 配置 RNDIS

1. 修改如下脚本

> 该脚本由 Systemd Unit `mobian-usb-gadget.service` 自动调起
```path
/usr/sbin/mobian-usb-gadget
```

在 `setup()` 函数中, 在 `# Setting Up Adbd` 前添加如下命令, 便于 Windows 识别为 RNDIS 设备
```sh
# 复合设备是为了 ADB 也可以连接
echo 0xEF > $CONFIGFS/bDeviceClass
echo 0x02 > $CONFIGFS/bDeviceSubClass
echo 0x01 > $CONFIGFS/bDeviceProtocol
```

并在上方命令后方添加如下代码块中任意其一
- 1. 如下为 Google 的 RNDIS 设备生产商和产品 ID, 兼容性最好
    ```sh
    echo 0x18d1 > $CONFIGFS/idVendor
    echo 0x4ee4 > $CONFIGFS/idProduct
    ```

    2. 如下为 Microsoft 的 RNDIS 设备生产商和产品 ID, 兼容性其次
    ```sh
    echo 0x045E > $CONFIGFS/idVendor
    echo 0x0301 > $CONFIGFS/idProduct
    ```

    3. 如下为 Linux 的 RNDIS 设备生产商和产品 ID, 可能存在兼容性问题
    ```sh
    echo 0x1d6b > $CONFIGFS/idVendor
    echo 0x0104 > $CONFIGFS/idProduct
    ```


2. 编辑如下 NetworkManager 配置脚本

> 该脚本由 Systemd Unit `mobian-setup-usb-network.service` 自动调起
```sh
/usr/sbin/mobian-setup-usb-network
```

将下面的 IP 和网段改为你要的
```sh
nmcli connection add con-name USB \
                        ifname usb0 \
                        type ethernet \
                        ip4 10.22.33.1/24
```

并在 `if` 的最后添加如下命令设置 USB 接口 IP, 注意网段与上方配置一致
```sh
sleep 1
ip link set usb0 up
ip addr add 10.22.33.1/24 dev usb0 2>/dev/null
```

3. 禁用 NetworkManager USB 接口的配置
```sh
sudo mv /etc/NetworkManager/system-connections/USB.nmconnection /etc/NetworkManager/system-connections/USB.nmconnection.bak
```
> [!NOTE]
> 若 NetworkManager 配置文件禁用了对 USB 接口的管理, 会使得配置无效  
> 请检查如下文件
> ```path
> /etc/NetworkManager/NetworkManager.conf
> ```
> 是否含有如下内容 (若有请删除)
> ```ini
> unmanaged-devices=interface-name:usb0
> ```

4. a 连接 Windows 设备

此时将 Wifi Stick 插入 Windows 设备的 USB 接口, 应该可以在 Windows 侧看到一个驱动未安装 (代码: 28) 的 RNDIS 设备 (位于 *其他设备* 类别)

双击该设备, 单击 "更新驱动程序" > "浏览我的电脑以查找驱动程序" > "让我从计算机的可用驱动程序列表中选取" > 在 "常见硬件类型" 内选择 "网络适配器" > 厂商选择 "Microsoft", 型号选择最下面的 "远程 NDIS 兼容设备" (Windows 7 操作系统厂商选择 "Microsoft Corporation", 型号选择 "Remote NDIS Compatible Device") > "下一页" > "是" (强制安装驱动程序)

此时, 可以看到 Windows 弹出一个新的网络连接, 也新增了一个网络适配器, 并获取到了 IP 地址
> 如果无法获取 IP 地址, 请尝试在 Wifi Stick 安装 Dnsmasq (不需要手动启用服务, 会由 NetworkManager 调起), 使用
> ```sh
> sudo apt install dnsmasq
> ```

如此, 便配置成功了. 您可以使用 `10.22.33.1:<port>` 访问任意部署于 Wifi Stick 的服务了

如果在 Windows 设备上无法安装驱动程序, 或在安装驱动程序后显示该设备需要进一步安装驱动程序, 请参阅 [故障排除 - 部分高版本-windows-10-操作系统无法安装-rndis-驱动并连接](#部分高版本-windows-10-操作系统无法安装-rndis-驱动并连接)

4. b 连接 *nux 设备

对于 Linux 和 macOS 等 *nux 操作系统, 请将 Wifi Stick 插入 USB 接口, 后列出网卡及其 IP 地址
> 如下命令可能仅适用于现代 Linux 操作系统, macOS 请自行查找解决方法 ~~其实是我没钱买 mac~~

```sh
ip a
```

应该可以看到类似如下的设备
```log
6: enp0s20f0u8: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UNKNOWN group default qlen 1000
    link/ether 22:39:e2:ef:40:d0 brd ff:ff:ff:ff:ff:ff
    altname enx2239e2ef40d0
```

> 下文的 `enp0s20f0u8` 均指代网卡名称

激活连接: 对于 NetworkManger 用户, 可以运行类似
```sh
nmcli device connect enp0s20f0u8
```
> 上述命令会将当前的激活网卡切换为该网卡, 导致当前以太网连接中断  
> 要同时连接两(多)个以太网卡, 请使用
> ```sh
> nmcli connection add type ethernet con-name wifi-stick ifname enp0s20f0u8 ipv4.route-metric 200 && nmcli connection up wifi-stick
> ```

最后, 再次使用列出网卡及其 IP 地址的命令, 应该已经可以获取到 IP (你设置的 `10.22.33.0/24`) 地址了
```sh
> ip a

6: enp0s20f0u8: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1400 qdisc fq_codel state UNKNOWN group default qlen 1000
    link/ether 22:39:e2:ef:40:d0 brd ff:ff:ff:ff:ff:ff
    altname enx2239e2ef40d0
    inet 10.22.33.91/24 brd 10.22.33.255 scope global dynamic noprefixroute enp0s20f0u8
       valid_lft 3538sec preferred_lft 3538sec
    inet6 fe80::c29d:e98d:c3cc:6067/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
```

## [可选] 配置 Dnsmasq
为了避免需要记忆 Wifi Stick IP, 可以修改 Dnsmasq 的配置进行 Hosts, 从而使用例如 `stick.local` 访问 Wifi Stick 的服务

1. 创建配置文件
```sh
sudo mkdir -p /etc/NetworkManager/dnsmasq.d/
```

后, 可以在该文件夹下写入配置. 例如, 要将 `stick.local` Hosts 到 `10.22.33.1`, 可以在
```path
/etc/NetworkManager/dnsmasq.d/stick-hosts.conf
```
写入
```ini
address=/stick.lan/10.22.33.1
address=/stick.local/10.22.33.1

# 同时也可以指定 `stick.local` 不转发到上游 DNS 服务器
# local=/stick.lan/
# local=/stick.local/
```

要绑定 MAC 地址
```ini
dhcp-host=<mac-address>,<ip-address>,<rent>

# 例如: dhcp-host=AA:BB:CC:DD:EE:FF,10.22.33.100,8h
```

设置上游 DNS
```ini
# Google Public DNS
server=8.8.8.8

# ignore `/etc/resolv.conf`
no-resolv
```

> 部分 NetworkManager 时会使用内部的 internal DHCP/DNS 处理器, 因此需要在
> ```path
> /etc/NetworkManager/NetworkManager.conf
> ```
> 写入
> ```ini
> [main]
> dns=dnsmasq
> ```
> 方可生效 (记得重启 NetworkManager)

2. 重启 NetworkManager
**上述命令须在重启 NetworkManager 后生效**
```sh
sudo systemctl restart NetworkManager
```

## 故障排除
### Wifi Stick 连接 WIFI 后速率过慢
由于 Wifi Stick 仅支持 2.4 Ghz 的 WIFI, 且功率不大, 请尝试关闭周围的蓝牙设备

### Emmc 写入过慢
尝试查看当前闪存调度器
```sh
cat /sys/block/mmcblk0/queue/scheduler
```
```log
[mq-deadline] kyber none
```

可以尝试切换到 `kyber`, 这或许可以小幅提升性能
```sh
echo none > /sys/block/mmcblk0/queue/scheduler
```

使用 dd 测试
```sh
dd if=/dev/zero of=./testfile bs=1M count=100 conv=fdatasync
```

在使用 `mq-deadline` 时, 写入速度为 `7.9 MB/s`, `none` 为 `8.5 MB/s`, `kyber` 为 `8.2 MB/s`

如果要永久应用一个调度器, 请写入 UDev 规则
```path
/etc/udev/rules.d/60-mmc-scheduler.rules
```
写入
```ini
# ACTION=="add|change", KERNEL=="mmcblk0", ATTR{queue/scheduler}="<调度器>"
ACTION=="add|change", KERNEL=="mmcblk0", ATTR{queue/scheduler}="kyber"
```

## 网速测试
使用 iperf3 单线程测试, 可以跑道 100 Mbps 左右

```log
C:\Users\->iperf3 -c 10.22.33.1 -P 1 -R
Connecting to host 10.22.33.1, port 5201
Reverse mode, remote host 10.22.33.1 is sending
[  5] local 10.22.33.136 port 10873 connected to 10.22.33.1 port 5201
[ ID] Interval           Transfer     Bitrate
[  5]   0.00-1.00   sec  10.0 MBytes  83.7 Mbits/sec
[  5]   1.00-2.00   sec  10.9 MBytes  91.2 Mbits/sec
[  5]   2.00-3.00   sec  10.9 MBytes  91.2 Mbits/sec
[  5]   3.00-4.00   sec  10.9 MBytes  91.2 Mbits/sec
[  5]   4.00-5.00   sec  10.9 MBytes  91.2 Mbits/sec
[  5]   5.00-6.00   sec  11.0 MBytes  92.3 Mbits/sec
[  5]   6.00-7.00   sec  10.9 MBytes  91.2 Mbits/sec
[  5]   7.00-8.00   sec  10.9 MBytes  91.2 Mbits/sec
[  5]   8.00-9.00   sec  11.0 MBytes  92.3 Mbits/sec
[  5]   9.00-10.00  sec  10.8 MBytes  90.2 Mbits/sec
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-10.00  sec   109 MBytes  91.1 Mbits/sec    0            sender
[  5]   0.00-10.00  sec   108 MBytes  90.6 Mbits/sec                  receiver

iperf Done.
```

## BTW, 清理磁盘 (emmc) 空间
```sh
# 删除孤立依赖包
sudo apt autoremove

# 删除孤立依赖包及其配置文件
# sudo apt autoremove --purge

# 删除 apt 包缓存 (不包括当前版本的包)
sudo apt autoclean

# 删除未使用依赖
# 需要先安装 `deborphan`
# sudo apt install deborphan
sudo apt purge $(deborphan)

# 限制日志只保留最近 2 天的内容
sudo journalctl --vacuum-time=2d
# 限制日志占用空间不大于 100M
sudo journalctl --vacuum-size=100M
```

> `libconfig9` 库是 USB 网桥必要的, 若不小心删除可以重新安装
> ```sh
> sudo apt install libconfig9
> ```

清除 Ruby 残留
```sh
sudo apt remove ruby ruby-minitest ruby-net-telnet ruby-power-assert ruby-test-unit ruby-xmlrpc ruby2.7-doc rubygems-integration
sudo rm -rf /usr/share/ri
```

清除不需要的语言
```sh
sudo apt install localepurge
sudo localepurge
```

## 故障排除
### 部分高版本 Windows 10 操作系统无法安装 RNDIS 驱动并连接
在部分高版本 Windows 10 操作系统中, 即使手动选择了 RNDIS 设备也仍可能显示未安装驱动 (代码 28, 事件文件可下载 [rndis-dirver-error.evtx](/static/rndis-dirver-error.evtx) 并在 Windows 事件查看器中查看)

一个可能的解决方法是禁用复合设备, 修改为仅 RNDIS 网络传输设备

修改如下脚本
```path
/usr/sbin/mobian-usb-gadget
```

在 `setup()` 函数中, 在 `# Setting Up Adbd` 修改之前使用设备类型 ID
```sh
# 将其改为单功能网络设备类
echo 0x02 > $CONFIGFS/bDeviceClass
echo 0x00 > $CONFIGFS/bDeviceSubClass
echo 0x00 > $CONFIGFS/bDeviceProtocol
```

(必要时也将 RNDIS 设备生产商和产品 ID 修改为 Microsoft 的)
```sh
echo 0x045E > $CONFIGFS/idVendor
echo 0x0301 > $CONFIGFS/idProduct
```

然后注释或删除下方启动 `adbd` 的脚本部分, 将下面几行注释
```sh
# Setting Up Adbd
gc -a ffs
mkdir -p /dev/usb-ffs/adb

# in offical version of gc name will be ffs.x
mount -t functionfs adb /dev/usb-ffs/adb

# Fire Up Adbd
adbd -D &
# (hack) wait adbd setup
sleep 1
```

然后尝试重启服务 `mobian-usb-gadget.service` 或重启设备

```sh
sudo systemctl restart mobian-usb-gadget.service
# or
# sudo reboot
```

**如果仍旧不可以, 请尝试将如下脚本替换原有脚本**
> Thanks for ChatGPT 5.3

```sh
sudo mv /usr/sbin/mobian-usb-gadget /usr/sbin/mobian-usb-gadget.bak
sudo vim /usr/sbin/mobian-usb-gadget
sudo chmod +x /usr/sbin/mobian-usb-gadget
```

```sh
#!/bin/sh

CONFIGFS=/sys/kernel/config/usb_gadget/g1

setup() {
    echo "[+] Setting up RNDIS gadget..."

    modprobe libcomposite

    # 清理旧配置
    if [ -d $CONFIGFS ]; then
        echo "" > $CONFIGFS/UDC 2>/dev/null
        rm -rf $CONFIGFS
    fi

    mkdir -p $CONFIGFS
    cd $CONFIGFS || exit 1

    # ===== 基本设备信息 =====
    echo 0x1d6b > idVendor        # Linux Foundation
    echo 0x0104 > idProduct       # Multifunction Gadget

    echo 0xEF > bDeviceClass
    echo 0x02 > bDeviceSubClass
    echo 0x01 > bDeviceProtocol

    mkdir -p strings/0x409
    echo "1234567890" > strings/0x409/serialnumber
    echo "Armbian" > strings/0x409/manufacturer
    echo "RNDIS Ethernet" > strings/0x409/product

    # ===== 配置 =====
    mkdir -p configs/c.1
    mkdir -p configs/c.1/strings/0x409
    echo "RNDIS" > configs/c.1/strings/0x409/configuration
    echo 120 > configs/c.1/MaxPower

    # ===== RNDIS =====
    mkdir -p functions/rndis.usb0

    # MAC 地址 (请修改)
    echo "02:XX:XX:XX:XX:XX" > functions/rndis.usb0/dev_addr
    echo "02:XX:XX:XX:XX:XX" > functions/rndis.usb0/host_addr
    # echo "02:AA:BB:CC:DD:01" > functions/rndis.usb0/dev_addr
    # echo "02:AA:BB:CC:DD:02" > functions/rndis.usb0/host_addr

    # ===== Windows 关键：OS Descriptor =====
    mkdir -p os_desc
    echo 1 > os_desc/use
    echo 0xcd > os_desc/b_vendor_code
    echo MSFT100 > os_desc/qw_sign

    mkdir -p functions/rndis.usb0/os_desc/interface.rndis
    echo RNDIS > functions/rndis.usb0/os_desc/interface.rndis/compatible_id
    echo 5162001 > functions/rndis.usb0/os_desc/interface.rndis/sub_compatible_id

    # ===== 绑定 =====
    ln -s functions/rndis.usb0 configs/c.1/
    ln -s configs/c.1 os_desc

    # ===== 启动 =====
    UDC=$(ls /sys/class/udc | head -n 1)
    echo $UDC > UDC

    echo "[+] RNDIS gadget started"
}

reset() {
    echo "[+] Removing USB gadget..."

    if [ -d $CONFIGFS ]; then
        echo "" > $CONFIGFS/UDC 2>/dev/null
        rm -rf $CONFIGFS
    fi
}

case "$1" in
    setup) setup ;;
    reset) reset ;;
    *) echo "Usage: $0 {setup|reset}" ;;
esac
```
