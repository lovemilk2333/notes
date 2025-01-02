# (x)Wayland + KDE 桌面环境下使用命令行唤醒屏幕

## 描述
sunshine 串流软件在显示器关闭情况下无法连接, 会发生 `503` 错误

## 解决
如下指令可以使显示器在熄屏(睡眠和休眠未经测试)状态下亮屏
```sh
kscreen-doctor --dpms on
```
> 该操作需要在桌面环境的会话运行, SSH 无法使用  
> 我目前使用一个仅监听 `127.0.0.1` 的服务, 该服务由 KDE 自启动, 然后在 SSH `curl` 指定的 endpoint, 在服务内部运行上述指令

## See Also
[自定义显示器分辨率和/或刷新率](../Display/custom-edid.md)
