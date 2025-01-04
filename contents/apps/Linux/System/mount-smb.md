# ArchLinux 挂载 smb 存储

## 描述
`cp` 命令不支持 `smb://` 的路径, 需要先挂载到本地再复制

## 解决
将 samba 云存储挂载至本地

1. 安装依赖
    ````sh
    sudo pacman -S smbclient cifs-utils
    ````

2. 挂载 samba 至指定文件夹
    ```sh
    sudo mount -t cifs //<host>/<path> /path/to/mount-point -o username=<username>,password=<password>
    ```
    其中,  
    `//<host>/<path>` 为目标云存储的路径, 如 `//192.168.1.1/sda1` 或 `//your_host/sda1`  
    `/path/to/mount-point` 为目标挂载点, 即在本机的路径, 如 `/mnt/smb/your_host/sda1` (需要预先创建)
    `-o` 后为挂载选项, 由于大部分的 samba 需要 auth, 则 `<username>` 为你的 samba 用户, `<password>` 同理为密码

    :::tip 提示
    解除挂载请使用
    ```sh
    sudo umount /path/to/mount-point
    ```
    :::
