# 修复 Flameshot 跨屏 UI 问题

## 描述
默认情况下, `flameshot gui` 命令会将多个显示器拼接后的画面缩小并渲染在主显示器上

## 解决
设置环境变量 `QT_QPA_PLATFORM=xcb`, 或以如下方式运行 Flameshot:
```sh
env QT_QPA_PLATFORM=xcb flameshot gui
```
