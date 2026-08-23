---
title: USB 硬盘盒查看 SMART 信息
published: 2026-08-23
tags: [Linux, filesystem, SMART, disk]
category: app::linux::system
---

USB 硬盘盒查看 SMART 信息

### 查看 USB 硬盘盒主控类型

```sh
lsusb
```

输出类似

```log
Bus 001 Device 007: ID 152d:f583 JMicron Technology Corp. / JMicron USA Technology Corp. JEYI JMS583 Storage
```

### 将主控型号传入 `smartctl`

```sh
sudo smartctl -d <type> -a <device> 
```

`type` 在示例输出的类型使用 `sntjmicron`, 其他情况请自行搜索主控对应的类型
