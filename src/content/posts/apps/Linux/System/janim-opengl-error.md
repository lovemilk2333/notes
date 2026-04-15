---
title: 修复因 NVIDIA 驱动兼容性问题造成 (包括但不限于) Janim 编辑器调用 QT OpenGL 接口时崩溃
published: 2025-10-31
tags: [Linux, NVIDIA, GPU]
category: app::linux::system
---

要修复该问题, 使用环境变量指定使用 Mesa 的 Zink, 将 OpenGL 转译为 Vulkan 运行

```sh
env \
  __GLX_VENDOR_LIBRARY_NAME=mesa \
  __EGL_VENDOR_LIBRARY_FILENAMES=/usr/share/glvnd/egl_vendor.d/50_mesa.json \
  MESA_LOADER_DRIVER_OVERRIDE=zink \
  GALLIUM_DRIVER=zink \
  LIBGL_KOPPER_DRI2=1 \
  janim "$@"  # 本行可以是任意想要执行的命令
```

> [!IMPORTANT]
> 切勿将环境变量设至 `/etc/environment` 以免无法打开 DE
