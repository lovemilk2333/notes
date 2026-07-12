---
title: 适用于 Pipewire 音频服务的低延迟网路音频传输至 Android 手机
published: 2026-07-12
tags: [Android, audio, roc]
category: app::pipewire-roc
---

为了减少耳机在电脑与手机间来回切换造成的麻烦, 我们可以配置 ROC (Real-time audio streaming over the network) Pipewire 模块或单独的 CLI 工具, 向 Receiver 推送音频

[Roc for Android!](https://github.com/roc-streaming/roc-droid) 是一个 Android 应用, 其封装了 ROC 的 library, 以便用户可以在 Android 上使用 UI 配置 ROC

[pipewire-roc](https://archlinux.org/packages/extra/x86_64/pipewire-roc/) 是 ROC 的 Pipewire 模块, 可以作为 Sender 或 Receiver

## 概念
Sender: 音频产生侧, 将产生的音频推送至接受侧
Receiver: 播放音频侧, 将被推送的音频播放

## 若要将 PC 作为 Sender
### Sender 安装
1. 安装模块
    ```sh
    sudo pacman -S pipewire-roc
    ```

2. 配置音频输出设备
    在如下路径内创建任意名称的 `.conf` 文件
    ```path
    ~/.config/pipewire/pipewire.conf.d/
    ```
    并写入
    ```conf
    context.modules = [
        {   name = libpipewire-module-roc-sink
            args = {
                fec.code = rs8m
                remote.ip = <receiver-ip>
                remote.source.port = 10001
                remote.repair.port = 10002
                remote.control.port = 10003
                sink.name = "ROC-Phone-Sink"
                sink.props = {
                    node.name = "roc-phone-sink"
                    node.description = "Roc Phone Sink"
                }
            }
        }
    ]
    ```

3. 重启服务以加载配置
    ```sh
    systemctl --user restart pipewire wireplumber
    ```

4. 在需要时切换音频设备到 `Roc Phone Sink`

### Receiver 安装
1. 下载 [Roc for Android!](https://github.com/roc-streaming/roc-droid/releases/latest) 并安装

2. 打开应用并在必要时将 "耗电行为控制" 改为 "无限制"

3. 选择 "Receiver" 面板, 将 Sender 配置的 `<receiver-ip>` 修改为显示的 IP 地址并重启服务, 并单击 "START RECEIVER" 即可

## 若要将 PC 作为 Receiver
### Receiver 安装
1. 安装模块
    ```sh
    sudo pacman -S pipewire-roc
    ```

2. 配置音频输入设备
    在如下路径内创建任意名称的 `.conf` 文件
    ```path
    ~/.config/pipewire/pipewire.conf.d/
    ```
    并写入
    ```conf
    context.modules = [
        {   name = libpipewire-module-roc-source
            args = {
                fec.code = rs8m
                local.ip = 0.0.0.0
                local.source.port = 10001
                local.repair.port = 10002
                local.control.port = 10003
                source.name = "ROC-Phone-Source"
                source.props = {
                    node.name = "roc-phone-source"
                    node.description = "Roc Phone Source"
                    media.class = "Audio/Source"
                    audio.position = [ FL FR ]
                }
            }
        }
    ]
    ```

3. 重启服务以加载配置
    ```sh
    systemctl --user restart pipewire wireplumber
    ```

### Sender 安装
1. 下载 [Roc for Android!](https://github.com/roc-streaming/roc-droid/releases/latest) 并安装

2. 打开应用并在必要时将 "耗电行为控制" 改为 "无限制"

3. 选择 "Sender" 面板, 修改 IP 地址为 PC IP 地址, 并选择 "Currently playing apps" 或 "Microphone" 作为输入源, 并单击 "START SENDER" 即可
