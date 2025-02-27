# 安装 Waydroid

## 步骤参见:
<https://github.com/casualsnek/waydroid_script>

## 修复网络
<https://github.com/waydroid/waydroid/issues/143#issuecomment-1520857943>

(解释) 运行如下脚本
```sh
sudo sed -i~ -E 's/=.\$\(command -v (nft|ip6?tables-legacy).*/=/g' \
     /usr/lib/waydroid/data/scripts/waydroid-net.sh
```
## 运行 `waydroid prop set <key> <value>` 失败
手动编辑 `/var/lib/waydroid/waydroid_base.prop`

## 使用 NVIDIA 显卡
:::warning 警告
修改后如果出现:
```log
❯ waydroid show-full-ui
[17:41:23] Failed to get service waydroidplatform, trying again...
[17:41:24] Failed to get service waydroidplatform, trying again...
[17:41:25] Failed to get service waydroidplatform, trying again...
[17:41:26] Failed to get service waydroidplatform, trying again...
[17:41:27] Failed to get service waydroidplatform, trying again...
```
请恢复修改的属性至默认值 (禁用 NVIDIA 加速)
:::

<https://github.com/waydroid/waydroid/issues/278#issuecomment-1015633023>

> 注意: 不要直接修改, 请先将默认值备份

## 无法登陆 Google 账户
前往如下网站填入 `Google服务框架 Android ID` (使用 `waydroid_script` 可以获取)
<https://www.google.com/android/uncertified/?pli=1>

## 共享剪切板
<https://github.com/waydroid/waydroid/issues/1113#issuecomment-2468967358>  
<https://github.com/waydroid/waydroid/issues/1113#issuecomment-2513210548>
