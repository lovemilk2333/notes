# 使用 udev 规则允许访问 HID 设备 (以使用 Web 键盘驱动)

在 `/etc/udev/rules.d/` 创建一个 `.rules` 文件, 文件名称合法即可
> 一般为 `dd-描述.rules`, `dd` 是一个两位十进制数, 数字越大越在靠后的时刻加载

```conf
SUBSYSTEM=="hidraw*", ATTRS{idVendor}=="<vendor-id>", ATTRS{idProduct}=="<product-id>", MODE="0666", GROUP="<user-group>"
```
`<vendor-id>` 与 `<product-id>` 可以使用 `lsusb` 查看:

```log
❯ lsusb
Bus 001 Device 003: ID <vendor-id>:<product-id> XXXXXXX
```

`<user-group>` 是你所在的用户组, 或者是你想要授权的组名
