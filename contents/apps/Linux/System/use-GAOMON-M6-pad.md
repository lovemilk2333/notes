# 在 ArchLinux 上使用 高漫 M6 数位板
> 参考 [在 ArchLinux 上完美使用高漫 M6 数位板 - Eslzzyl - 博客园](https://www.cnblogs.com/eslzzyl/p/18166553)

## 步骤
1. 安装 `dkms` 和 `linux-headers` 包
    ```sh
    sudo pacman -S dkms linux-headers
    ```

2. 克隆 `digimend-kernel-drivers` 仓库
    该仓库提供了数位板的驱动
    ::: tip 提示
    虽然参考的文章说需要修改几个文件, 但是本文撰写时的 20250104 (commit `f3c7c7f`) 已内置需要修改的内容, 直接构建安装即可
    :::
    ```sh
    git clone git@github.com:DIGImend/digimend-kernel-drivers.git
    cd digimend-kernel-drivers
    ```

3. 编译安装 `digimend` 驱动
    ```sh
    sudo make dkms_install
    ```
    ::: warning 警告
    如果安装过 `digimend` 驱动, 须先行卸载:
    ```sh
    sudo make dkms_uninstall
    ```
    :::

4. 重启系统


## 扩展
一些推荐的软件
| 名称 | 介绍 |　URL |
| :-: | :- | :-: |
| Xournal++ | 一款笔记软件 | <https://xournalpp.github.io/> |
| Krita | KDE 旗下的一款自由开源且免费的专业绘画软件 | <https://krita.org/> |
| Input Remapper | 适用于 Linux 的按键隐射, 输入设备行为修改软件 | <https://github.com/sezanzeb/input-remapper> |
