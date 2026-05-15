---
title: 在 Wifi Stick (随身 WIFI 棒子) 上配置 USB 即可 ADB 救急模式
published: 2026-05-15
tags: [Linux, Debian, USB, ADB]
category: deployment::WifiStick
---

为了避免 Wifi Stick 的 USB 接口在仅 RNDIS (网络共享) 时 SSH 连接无效, 造成丢失对设备的访问性和可控性, 我们可以配置接口的救急模式, 自动在该模式下配置 ADB 设备连接

<!-- ## 配置主板按钮作为触发器
目前, 我的方案是在配置 USB 接口时操控 LED 灯 (中的某个) 常亮, 在常亮期间按下 Wifi Stick 上按钮 >= 1s 代表进入 ADB 模式, 否则为默认的 RNDIS 模式

### [附录] 不同主板型号的设备按钮对应的 GPIO
> <https://www.kancloud.cn/handsomehacker/openstick/2636505#GPIO_17>
<table><thead><tr><th>型号</th><th>red led</th><th>green led</th><th>blue led</th><th>按键</th></tr></thead><tbody><tr><td>ufi001b/c</td><td>gpio22</td><td>gpio21</td><td>gpio20</td><td>gpio37</td></tr><tr><td>sp970</td><td>gpio9</td><td>gpio10</td><td>gpio28</td><td>gpio107</td></tr><tr><td>uz801</td><td>gpio7</td><td>gpio8</td><td>gpio6</td><td>gpio23</td></tr><tr><td>UFI-16-V3</td><td>gpio8</td><td>(pmic) gpio4</td><td>gpio32</td><td>gpio49</td></tr></tbody></table>

> 注意: 安装了 ufi001b/c 固件的 sp970 按钮的 GPIO 也为 37

### 使用 evtest 监听 Input Device
在我所使用的固件中, 按钮已经被识别为了一个 Input Device

使用如下命令找到按钮的 Input Device ID
```sh
cat /proc/bus/input/devices
```
输出类似于
```
I: Bus=0019 Vendor=0001 Product=0001 Version=0100
N: Name="GPIO Buttons"
P: Phys=gpio-keys/input0
S: Sysfs=/devices/platform/gpio-keys/input/input0
U: Uniq=
H: Handlers=event0 
B: PROP=0
B: EV=100003
B: KEY=1000000 0 0 0 0 0 0
```

那么这个设备就是
```path
/dev/input/event0
```
> `event0` 就是上方 `Handlers`

然后处理该 Device 的事件即可

> 由于我这边不知为何这个 Device 不会在按钮变化时触发事件, 所以我使用了下面的方案
 -->

## 配置基于特定时间重启的触发器
我们可以在配置 RNDIS 作为接口协议前等待一会儿, 并使用 LED 灯提示, 若在提示期间重启设备, 代表切换接口状态

### 新建重启检测脚本
```path
/usr/sbin/gadget-mode-selector
```
写入
```sh
#!/bin/sh
# /usr/sbin/gadget-mode-selector

MARKER_DIR="/var/lib/gadget"
REBOOT_MARKER="${MARKER_DIR}/switch_mode"
WAIT_SECONDS=3

# LED 路径
LED_RED="/sys/class/leds/red:os"
LED_GREEN="/sys/class/leds/green:internet"
LED_BLUE="/sys/class/leds/blue:wifi"

mkdir -p "$MARKER_DIR"

led_red_long() {
    echo none > ${LED_RED}/trigger 2>/dev/null
    led_red_on
}

led_green_long() {
    echo none > ${LED_GREEN}/trigger 2>/dev/null
    led_green_on
}

led_red_on()   { echo 255 > ${LED_RED}/brightness 2>/dev/null; }
led_red_off()  { echo 0   > ${LED_RED}/brightness 2>/dev/null; }
led_green_on() { echo 255 > ${LED_GREEN}/brightness 2>/dev/null; }
led_green_off(){ echo 0   > ${LED_GREEN}/brightness 2>/dev/null; }
led_blue_on()  { echo 255 > ${LED_BLUE}/brightness 2>/dev/null; }
led_blue_off() { echo 0   > ${LED_BLUE}/brightness 2>/dev/null; }

init_leds() {
    echo none > ${LED_RED}/trigger 2>/dev/null
    echo none > ${LED_GREEN}/trigger 2>/dev/null
    echo none > ${LED_BLUE}/trigger 2>/dev/null
    led_red_off
    led_green_off
    led_blue_off
}

output_status() {
    echo "STATUS: $1"
    echo "MESSAGE: $2"
    echo "---"
}

main() {
    init_leds

    # 检查重启标记
    if [ -f "$REBOOT_MARKER" ]; then
        rm -f "$REBOOT_MARKER"
        output_status "switching" "Reboot detected, switching to ADB mode"
        led_red_long
        exit 10
    fi

    output_status "waiting" "Waiting $WAIT_SECONDS seconds, reboot during blue slow blink to switch mode"

    # 红绿蓝快闪各一次（启动提示，不可切换）
    led_red_on;   sleep 0.2; led_red_off
    led_green_on; sleep 0.2; led_green_off
    led_blue_on;  sleep 0.2; led_blue_off

    touch "$REBOOT_MARKER"
    # 蓝灯慢闪（可切换窗口）
    for i in $(seq 1 $WAIT_SECONDS); do
        led_blue_on
        sleep 0.3
        led_blue_off
        sleep 0.7
        echo "WAIT: $i/$WAIT_SECONDS - Blue slow blink, reboot now to switch mode" >&2
    done
    rm -f "$REBOOT_MARKER"

    output_status "ready" "No switch requested, using RNDIS mode"
    led_green_long

    exit 0
}

main "$@"
```

然后授予可执行权限
```sh
chmod +x /usr/sbin/gadget-mode-selector
```

### 修改如下脚本

> [!IMPORTANT]
> 下方脚本文件过大, 如果使用 SSH 直接粘贴可能导致文件损坏, 请使用 SFTP 或其他可靠传输方式

> 该脚本由 Systemd Unit `mobian-usb-gadget.service` 自动调起
```path
/usr/sbin/mobian-usb-gadget
```
改为
```sh
#!/bin/sh
# /usr/sbin/mobian-usb-gadget

CONFIGFS="/sys/kernel/config/usb_gadget/g1"
MODE_SELECTOR="/usr/sbin/gadget-mode-selector"
FFS_MOUNT_POINT="/dev/usb-ffs/adb"

log() { echo "[$(date +%H:%M:%S)] $*"; }

cleanup() {
    log "Removing USB gadget..."

    if [ -d $CONFIGFS ]; then
        echo "" > $CONFIGFS/UDC 2>/dev/null
        rm -rf $CONFIGFS
    fi
}

setup_rndis() {
    log "Configuring RNDIS-ONLY mode..."

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
    echo "wifi-stick-miruku" > strings/0x409/serialnumber
    echo "wifi-stick" > strings/0x409/manufacturer
    echo "RNDIS Ethernet" > strings/0x409/product

    # ===== 配置 =====
    mkdir -p configs/c.1
    mkdir -p configs/c.1/strings/0x409
    echo "RNDIS" > configs/c.1/strings/0x409/configuration
    echo 120 > configs/c.1/MaxPower

    # ===== RNDIS =====
    mkdir -p functions/rndis.usb0

    # MAC 地址（建议固定）
    echo "02:12:34:56:78:9a" > functions/rndis.usb0/dev_addr
    echo "02:98:76:54:32:10" > functions/rndis.usb0/host_addr

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

    gc -e

    log "RNDIS gadget started"
}

setup_adb() {
    log "Configuring ADB-ONLY mode..."

    modprobe libcomposite

    # 1. 清理旧配置 (ConfigFS 必须先卸载 UDC 才能删除)
    if [ -d "$CONFIGFS" ]; then
        echo "" > "$CONFIGFS/UDC" 2>/dev/null
        # 递归清理 configs 下的链接，否则 rm -rf 可能会因 Busy 报错
        find "$CONFIGFS/configs" -maxdepth 2 -type l -delete 2>/dev/null
        rm -rf "$CONFIGFS"/* 2>/dev/null
    fi

    mkdir -p "$CONFIGFS"
    cd "$CONFIGFS" || exit 1

    # 2. 基础设备 ID 设置
    echo 0x18d1 > idVendor        # Google Inc.
    echo 0x4ee7 > idProduct       # Android ADB interface (Win7/10 识别关键)
    echo 0x0200 > bcdUSB          # 声明为 USB 2.0
    echo 0x00 > bDeviceClass
    echo 0x00 > bDeviceSubClass
    echo 0x00 > bDeviceProtocol

    # 3. 创建字符串描述符 (增强 Windows 兼容性，防止识别为未知设备)
    mkdir -p strings/0x409
    echo "wifi-stick-miruku" > strings/0x409/serialnumber
    echo "Google" > strings/0x409/manufacturer
    echo "ADB Gadget" > strings/0x409/product

    # 4. 初始化 FunctionFS
    # 假设你的 gc -a ffs 内部会执行 mkdir functions/ffs.adb
    gc -a ffs 
    
    # 确保配置目录存在 (FunctionFS 需要关联到某个 config)
    # 这一步如果 gc 没做，adbd 启动后无法 bind
    mkdir -p configs/c.1/strings/0x409
    echo "adb" > configs/c.1/strings/0x409/configuration
    ln -s functions/ffs.adb configs/c.1/ 2>/dev/null

    # 5. 挂载并启动 adbd
    mkdir -p /dev/usb-ffs/adb
    # 如果已经挂载则先卸载，防止 busy
    umount /dev/usb-ffs/adb 2>/dev/null
    mount -t functionfs adb /dev/usb-ffs/adb

    # 启动 adbd
    # -D 模式下 adbd 会等待 /dev/usb-ffs/adb 准备就绪
    killall adbd 2>/dev/null

    # 切换默认工作路径到 HOME
    cd ~

    adbd -D &
    
    # 关键等待：adbd 必须写入 ep0 后，UDC 才能 bind 成功
    sleep 1

    # 6. 绑定控制器
    UDC_NAME=$(ls /sys/class/udc | head -n 1)
    if [ -n "$UDC_NAME" ]; then
        echo "$UDC_NAME" > UDC
    else
        log "Error: No UDC found!"
        return 1
    fi

    gc -e

    log "ADB gadget started on $UDC_NAME"
}

status() {
    echo "========================================="
    echo "USB Gadget Status"
    echo "========================================="
    if [ -d "$CONFIGFS" ]; then
        echo "Gadget configured: YES"
        if [ -f "$CONFIGFS/UDC" ]; then
            cur=$(cat "$CONFIGFS/UDC" 2>/dev/null)
            [ -n "$cur" ] && echo "UDC active: $cur" || echo "UDC active: NO"
        fi
        [ -f "$CONFIGFS/strings/0x409/product" ] && echo "Product: $(cat "$CONFIGFS/strings/0x409/product" 2>/dev/null)"
    else
        echo "Gadget configured: NO"
    fi
    echo ""
    echo "ADB Status:"
    pgrep adbd >/dev/null 2>&1 && echo "  adbd running: YES" || echo "  adbd running: NO"
    echo ""
    echo "UDC Devices: $(ls /sys/class/udc/ 2>/dev/null | tr '\n' ' ')"
    echo "========================================="
}

case "${1:-}" in
    setup|start)
        cleanup
        if [ -f "$MODE_SELECTOR" ]; then
            $MODE_SELECTOR
            code=$?
            if [ "$code" = "10" ]; then
                setup_adb
            else
                setup_rndis
            fi
        else
            setup_rndis
        fi
        ;;
    reset|stop)
        cleanup
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: $0 {setup|start|reset|stop|status}"
        exit 1
        ;;
esac

exit
```

然后在 `.bashrc` 或 `.profile` 中
```path
~/.bashrc
```
增加如下行, 以美化 ADB Shell
```sh
export HOME='/root'
export TERM='xterm-256color'
export PS1='\[\e[32m\]\u@\h:\[\e[34m\]\w\[\e[0m\]\$ '
```

### 用法
| 时间段 | LED 状态 | 能否切换 | 操作方式 | 结果 |
|--------|---------|---------|---------|------|
| 0 - 0.6s | 红绿蓝快闪各一次 | ❌ | 启动提示，不可切换 | - |
| 0.6s - 3.6s | 蓝色慢闪 | ✅  | 在蓝色慢闪期间重启 | 切换模式至 ADB 模式直至重启 |
| > 3.6s | 常亮绿 | ❌ | - | 当前为 RNDIS 模式 |
| > 3.6s | 常亮红 | ❌ | - | 当前为 ADB 模式 |

<br>

要查看当前状态, 请使用
```sh
mobian-usb-gadget status
```
