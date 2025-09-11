---
title: 修复蓝牙设备(特别是音频设备)断链
published: 2025-09-10
tags: [Linux, Bluetooth, earphone, audio]
category: app::linux::system
---

> <https://www.linuxquestions.org/questions/linux-hardware-18/problem-with-any-bluetooth-device-4175631846>  
> <http://bugs.debian.org/cgi-bin/bugreport.cgi?bug=355497>

```ini
# Defaults for bluez
# start bluetooth on boot?
# compatibility note: If this variable is not found bluetooth will
# start
BLUETOOTH_ENABLED=1

# This setting will switch HID devices (e.g mouse/keyboad) to HCI mode, that is
# you will have bluetooth functionality from your dongle instead of only HID.
# Note that not every bluetooth dongle is capable of switching back to HID
# mode, see http://bugs.debian.org/cgi-bin/bugreport.cgi?bug=355497
HID2HCI_ENABLED=1
HID2HCI_UNDO=1
```

# 若仍然存在问题, 可在 `bluetooth.service` 中的 `[Unit]` 中的 `After=network-online.target`
