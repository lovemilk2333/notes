---
title: "使用 CC: Tweaked 读取 机械动力 应力网路 信息"
published: 2025-09-10
tags: [Minecraft, ComputerCraft, Create, pl:lua]
category: app::minecraft
---

## 前置模组
1. [Create](https://modrinth.com/mod/create)
2. [CC: Tweaked](https://modrinth.com/mod/cc-tweaked)
3. [NBT Peripheral (CC Addition)](https://www.curseforge.com/minecraft/mc-mods/nbt-peripheral)

## 步骤
1. 将 MC 原版侦测器的侦测面紧贴连接到机械动力应力网路的任意方块
2. 将 CC 的电脑置于侦测器边, 侦测器紧贴面的朝向记为 `face-to-observer`
3. 使用 CC 电脑的 外设 ABI `peripheral`:
```lua
-- https://tweaked.cc/module/peripheral.html#v:wrap
local observer = peripheral.wrap(<face-to-observer>)  -- 例如 peripheral.wrap("back")

local nbt = observer.read_nbt()
local createNetwork = nbt['Network']
```
`createNetwork` 即为 机械动力应力网路的信息 (Table 类型)

4. 通过 `createNetwork` 变量获取具体信息即可, 如下为各 key 的意义:
```lua
{
    Capacity: float,  -- 总应力
    Stress: float, -- 已用应力
    Id: number,  -- 网络 ID (定义未知)
    Size: int, -- 网络大小 (定义未知)
}
```

当 `Stress > Capacity` 时, 应力过载
