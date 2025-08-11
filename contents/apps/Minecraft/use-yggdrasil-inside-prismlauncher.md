# 在 Prism Launcher 上使用 Yggdrasil 外置登录
> 参考 [mmcai_rs/README_zh.md at master · YaoerWu/mmcai_rs](https://github.com/YaoerWu/mmcai_rs/blob/master/README_zh.md)

## 步骤
1. 克隆 `mmcai_rs` 的 `YaoerWu` fork 版本  
    > 由于 `mmcai_rs` 的原版 `CatMe0w/mmcai_rs` 尚未更新和合并 PR, 导致其实现的 Yggdrasil 规范没有更新, 造成无法登录 (无论如何显示 `Error: Wrong username or password`), 所以必须使用这个 fork 版本 (或者你也可以等作者合并 PR?)
    ```sh
    git clone git@github.com:YaoerWu/mmcai_rs.git

    cd mmcai_rs
    ```

2. 构建可执行文件  
    关于如何安装 rust 编译环境 (cargo), 请参阅 [Getting started - Rust Programming Language](https://www.rust-lang.org/learn/get-started)
    ```sh
    cargo build --release
    ```
    构建成功后, 可执行文件应当位于 `./target/release/mmcai_rs` 或 `./target/release/mmcai_rs.exe`, 将其移动至一个固定的位置 (后称 `/path/to/mmcai_rs`)
    ```sh
    cp ./target/release/mmcai_rs /path/to/mmcai_rs
    ```

3. 在 `/path/to/mmcai_rs` 的同级目录下放置 `authlib-injector`  
    从 [这里](https://github.com/yushijinhun/authlib-injector/releases/latest) 下载最新版的 `authlib-injector-\d.\d.\d.jar` (`\d` 代表任意整数), 直接放置于 `/path/to/mmcai_rs` 的同级目录, **不要重命名文件**

4. 编辑 MC 实例配置  
    打开 Prism Launcher/MultiMC编辑实例, 进入 `设置 > 自定义命令`, 在 `包装器命令` 中填入如下内容:
    ```sh
    /path/to/mmcai_rs <username> <password> <yggdrasil_api_endpoint>
    ```
    其中, `<username>` 是你的外置登录账户名, `<password>` 是你的外置登录密码, `<yggdrasil_api_endpoint>` 是你的 Yggdrasil API 地址  
    ::: danger 危险
    由于会提供账户和密码给该可执行文件, 本人无法确保起不会造成隐私泄露, 在使用前请再三甄别, 否则造成的后果由用户承担
    :::

    ::: tip 提示
    LittleSkin 用户的账户名 是 登录时填写的邮箱地址, 而不是角色名称  

    填写该命令后, 启动器内设置的账户将无法应用于该实例, 如果需要使用启动器内置的账户, 请删除该配置
    :::
    例如:
    ```sh
    /path/to/mmcai_rs user passwd https://littleskin.cn/api/yggdrasil
    ```

5. 启动实例方可
