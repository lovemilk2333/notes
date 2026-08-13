---
title: Wifi Stick (随身 WIFI 棒子) 基础安装配置
published: 2026-08-13
tags: [Linux, Debian, RNDIS, USB, Caddy, ReversedProxy]
category: deployment::WifiStick
---

本文主要讲述如何安装 Wifi Stick, 并对 USB 网路共享 (RNDIS), 串口通讯, 本地文件服务器等进行配置

我所购买的 Wifi Stick 采用 高通骁龙 410 Soc

## 安装

由于 Wifi Stick 采用传统的 Android 引导方式, 我们可以直接使用 Fastboot 工具 ([下载 Platform-Tools](https://developer.android.google.cn/tools/releases/platform-tools)) 刷入系统镜像

### 进入 Fastboot

插入电脑 USB 接口 (若无法识别请使用主板 IO 侧接口, 而不是机箱前面板接口), 后立即长按 Wifi Stick 按钮不松

然后运行

```sh
fastboot devices
```

可以成功看到有 Fastboot 设备连接

> 对于 Windows 操作系统, 需要手动安装 Fastboot 驱动. 也可以直接使用图形化刷机工具 [刷机匣](https://www.bilibili.com/video/BV1HMpgzMEpM/)  
> 刷机匣需要使用 `-a` 版本, 该版本才有 _fastboot_ 选项卡

### See Also, 进入 9008

#### 1. 安装 EDL 工具

前往 <https://github.com/bkerler/edl> 并按照流程安装 EDL 工具, 或者使用 Arch AUR 软件包安装

```sh
paru -S edl
```

#### 2. 下载 骁龙 410 引导 ELF

进入 9008 模式需要向 Wifi Stick 发送引导才能识别, 引导文件可以在 [此处](/static/MSM8916.elf) 下载, 或者搜索 `MSM8916 9008 ELF` (骁龙 410 的产品代码) 并查找可信来源下载

#### 3. 进入 9008, 携带引导

长按 Wifi Stick 按钮不松, 然后插入电脑 USB 接口 (若无法识别请使用主板 IO 侧接口, 而不是机箱前面板接口)

要运行命令时, 请使用 `--loader` 参数提供引导文件的路径

```sh
sudo edl <command> --loader=MSM8916.elf
```

若不提供引导, 则会报错

```log
DeviceClass - [LIB]: Couldn't get device configuration.
```

如果出现错误日志, 请将 Wifi Stick 拔除并重试本步骤

### 刷机

#### 下载刷机包

为了保证各设备识别正常, 避免出现无法开机或设备识别异常的情况, 需要按照自己设备的主板型号下载刷机包

主板型号可以在主板上丝印看到, 已知的主板型号有:  
`ufi001b/c`, `sp970`, `uz801`, `UFI-16-V3`

(参见 <https://www.kancloud.cn/handsomehacker/openstick/2636505>)

#### 运行刷机脚本

刷入脚本本质上就是使用 `fastboot` 命令, 将对应分区的镜像文件刷入至对应分区

部分刷机包可能仅提供了 `.bat` 的 Windows 操作系统脚本, 可以使用 LLM 或者手动修改, `fastboot` 命令的语法是一样的

刷入完成后脚本会自动让 Wifi Stick 重启, 同时请注意脚本输入, 这里可能包含初始化信息, 如 Wifi Stick 默认热点名称及 IP 地址, root 默认密码等

### 连接 Wifi Stick SSH

不同固件的 Wifi Stick 连接方式各异, 但基本上就是连接 Wifi Stick 提供的热点或使用 RNDIS 作为 USB 网卡连接, 然后再 SSH 至其的 IP 地址

RNDIS 设备连接方式参见 [连接 RNDIS 设备](#连接-rndis-设备)

> [!TIP]
> 部分二改的刷机包可能没有修改脚本内说明的 IP 地址, 可以通过查看自动获取到的 IP 地址, 然后尝试连接该 IP 的常见网关地址 (`.1` 或 `.254`)
>
> 大部分固件默认启用了 USB 融合模式, 会同时提供一个 RNDIS 设备和一个 ADB 设备, 一般情况下可以直接使用 `adb shell`连接终端

## 初始配置

### 连接 WI-FI

为了安装软件包或进行其他操作, 我们须要使 Wifi Stick 接入互联网

在大部分固件的系统内, 默认使用 NetworkManager 作为网络管理器, 我们可以使用 `nmcli` 命令行工具连接 WI-FI

> 某些固件默认开启了 WI-FI 热点, 这会导致 WI-FI 设备被占用, 无法扫描现有 WI-FI (直接连接会覆盖配置不受影响, 如果你知道你的 WI-FI 名称就不需要管了). 要删除该配置, 请使用
>
> ```sh
> nmcli connection show
> ```
>
> ```log
> NAME   UUID                                  TYPE      DEVICE
> USB    2eed87e1-0ca6-4625-8b07-d80514fe1ef3  ethernet  usb0
> wifi   bb317ee5-d497-4f07-8815-7eac62e72b88  wifi      wlan0
> modem  bbf76fd3-010e-402e-a68c-135f893c828b  gsm       --
> ```
>
> 查看 `DEVICE` 为 `wlan*` 的项, 然后删除
>
> ```sh
> nmcli connection delete "wifi"
> ```

```sh
nmcli radio wifi on  # 开启 WI-FI
```

> 如下命令是可选的
>
> ```sh
> # 扫描 WI-FI
> nmcli device wifi rescan
> # 列出 WI-FI
> nmcli device wifi list
> ```

连接 WI-FI

```sh
nmcli device wifi connect "<SSID>" password "<PASSWORD>" [name "<NAME>"]
```

例如, 要连接名为 `test-wifi`, 密码为 `testtest` 的 WI-FI 并命名为 `default-wlan`, 请使用

```sh
nmcli device wifi connect "test-wifi" password "testtest" name "default-wlan"
```

然后可以使用如下命令查看连接情况

```sh
nmcli connection show
```

### 软件包换源

为了加速在中国大陆境内的软件下载速度, 推荐更换 APT 软件源

> [!NOTE]
> 下载速度过慢可以查看 [Wifi Stick 连接 WIFI 后速率过慢](#wifi-stick-连接-wifi-后速率过慢)

```sh
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak

sudo tee /etc/apt/sources.list <<-'EOF'
deb https://mirror.nju.edu.cn/debian/ bullseye main contrib non-free
deb https://mirror.nju.edu.cn/debian-security/ bullseye-security main contrib non-free
EOF

sudo apt update
```

### 配置 USB 接口模式

为了方便切换模式, 我们需要测试固件对于按钮的支持性

```sh
# 安装输入事件测试工具
sudo apt install evtest

# 启动, 并选择要测试的设备
sudo evtest --grab /dev/input/event0
```

> `/dev/input/event0` 是按钮的设备标识, 请按照实际情况修改
>
> 要列出全部的输入设备, 可以使用
>
> ```sh
> cat /proc/bus/input/devices | grep -E 'Name=|Handlers='
> ```
>
> 在默认情况下, 按钮被映射到了 `KEY_RESTART`, 导致按下会重启. `--grab` 选项用于独占按钮而不再将按钮事件分发到 kernel, 从而避免重启

若无输出变化, 那么可能是按钮的触发电平在设备树中存在配置问题, 对于 `ufi001c` 设备, 可以使用 [修复过的 boot.img](https://aka.lovemilk.top/github/notes/releases/tag/ufi001c-boot) 并直接刷入即可. 对于其他设备, 可以自行修改设备树并编译打包 (仅打包 boot.img 皆可). 要使用修复完成的 boot.img, 在固件正常刷入之后, **仅须覆盖刷写 boot 分区**, 不需要改变其他分区

> 感谢 [dezige131](https://github.com/dezige131) 对设备树修改与 boot.img 打包支持

接下来, 我们要配置 RNDIS 等不同 USB 接口用途, 为了方便调试, 我们可以安装 `iproute2` (也就是常见发行版内的 `ip` 命令)

```sh
sudo apt install iproute2
```

#### 禁用现有配置脚本

为了避免对 USB 接口的重复初始化和占用, 我们需要禁用现有的配置脚本服务

```sh
sudo systemctl disable --now mobian-usb-gadget.service
sudo systemctl disable --now mobian-setup-usb-network.service
```

#### 安装接口模式切换工具

1. 下载可执行文件

前往 [lovemilk2333/wifi-stick-usb-switcher | GitHub Releases](https://github.com/lovemilk2333/wifi-stick-usb-switcher/releases/latest) 下载对应 CPU 架构的可执行文件压缩包, 一般为 `cli-linux-arm64` (注意不要下成 `cli-linux-amd64`)

解压并将 `cli` 保存为 `/usr/local/bin/usb-switcher`

授予可执行权限
```sh
sudo chmod +x /usr/local/bin/usb-switcher
```


2. 配置启动脚本

> 来自 <https://github.com/lovemilk2333/wifi-stick-usb-switcher/raw/main/scripts/test.sh.example>

在
```path
/usr/local/lib/usb-switcher/start.sh
```
写入如下内容, 按需修改必要参数
> [!NOTE]
> 目前的实现需要保证至少提供 **2** 个 LED

```sh
#!/usr/bin/env bash

set -euo pipefail

/usr/local/bin/usb-switcher daemon --devnode /dev/input/event0 --led /sys/class/leds/blue\:wifi --led /sys/class/leds/red\:os --led /sys/class/leds/green\:internet --config-fs /sys/kernel/config/usb_gadget/g1 "$@"
```

授予可执行权限
```sh
sudo chmod +x /usr/local/lib/usb-switcher/start.sh
```


创建服务

```path
/etc/systemd/system/wifi-stick-usb-switcher.service
```

```ini
[Unit]
Description=wifi-stick-usb-switcher

[Service]
Type=fork
ExecStart=/usr/bin/bash /usr/local/lib/usb-switcher/start.sh

[Install]
WantedBy=multi-user.target
```

重载并启用服务
```sh
sudo systemctl daemon-reload
sudo systemctl enable --now wifi-stick-usb-switcher.service
```

#### 使用方法
在默认情况下 USB Gadget 为 RNDIS 模式, 按下按钮切换为 ADB 模式, 再次按钮轮回 RNDIS 模式 (目前只有 **2** 个模式)

在初始化时会依次亮起每个 LED, 首个传入的 LED 亮起为 RNDIS 模式, 第二个传入的 LED 亮起为 ADB 模式

在切换中的状态为对应模式 LED 闪烁, 切换成功为对应 LED 常亮

要获取更多参数, 请运行
```sh
/usr/local/bin/usb-switcher daemon --help
```

### [可选] 配置 Fileserver

为了将 Wifi Stick 作为一个不使用 USB 存储接口的 U 盘, 可以配置 Fileserver, 利用网路通讯传输文件

轻量的 Fileserver 可以选用 <https://github.com/sigoden/dufs> 或 <https://github.com/spcnvdr/go-fileserver>

若要使用较为完善的用户认证系统, 可以选择稍大的 <https://github.com/filebrowser/filebrowser> (但不支持匿名访问)

---

下文我们将以 dufs 为例, 配置

1. 专用的文件分享与上传文件夹, 用户与 dufs 服务
2. Caddy 反向代理, 并携带 internal TLS 以防止不受信电脑监听/中间人攻击
3. 非 80/443/8080 约定俗成端口号 以绕过部分网路防火墙

#### 创建文件分享与上传专用用户及其文件夹

1. 以特定 UID 创建用户

```sh
sudo useradd -u 3443 -m file
```

2. 创建文件夹并保留写入的 Group

```sh
sudo mkdir -p /www/files
sudo chown file:file -R /www/files
# 保留新建文件的 Group
sudo chmod g+s -R /www/files
sudo chmod 750 -R /www/files
```

#### 配置 dufs
1. 在 [sigoden/dufs | GiGitHub Releasest](https://github.com/sigoden/dufs/releases/latest) 下载对应架构的 ELF, 并解压至

```path
/usr/local/bin/dufs
```

2. 配置启动脚本

在
```path
/usr/local/lib/dufs/start.sh
```
写入如下内容, 按需修改必要参数 (默认端口 5000)
```sh
#!/usr/bin/env bash

set -euo pipefail

/usr/local/bin/dufs --bind 127.0.0.1 --hidden '.*' --allow-upload --allow-search --allow-hash /www/files
```

授予可执行权限
```sh
sudo chmod +x /usr/local/lib/dufs/start.sh
```

创建服务

```path
/etc/systemd/system/dufs.service
```

```ini
[Unit]
Description=dufs

[Service]
User=file
Group=file
Type=fork
ExecStart=/usr/bin/bash /usr/local/lib/dufs/start.sh

[Install]
WantedBy=multi-user.target
```

重载并启用服务
```sh
sudo systemctl daemon-reload
sudo systemctl enable --now dufs.service
```

#### 配置 Caddy

1. 安装 Caddy

> <https://caddyserver.com/docs/install>

```sh
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
sudo chmod o+r /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

> [!NOTE]
> 对于旧版 `apt`, 须要将如下命令的输出手动追加到
> ```path
> /etc/apt/sources.list
> ```
> 
> ```sh
> curl -1sLf > 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt'
> ```
> 
> 后运行
> ```sh
> sudo apt update
> sudo apt install caddy
> ```


2. 启用 Caddy 服务

```sh
sudo systemctl enable --now caddy.service
```

3. 修改 Caddyfile

```path
/etc/caddy/Caddyfile
```

```Caddyfile
{
    auto_https disable_redirects
}

# 80 与 3000 端口 HTTP
:80, :3000 {
    reverse_proxy 127.0.0.1:5000
}


# 443 与 3001 端口 HTTPS, 修改 `10.22.33.1` 为你的 IP
https://10.22.33.1:443, https://10.22.33.1:3001 {
    tls internal
    reverse_proxy 127.0.0.1:5000
}
```

4. 重载 Caddy 配置

```sh
sudo systemctl reload caddy.service
```

---

至此, 你的 Wifi Stick 就可以作为一个随身 U 盘使用了 :\)

## 其他配置 / See Also

### 连接 RNDIS 设备

#### 连接 Windows 设备

将 Wifi Stick 插入 Windows 设备的 USB 接口

此时, 部分固件可以直接被识别为 RNDIS 设备, 但若固件使用了融合接口, 使 Wifi Stick 同时提供了 RNDIS 设备和 ADB 设备, 需要手动配置设备类型

需要手动配置设备类型时, 应该可以在 Windows 侧看到一个驱动未安装 (代码: 28) 的 RNDIS 设备 (位于 _其他设备_ 类别)

双击该设备, 单击 "更新驱动程序" > "浏览我的电脑以查找驱动程序" > "让我从计算机的可用驱动程序列表中选取" > 在 "常见硬件类型" 内选择 "网路适配器" > 厂商选择 "Microsoft", 型号选择最下面的 "远程 NDIS 兼容设备" (Windows 7 操作系统厂商选择 "Microsoft Corporation", 型号选择 "Remote NDIS Compatible Device") > "下一页" > "是" (强制安装驱动程序)

此时, 可以看到 Windows 弹出一个新的网路连接, 也新增了一个网路适配器, 并获取到了 IP 地址

> 如果无法获取 IP 地址, 请尝试在 Wifi Stick 安装 Dnsmasq (不需要手动启用服务, 会由 NetworkManager 调起), 使用
>
> ```sh
> sudo apt install dnsmasq
> ```

如果在部分高版本 Windows 10 操作系统中, 即使手动选择了 RNDIS 设备也仍可能显示未安装驱动, 或在安装驱动程序后显示该设备需要进一步安装驱动程序, 请将融合设备修改为纯 RNDIS 设备, 参考 [配置 USB 接口模式](#配置-usb-接口模式)

一个可能的解决方法是禁用复合设备, 修改为仅 RNDIS 网路传输设备

### 连接 Linux/Unix 设备

对于 Linux 和 macOS 等 \*nux 操作系统, 请将 Wifi Stick 插入 USB 接口, 后列出网卡及其 IP 地址

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

激活连接: 对于 NetworkManger 用户, 可以运行如下命令, 以保证当前互联网连接不会被替换, 同时连接两(多)个以太网卡

```sh
export REGULAR_DEVNAME=<regular-device>
export WIFISTICK_DEVNAME=enp0s20f0u8
export WIFISTICK_CONNECTION=wifi-stick

# 在不存在时创建设备 `WIFISTICK_CONNECTION`
if ! nmcli connection show "$WIFISTICK_CONNECTION" >/dev/null 2>&1; then
    nmcli connection add type ethernet con-name "$WIFISTICK_CONNECTION" ifname "$WIFISTICK_DEVNAME"
fi

# 降低 `WIFISTICK_CONNECTION` 设备的优先级
nmcli connection modify "$WIFISTICK_CONNECTION" \
    ifname "$WIFISTICK_DEVNAME" \
    ipv4.route-metric 200 \
    ipv6.route-metric 200

# 设定当前互联网连接网卡设备至最高优先级
nmcli connection modify "$(nmcli -g GENERAL.CONNECTION device show "$REGULAR_DEVNAME")" ipv4.route-metric 0 ipv6.route-metric 0

# 启动 `WIFISTICK_CONNECTION`
nmcli connection up "$WIFISTICK_CONNECTION"
```

> `ipv4.route-metric` / `ipv6.route-metric` 是 IPv4 / IPv6 流量权重, 其值越小代表 NetworkManager 更乐意将网路流量使用该连接传输
>
> `regular-device` 为当前互联网连接网卡设备名, 或者也可以直接将 `$(nmcli -g GENERAL.CONNECTION device show "$REGULAR_DEVNAME")` 替换为实际连接名称, 如 `有线连接 1`

最后, 再次使用列出网卡及其 IP 地址的命令, 应该已经可以获取到 IP 地址了

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

### 清理磁盘 (emmc) 空间

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

> `libconfig9` 库是 USB 接口配置工具 `gc` 必要的, 若不小心删除可以重新安装
>
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
