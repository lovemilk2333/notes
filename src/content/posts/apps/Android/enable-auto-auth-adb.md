---
title: 在 Android 上启用 ADB 自动授权
published: 2025-12-20
tags: [Android, adb]
category: app::android
---

> <https://stackoverflow.com/questions/44817341/always-allow-adb-on-android>

## 背景
我的 Redmi K40 屏幕损坏了, 导致只能使用 Scrcpy 连接, 但是由于长时间不用导致 ADB 授权失效了

## 先决条件
1. 设备已解锁 Bootloader
2. 系统为 `userdebug` 或 `eng` 构建
3. 手机使用有线连接至电脑
4. 电脑中已安装并添加环境变量 Google 的 [Platform Tools](https://developer.android.com/tools/releases/platform-tools) (亦称 ADB)

## 操作
### 1. 刷入第三方 Recovery
为配置 ADB 自动授权, 需要使用 ADB Shell 覆写 `build.prop`  
BTW, 非 Android 的本机的 ADB 密钥对位于 `~/.android/` 下的 `adbkey` 与 `adbkey.pub` 文件  
`/data/misc/adb/adb_keys` 是 Android 上用于存储 ADB 认证公钥与本机密钥对的文件[^adb-keys-stored]

刷入第三方 Recovery 可以通过 ADB 连接至 ADB Shell, 并将 System 分区挂载为 rw

首先, 请进入 Fastboot

对于大多数设备  
(对于 Recovery 存储于 boot 分区的设备)
```sh
fastboot boot <image-path>
```

对于拥有独立 Recovery 分区的设备
```sh
fastboot flash recovery <image-path>
fastboot reboot recovery
```

> 注意 如下命令是进入 `fastbootd` 的, 而非 `fastboot`  
> ```sh
> fastboot reboot fastboot
> ```
> 要进入 `fastboot`, 请运行
> ```sh
> fastboot reboot bootloader
> ```

### 2. 覆写 `build.prop`
待设备进入 Recovery 后, 复写 `build.prop`

未经特殊说明, 如下命令均在 ADB Shell 中执行
```sh
adb shell
```

1. 查看分区表
```sh
cat /etc/fstab
```

2. 挂载 system 分区  
在上步骤的输出中找到 `/system_root` 字样, 并挂载改路径
```sh
mount -o rw /system_root
```

然后 `/system_root/system` 应该是可读写的 system 分区

3. 备份并修改 `build.prop`
```sh
cd /system_root/system
```

备份
```sh
cp ./build.prop ./build.prop.bak
```

修改  
找到 `ro.adb.secure=` 的选项, 并改为 `0`[^ro.adb.secure]  
(P.S. vi 也可以, 但是我不会用)
```sh
nano ./build.prop
```

4. 验证修改
```sh
cat ./build.prop | grep "ro.adb.secure=" 
```
若输出如下内容即为修改成功
```
ro.adb.secure=0
```

5. 解除挂载
```sh
cd /  # 不然会显示设备正在使用
umount /system_root
```

6. 重启
```sh
reboot
```

## 连接 ADB
> 如果您在开机时仍然遇到了 `unauthorized` 的 ADB 设备的情况, 请 [修改 Data 分区的 ADB 已授权的公钥](#修改-data-分区的-adb-已授权的公钥)

```sh
adb devices
```

恭喜🎉! 现在您可以使用 ADB 连接了!

## 修改 Data 分区的 ADB 已授权的公钥
### 1. 按照 [刷入第三方 Recovery](#1-刷入第三方-recovery) 方法进入 ADB Shell
但请注意: 该操作需要已经刷入的 Recovery, 而不能使用 `fastboot boot`

### 2. 添加授权公钥
> <https://xdaforums.com/t/how-to-decrypt-sdcard-from-adb.4262247/>

待设备进入 Recovery 后
```sh
adb shell
```
未经特殊说明, 如下命令均在 ADB Shell 中执行

1. 解密 data (OrangeFox 同样可以运行)
```sh
twrp decrypt <pin/password>
```

2. 写入 `/data/misc/adb/adb_keys`  
与 SSH 类似, 该文件是按行分割的公钥列表  
格式: `<Base64编码的RSA公钥数据> <用户名>@<主机名>`

(直接运行, 不在 ADB Shell 中)
```sh
adb push ~/.android/adbkey.pub /tmp/
```

(以下内容需要在 ADB Shell 中执行)
```sh
cat /tmp/adbkey.pub >> /data/misc/adb/adb_keys
```

3. 重启
```sh
reboot
```

[^adb-keys-stored]: <https://android.stackexchange.com/questions/171934/storage-location-of-adb-keys>
[^ro.adb.secure]: <https://android.stackexchange.com/questions/55674/how-can-i-enable-adbd-during-boot-on-cyanogenmod>
