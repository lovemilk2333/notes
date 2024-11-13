# 获取音频设备 (`audio-info.exe` 无法获取所有音频设备时)

## 问题描述
参见 <https://github.com/LizardByte/Sunshine/issues/1599>

## 解决方案
```powershell
Get-PnpDevice -Class AudioEndpoint | Select-Object InstanceId, FriendlyName
```
> 必要时请以管理员身份运行 PowerShell
