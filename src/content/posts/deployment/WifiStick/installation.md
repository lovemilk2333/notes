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

该操作可能需要安装 ADB / Fastboot 驱动

### 进入 Fastboot

插入电脑 USB 接口 (若无法识别请使用主板 IO 侧接口, 而不是机箱前面板接口), 后立即长按 Wifi Stick 按钮不松

然后运行

```sh
fastboot devices
```

可以成功看到有 Fastboot 设备连接

> 对于 Windows 操作系统, 需要手动安装 Fastboot 驱动. 也可以直接使用图形化刷机工具 [刷机匣](https://www.bilibili.com/video/BV1HMpgzMEpM/)  
> 刷机匣需要使用 `-a` 版本, 该版本才有 *fastboot* 选项卡

若无法进入 Fastboot, 请参阅 [See Also, 可以进入管理后台但无法进入 Fastboot](#see-also-可以进入管理后台但无法进入-fastboot)

### See Also, 进入 9008

#### 1. 安装 EDL 工具

前往 <https://github.com/bkerler/edl> 并按照流程安装 EDL 工具, 或者使用 Arch AUR 软件包安装

```sh
paru -S edl
```

#### 2. 下载 骁龙 410 引导 ELF

进入 9008 模式需要向 Wifi Stick 发送引导才能识别, 引导文件可以在 [当前网站](/static/MSM8916.elf) / [GitHub Release](https://aka.lovemilk.top/github/notes/releases/tag/ufi001c-boot) 下载 **MSM8916.elf**, 或者搜索 `MSM8916 9008 ELF` (骁龙 410 的产品代码) 并查找可信来源下载

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

### See Also, 可以进入管理后台但无法进入 Fastboot

部分设备可能无法直接进入 Fastboot 模式, 我们可以通过 ADB 重启至 Fastboot 模式, 若已经在系统内开启了 ADB, 请跳转至 [3. 进入 Fastboot](#3-进入-fastboot)

#### 1. 提取或挂载 system 分区
对于已有全量备份的 `.bin` 文件的用户, 可以直接从备份中提取 `system.img`

> [!WARNING]
> 如下内容仅限 Linux 操作系统, 部分命令支持 Unix. 全部命令基本上不支持 Windows

`.bin` 文件是一个没有末尾 GPT 分区表备份的 GPT 原始二进制, 我们可以使用 GNU parted 或者其他可以获取分区表信息的工具获取 system 分区的 offset

例如, 我们可以使用如下命令获取 system 分区的起始位置

```sh
parted /path/to/example.bin unit s print
```
> 由于 `.bin` 文件没有末尾 GPT 分区表备份, parted 会在打开时显示 *出现文件结尾于读取* 或类似提示, 全部忽略即可
> 
> 显示类似 *错误: 备份 GPT 表损坏，但主表似乎是正确的，所以使用主表。* 选择确认

输出类似

```log
型号： (file)
磁盘 /path/to/example.bin：7471071s
扇区大小 (逻辑/物理)：512B/512B
分区表：gpt
磁盘标志：

编号  起始点    结束点    大小      文件系统  名称      标志
 1    131072s   262143s   131072s   fat16     modem     msftdata
 2    262144s   263167s   1024s               sbl1
 3    263168s   264191s   1024s               sbl1bak   msftdata
 4    264192s   266239s   2048s               aboot
 5    266240s   268287s   2048s               abootbak  msftdata
 6    268288s   269311s   1024s               rpm
 7    269312s   270335s   1024s               rpmbak    msftdata
 8    270336s   271359s   1024s               tz
 9    271360s   272383s   1024s               tzbak     msftdata
10    272384s   273407s   1024s               hyp
11    273408s   274431s   1024s               hypbak    msftdata
12    274432s   276479s   2048s               pad       msftdata
13    276480s   279551s   3072s               modemst1
14    279552s   282623s   3072s               modemst2
15    282624s   284671s   2048s               misc
16    284672s   284673s   2s                  fsc
17    284674s   284689s   16s                 ssd
18    284690s   305169s   20480s              splash
19    393216s   393279s   64s                 DDR
20    393280s   396351s   3072s               fsg
21    396352s   396383s   32s                 sec
22    396384s   429151s   32768s              boot
23    429152s   2067551s  1638400s  ext4      system    msftdata
24    2067552s  2133087s  65536s    ext4      persist   msftdata
25    2133088s  2395231s  262144s   ext4      cache     msftdata
26    2395232s  2427999s  32768s              recovery
27    2428000s  7471070s  5043071s  ext4      userdata  msftdata
```

找到名称为 `system` 的起始点 (例如 `429152s`) 和大小扇区个数 (例如 `1638400s`)

---

**若要挂载 system 分区, 可以使用如下命令**

对数字部分乘以扇区大小 (字节) 我们可以算出 $offset = 429152 \times 512 = 219725824$ 便是 system 分区位于该文件的起始地址 (字节)

```sh
sudo mount -o loop,offset=<offset> /path/to/example.bin /path/to/mount
```

例如

```sh
sudo mount -o loop,offset=219725824 example.bin ./system
```

---

**若要导出 system**

我们可以使用 dd 命令导出 system 分区

```sh
dd if=/path/to/example.bin of=system.img bs=<扇区大小 (字节)> skip=<起始地址 (扇区)> count=<大小 (扇区)> status=progress
```

例如

```sh
dd if=/path/to/example.bin of=system.img bs=512 skip=429152 count=1638400 status=progress
```

我们使用 file 对 `system.img` 进行查看, 输出应当为 Ext4 类型的文件系统镜像, 类似于

```log
system.img: Linux rev 1.0 ext4 filesystem data, UUID=<uuid>, volume name "system" (extents) (large files)
```

要挂载 `system.img`, 请使用

```sh
sudo mount -o loop system.img /path/to/mount
```

#### 2. 修改 `build.prop` 以开启 ADB

> 参考 <https://www.bilibili.com/video/BV1QV4y1y7yf/>

进入 system 分区的根目录 (例如已经挂载后的 `./system` 文件夹), 发现存在 `build.prop` 与 `build.prop.bakforspec` 文件, 一般而言修改这俩个文件即可, 若无法生效请使用 [fd](https://github.com/sharkdp/fd) 工具搜寻全部的 `build.prop*` 文件, 并全部覆盖

```sh
# 使用 fd
fd --glob "build.prop*" .
```

要启用 ADB, 请在需要修改的 `build.prop` 与 `build.prop.bakforspec` 中添加或修改如下行

```ini
# /build.prop

# Enable ADB
persist.service.adb.enable=1
persist.service.debuggable=1
persist.sys.usb.config=mtp,adb
```

> [!TIP]
> 如果要启用带有 root 权限的 ADB, 请再添加如下行
> ```ini
> # /build.prop
> 
> # Enable root for ADB
> ro.debuggable=1
> ```

其中, `persist.sys.usb.config` 行配置可在原内容最后添加 `,adb`

这些操作需要 root 权限, 是因为 system 分区在 Wifi Stick 上作为系统分区, 文件所有者/组均为 uid/gid 0 (root 用户/组). 这些操作不会破坏您的操作系统, 也不会导致您的操作系统稳定性受到影响

修改完成并确认保存后, 解除挂载分区. 解除挂载需要保证进程占用挂载点, 进程占用包括终端工作路径位于挂载点内

```sh
sudo umount ./system
```

#### 3. 刷入 system 分区镜像

[进入 9008](#see-also-进入-9008), 后使用 edl 或者其他刷写工具刷入 `system.img` 至 system 分区

edl 命令例如

```sh
sudo edl w system system.img --loader=MSM8916.elf
```

后直接插拔 Wifi Stick 将其重启至系统

### 3. 进入 Fastboot

将 Wifi Stick 连接并进入系统后, 使用 ADB 命令重启至 Fastboot

```sh
adb reboot bootloader
```

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
> 
> 若要使用 `adb shell` 连接终端, 强烈建议 `export TERM=xterm-256color` 以便运行 TUI 程序

## 初始配置

### Wifi Stick 使用基带 (蜂窝网络/移动数据)
参见 [Wifi Stick 修复基带驱动](#wifi-stick-修复基带驱动)

### 连接 WI-FI

为了安装软件包或进行其他操作, 我们须要使 Wifi Stick 接入互联网

由于我们需要对网路进行操作, 请使用 `adb shell` 连接 Wifi Stick 以免调整网路时 SSH 连接断开

在大部分固件的系统内, 默认使用 NetworkManager 作为网路管理器, 我们可以使用 `nmcli` 命令行工具连接 WI-FI

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

若无输出变化, 那么可能是按钮的触发电平在设备树中存在配置问题

对于 `ufi001c` 设备, 可以使用 *修复过的 boot.img*: **ufi001c-boot-devtree.img** ([当前网站](/static/ufi001c-boot-devtree.img) / [GitHub Release](https://aka.lovemilk.top/github/notes/releases/tag/ufi001c-boot) 并直接刷入即可

对于其他设备, 可以自行修改设备树并编译打包 (仅打包 boot.img 皆可). 要使用修复完成的 boot.img, 在固件正常刷入之后, **仅须覆盖刷写 boot 分区**, 不需要改变其他分区

> 感谢 敬爱的<pe>[dezige131](https://github.com/dezige131)</pe> 对设备树修改与 boot.img 打包支持

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

前往 [wifi-stick-usb-switcher | GitHub Releases](https://aka.lovemilk.top/github/wifi-stick-usb-switcher/releases/latest) 下载对应 CPU 架构的可执行文件压缩包, 一般为 `cli-linux-arm64` (注意不要下载 `cli-linux-amd64`)

解压并将 `cli` 保存为 `/usr/local/bin/usb-switcher`

授予可执行权限
```sh
sudo chmod +x /usr/local/bin/usb-switcher
```

安装依赖
```sh
sudo apt install dnsmasq udhcpc
```

2. 配置启动脚本

> 来自 <https://aka.lovemilk.top/github/wifi-stick-usb-switcher/raw/main/scripts/test.sh.example>

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

exec /usr/local/bin/usb-switcher daemon --devnode /dev/input/event0 --led /sys/class/leds/blue\:wifi --led /sys/class/leds/red\:os --led /sys/class/leds/green\:internet --config-fs /sys/kernel/config/usb_gadget/g1 "$@"
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
Type=simple
ExecStart=/usr/local/lib/usb-switcher/start.sh
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

重载并启用服务
```sh
sudo systemctl daemon-reload
sudo systemctl enable --now wifi-stick-usb-switcher.service
```

#### 使用方法
在默认情况下 USB Gadget 为 RNDIS 模式, 按下按钮切换为 ADB 模式, 再次按钮轮回 RNDIS 模式 (目前只有 **2** 个主要模式, 每个主要模式可能会有若干子模式)

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

为了避免没有网路连接导致 Caddy 不启动, 我们需要编辑 Caddy Service

```sh
sudo systemctl edit caddy.service
```

在上方注释下
```ini
### Editing /etc/systemd/system/caddy.service.d/override.conf
### Anything between here and the comment below will become the new contents of the file
```

写入

```ini
[Unit]
Requires=
After=
After=network.wants
```

以清空 `Requires` 并将 `After` 替换为 `network.wants`

重载并启动
```sh
sudo systemctl daemon-reload
sudo systemctl enable --now caddy.service
```

3. 修改 Caddyfile

```path
/etc/caddy/Caddyfile
```

```Caddyfile
{  # 全局配置
}


(internal_tls) {
    tls {
        issuer internal
        on_demand  # 按照 domain/IP 动态生成 TLS 证书
    }
}

# 80 与 3000 端口 HTTP
:80, :3000 {
    reverse_proxy 127.0.0.1:5000
}


# 443 与 3001 端口 HTTPS
:443, :3001 {
    import internal_tls
    reverse_proxy 127.0.0.1:5000
}
```

> [!WARNING]
> 动态生成 TLS 证书仅限受信任环境, 无校验情况下任意域名均可作为合法的 TLS 目标 Host
> 
> 要在非可信环境下动态生成 TLS 证书, 请配置 **TLS 签发名称质询服务**
> 
> ```Caddyfile
> {  # 全局配置
>   on_demand_tls {
>       ask <URL>
>   }
> }
> ```
> 
> Caddy 会请求 `<URI>?domain=<domain>`, 并在 API 返回非 200 时拒绝生成 TLS 证书
> 
> 完整实现与配置请参阅 [Caddy 动态 TLS 签发名称质询服务](#caddy-动态-tls-签发名称质询服务)

4. 重载 Caddy 配置

```sh
sudo systemctl reload caddy.service
```

---

至此, 你的 Wifi Stick 就可以作为一个随身 U 盘使用了 :\)


### [可选] 配置 Webshell

在一些情况下, 连接 Wifi Stick 的宿主机可能没有 SSH 套件, 或不能打开终端, 这会使得我们在一些时候难以连接至 Wifi Stick 修改配置或运行脚本

但在大部分情况下, 宿主机会有浏览器, 尤其是基于 Chromium 的浏览器, 所以我们可以配置 Webshell, 以便随时随地通过浏览器访问 Wifi Stick 命令行

#### 安装 ttyd

> ttyd is a simple command-line tool for sharing terminal over the web

```sh
sudo apt install ttyd
```

若 apt 无法安装 ttdy, 可以从 [tsl0922/ttyd | GitHub Releases](https://github.com/tsl0922/ttyd/releases/latest) 下载对应 CPU 架构的 ELF并保存至

```path
/usr/local/bin/ttyd
```

#### 配置 ttyd 服务

创建服务

为了保证我们可以作为用户正常登录, 并带有用户环境变量 (以便运行 `systemctl --user`), 我们需要使用 `login` 作为 ttyd 的目标启动程序

```path
/etc/systemd/system/ttyd.service
```

```ini
[Unit]
Description=ttyd

[Service]
Type=simple
WorkingDirectory=%h
# 若老旧设备无法渲染终端, 可添加 `-t rendererType=dom` 禁用 WebGL
ExecStart=/usr/bin/env ttyd -i 127.0.0.1 -p 7681 -w %h -W login


[Install]
WantedBy=multi-user.target
```

重载并启用服务
```sh
systemctl daemon-reload
systemctl enable --now ttyd.service
```

#### 配置 Caddy

```path
/etc/caddy/Caddyfile
```

按需求配置端口

```Caddyfile
# 端口号自行修改
:2222 {
    import internal_tls

    # HTTP Basic Auth 鉴权, 修改用户密码
    # 密码使用 `caddy hash-password` 生成
    # 如果想仅用户 Linux 鉴权可以不要
    basic_auth {
        # user:password
        user $2a$14$hCju96r6iSA552fkUUfWrO0tjC1w0otjkfHazbQLIHpXjoRB9vcoO
    }

    reverse_proxy 127.0.0.1:7681
}
```

重载 Caddy 配置

```sh
sudo systemctl reload caddy.service
```


## 其他配置 / See Also

### 连接 RNDIS 设备

#### 连接 Windows 设备

将 Wifi Stick 插入 Windows 设备的 USB 接口

部分固件可以直接被识别为 RNDIS 设备. 在未配置 USB 模式切换情况下, 若固件使用了融合接口, 使 Wifi Stick 同时提供了 RNDIS 设备和 ADB 设备,  应该可以在 Windows 侧看到一个驱动未安装 (代码: 28) 的 RNDIS 设备 (位于 *其他设备* 类别)

双击该设备, 单击 "更新驱动程序" > "浏览我的电脑以查找驱动程序" > "让我从计算机的可用驱动程序列表中选取" > 在 "常见硬件类型" 内选择 "网路适配器" > 厂商选择 "Microsoft", 型号选择最下面的 "远程 NDIS 兼容设备" (Windows 7 操作系统厂商选择 "Microsoft Corporation", 型号选择 "Remote NDIS Compatible Device") > "下一页" > "是" (强制安装驱动程序)

此时, 可以看到 Windows 弹出一个新的网路连接, 也新增了一个网路适配器, 并获取到了 IP 地址

若在强制指定驱动程序后电脑自动重启, 请参阅 [部分情况下在 Windows 上显示 RNDIS 设备但是代码 28](#部分情况下在-windows-上显示-rndis-设备但是代码-28) 解决问题

如果在部分高版本 Windows 10 操作系统中, 即使手动选择了 RNDIS 设备也仍可能显示未安装驱动, 或在安装驱动程序后显示该设备需要进一步安装驱动程序

一个可能的解决方法是禁用复合设备, 将融合设备修改为纯 RNDIS 设备, 参考 [配置 USB 接口模式](#配置-usb-接口模式) 修改为仅 RNDIS 网路传输

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

---

> [!NOTE]
> 若要使 Wifi Stick 可以使用主机网路作为出口, 请参阅 [配置 RNDIS 模式下, Wifi Stick 使用主机网路出口](#配置-rndis-模式下-wifi-stick-使用主机网路出口)


### 配置 RNDIS 模式下, Wifi Stick 使用主机网路出口

将 Wifi Stick 插入 Windows 设备的 USB 接口

#### Windows 配置
1. 打开当前网路出口的网卡连接
2. 右键网卡 > "属性"
3. 转到属性面板的 "共享" 选项卡
4. 勾选 "允许其他网路用户通过此计算机的 Internet 连接来连接"
5. 在 "家庭网路连接" 下拉菜单中, 选择你的 RNDIS 虚拟网卡, 并单击确定

此时 Windows 会将 RNDIS 虚拟网卡 IP 强制修改为 `192.168.137.1` 并将子网掩码修改为 `255.255.255.0`
> 或是 `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters` 指定的 `ScopeAddress` IP 与 `DhcpSubnetMask` 掩码 (`x.x.x.x` 格式的字符串 `REG_SZ`)

<!-- ### Linux 设备
TODO -->

---

由于 Wifi Stick 的 RNDIS 网卡 没有自动获取 IP, 且没有交由 NetworkManager 管理, Wifi Stick 无路由也无该网段的 IP 进行请求

解决方法是将 USB 接口模式切换器 更新至 `Commit: b54ade0e85d6724de892c9cc5e761c82a24df59d` 或更新版本 ([commit](https://aka.lovemilk.top/github/wifi-stick-usb-switcher/commit/b54ade0e85d6724de892c9cc5e761c82a24df59d) | [release](https://aka.lovemilk.top/github/wifi-stick-usb-switcher/releases/tag/rolling-b54ade0) ), 并在 RNDIS 模式下长按按钮进入子模式切换模式, 并短按按钮将 RNDIS 由 LED 常亮的 RNDIS 主模式切换为 LED 慢闪的 RNDIS 从模式

RNDIS 从模式会自动从 RNDIS 虚拟网卡的 DHCP 包中获取上游分配的 IP 段, 并自动配置 RNDIS 虚拟网卡的 IP 与路由表. 默认 IP 地址为对应网段 IP 最后段修改为 `.33`, 或 `--rndis-client-ip` 传入的 `x.x.x.x` 的后缀

例如传入的 `--rndis-client-ip` 为 `0.0.22.33`, 上游 IP 段为 `192.168.137.1/24`, 那么 RNDIS 的 IP 则为 `192.168.137.33`

同理, 当传入的 `--rndis-client-ip` 为 `0.0.22.33` 但上游 IP 段为 `192.168.137.1/16` 时, RNDIS 的 IP 则为 `192.168.22.33`

同时注意: 当上游 IP 段的子网掩码不是对齐 8 bit 时, 会将 RNDIS IP 设置为$\max{IP} - 2$, 例如上游 IP 段为 `192.168.137.1/29` 时, RNDIS IP 则为 `192.168.137.7` - 2 = `192.168.137.5`

当 **当子网掩码 >= `/30` 时, RNDIS 会强制回退到 RNDIS 主模式**以免 IP 无法分配导致无法访问 Wifi Stick


### Wifi Stick 修复基带驱动
按照 [提取或挂载 system 分区](#1-提取或挂载-system-分区) 或其他方法提取出 modem 分区, 并将分区内的文件全部内容复制至 Wifi Stick 的 `/lib/firmware`


例如 **在 Wifi Stick 上** 运行
```sh
sudo cp –v <mount>/image/modem* mba.* /lib/firmware
```

后重启 Wifi Stick

> [!TIP]
> 对于 9008 模式, 使用
> ```sh
> sudo edl r modem modem.img
> ```
> 即可提取 modem 分区

---

使用如下命令即可查看基带状态

```sh
sudo mmcli -m 0
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

### Systemd 与 screen 配合运作
一些游戏服务端需要接收 stdin 输入服务端命令, 但使用 Systemd 运行的 Service 不能交互式传入 stdin

为解决该问题, 我们可以使用 Systemd 运行 Screen

```sh
# start.sh
#!/bin/bash

set -e

SCREEN_NAME='name'
COMMAND='example-command-like java -jar server.jar'

# if [ -n "$INVOCATION_ID" ]; then
#     COMMAND="$COMMAND 2>&1 | tee >(systemd-cat -t '$SCREEN_NAME')"
# fi

screen -dmS "$SCREEN_NAME" /bin/bash -c "$COMMAND 2>&1"
```

```ini
# example.service
[Unit]
Description=Example
After=network.target

[Service]
Type=forking
WorkingDirectory=/path/to/workdir
ExecStart=/bin/bash start.sh

[Install]
WantedBy=multi-user.target
```

### 部分情况下在 Windows 上显示 RNDIS 设备但是代码 28
一些情况下, USB 可能因为缺少或存在无法识别/类型错误的 [Microsoft OS descriptors for USB devices](https://learn.microsoft.com/en-us/windows-hardware/drivers/usbcon/microsoft-defined-usb-descriptors) 导致显示设备异常 (如代码 28), 部分老旧的 Windows 甚至会在 [手动指定设备驱动](#连接-windows-设备) 后关闭对话框时重启 Windows, 导致在部分被设置有开机还原系统 (如冰点还原) 上使用不便

为解决此问题, 我们可以在指定驱动后不关闭 RNDIS 配置窗口, 知道需要关机或重启时直接进行电源操作

或是 **将 [接口模式切换工具](#配置-usb-接口模式) 更新至 `Commit: bee5ce4cfc6db21a42bb11dc6e1a8d0cb2a68b8c` ([commit](https://aka.lovemilk.top/github/wifi-stick-usb-switcher/commit/bee5ce4cfc6db21a42bb11dc6e1a8d0cb2a68b8c) | [release](https://aka.lovemilk.top/github/wifi-stick-usb-switcher/releases/tag/rolling-055c96e)) 或更新版本**

在这些版本中, 我们修改了 RNDIS USB Gadget 的供应商 ID 和产品 ID, 以便使 Windows 可以绕过 MS OS descriptors 检查直接 ~~非常高兴~~ 地认可我们的 RNDIS 设备

> [!TIP]
> 如果你想查看 USB 接口信息以便调试, 可以下载 [USB Viewer](https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/usbview)

<!-- ### 将 Wifi 设置为 Host 模式
部分情况下, 一些设备可能无法使用 USB 接口传输数据, 为了应对各种工况, 我们可以配置 Wifi Host 模式 (类似于 Wifi 热点) 并与 RNDIS 使用同一个 Host IP, 以便实现用户操作透明转换 (不需要手动修改 URL/IP 地址)

TODO -->

### Caddy 无法在 Windows 7 运行
> <https://github.com/caddyserver/caddy/issues/3076>

安装旧版本 (不高于 Caddy v2.7.0) 的 Caddy 即可

[v2.7.0 / caddyserver/caddy | GitHub Release](https://github.com/caddyserver/caddy/releases/tag/v2.7.0)

### Caddy 动态 TLS 签发名称质询服务
为了保证 Caddy 动态生成的 TLS 证书为合法的 Host, 我们需要配置 **TLS 签发名称质询服务**

一个简单的 Go 实现 *仅限私有 IP* 参见 [tools/caddy-tls-ask/main.go | wifi-stick-usb-switcher.go](https://aka.lovemilk.top/github/wifi-stick-usb-switcher/blob/main/tools/caddy-tls-ask/main.go)

```Caddyfile
{  # 全局配置
    on_demand_tls {
        ask http://127.0.0.1:50996/
    }
}
```

创建服务
```path
/etc/systemd/system/caddy-tls-ask.service
```

```ini
[Unit]
Description=caddy-tls-ask

[Service]
User=nobody
Group=nogroup
DynamicUser=yes

# filesystem readonly
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
PrivateDevices=yes
ProtectKernelTunables=yes
ProtectKernelModules=yes
ProtectControlGroups=yes

# no privileges
CapabilityBoundingSet=
NoNewPrivileges=yes
RestrictSUIDSGID=yes

# no namespace permission
RestrictRealtime=yes
LockPersonality=yes
MemoryDenyWriteExecute=yes

RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX

Type=fork
ExecStart=/path/to/caddy-tls-ask

[Install]
WantedBy=multi-user.target
```

重载并启用服务
```sh
sudo systemctl daemon-reload
sudo systemctl enable --now caddy-tls-ask.service
```

重载 Caddy 配置

```sh
sudo systemctl reload caddy.service
```
