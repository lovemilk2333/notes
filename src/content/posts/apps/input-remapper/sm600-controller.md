---
title: 使用 Input Remapper 将 凤凰模拟器 SM600 遥控器 的轴映射为 PS5 手柄操作方式
published: 2025-09-10
tags: [InputRemapper, Gamepad]
category: app::input-remapper
---

## 安装 Input Remapper
见 <https://github.com/sezanzeb/input-remapper?tab=readme-ov-file#installation>

 \
适用于 ArchLinux
```sh
yay -S input-remapper-git
sudo systemctl enable --now input-remapper
```

## 连接遥控器
将遥控器模式修改至 `PhoenixRC`, 打开开关 (若修改模式前已开启, 请关闭再打开)
::: tip 注
理论上修改为任意模式方可, 但不同模式的输入轴可能不同
:::

## 设置轴映射
1. 打开 Input Remapper, 在 `Device` 选项卡找到含有 `PhoenixRC Controller` 字样的设备, 单击

2. 在 `Presets` 选项卡选择 `new preset`, 或使用现有 preset

3. 在 `Editor` 选项卡的 Input 面板单击 `+ Add`, 后选中项 (默认已自动选中) 单击两次 `Record` (不知道为什么直接移动遥感没有用), 移动你想要映射的摇杆, 待添加的项名称自动更改, 再次单击 `Record` 停止监听

4. 选中项, 单击 `Advanced` 修改高级选项, 删除非目标轴, 并在界面右下角勾选 `Use as analog` 以使用轴 (线性) 输入. 如下为不同轴名称与物理操作以及 PS5 标准轴对应的表格 (我的遥控器是左侧遥感上下不会自动回中的美国手遥控器)

    | Joystick-RX | Trigger Left | Joystick-X | Joystick-Y |
    | :-: | :-: | :-: | :-: |
    | 左侧摇杆左右 | 左侧摇杆上下 | 右侧摇杆左右 | 右侧遥感上下 |
    | ABS_Z | ABS_Y | ABS_X | ABS_RX |

5. 在右侧 `Output` 面板中, 选择 `Analog Axis` 面板, `Target` 改为 `gamepad` (游戏手柄), 更改为对应轴即可 \
可以前往 <https://www.onlinemictest.com/zh/controller-tester/> 查看轴运动方向是否正确 \
<https://www.9slab.com/gamepad/home> 查看具体输入数值

6. 测试完成后, 在 `Rename` (`重命名`) 输入框内填入映射名称, 并单击右侧的保存按钮, 配置文件将被保存在 `~/.config/input-remapper-2/presets/<device>/<name>.json`. 其中, `<device>` 字样是你的设备名称, `<name>` 是你的映射名称

::: tip 注意
如果发现左侧摇杆向上移动至中心位置输入已达到 `1.0`, 请前往 `PhoenixRC` 航模模拟器进行校准

一个可能的下载链接 (第三方网站, 不保证安全性和可访问性, 后果自负): <https://www.flugsimulatoren.ch/Phoenix-RC.php>
:::

---

更多内容, 请参阅官方文档 <https://github.com/sezanzeb/input-remapper/blob/main/readme/usage.md>

## 一个可能的配置文件
可能含有设备配置项, 需要修改

如果需要导入, 请直接复制内容并在 `~/.config/input-remapper-2/presets/<device>/` 下新建任意合法名称的 `JSON` 文件. 其中, `<device>` 字样是你的设备名称, 如果设备名称文件夹没有被创建, 可以按照 步骤 2 新建并保存后, 再找到设备名称文件夹

::: details 单击展开配置文件
```json
[
    {
        "input_combination": [
            {
                "type": 3,
                "code": 2,
                "origin_hash": "3c827f8aaf14aed91058174eae560b57"
            }
        ],
        "target_uinput": "gamepad",
        "output_type": 3,
        "output_code": 1,
        "name": "left-y",
        "mapping_type": "analog",
        "deadzone": 0.0,
        "gain": -1.33,
        "expo": 0.15
    },
    {
        "input_combination": [
            {
                "type": 3,
                "code": 3,
                "origin_hash": "3c827f8aaf14aed91058174eae560b57"
            }
        ],
        "target_uinput": "gamepad",
        "output_type": 3,
        "output_code": 0,
        "name": "left-x",
        "mapping_type": "analog",
        "deadzone": 0.0,
        "gain": 1.11
    },
    {
        "input_combination": [
            {
                "type": 3,
                "code": 1,
                "origin_hash": "3c827f8aaf14aed91058174eae560b57"
            }
        ],
        "target_uinput": "gamepad",
        "output_type": 3,
        "output_code": 3,
        "name": "right-y",
        "mapping_type": "analog",
        "deadzone": 0.0,
        "gain": -1.27
    },
    {
        "input_combination": [
            {
                "type": 3,
                "code": 0,
                "origin_hash": "3c827f8aaf14aed91058174eae560b57"
            }
        ],
        "target_uinput": "gamepad",
        "output_type": 3,
        "output_code": 2,
        "name": "right-x",
        "mapping_type": "analog",
        "deadzone": 0.0,
        "gain": 1.06
    }
]
```
:::
