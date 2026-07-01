---
title: 自托管堡垒机解决方案 | Teleport
published: 2026-06-30
tags: [Linux, Debian, Teleport]
category: deployment::Teleport
---

最近, libssh2 爆出了 9.8 分 [CVE-2026-55200](https://nvd.nist.gov/vuln/detail/CVE-2026-55200), 将 SSH 端口暴露至公开网路已经变得不再安全

为了更为安全的管理和访问服务器, 可以使用 Teleport 堡垒机解决方案

堡垒机是一种用于统一鉴权并转发请求到真实服务器的服务, 部分堡垒机服务无需在服务端开启端口, 有着更高的安全性

*Teleport is an identity-based access platform that secures servers, Kubernetes clusters, databases, internal applications, and desktops using short-lived certificates, detailed audit logging, and fine-grained role-based access controls tied to your SSO provider (e.g., Okta, GitHub, Google Workspace).*[^teleport-intro]

## 部署
> <https://goteleport.com/docs/get-started/deploy-community/>

### 安装 Teleport
在你想要作为请求转发服务器的服务器上运行如下脚本

```sh
curl https://goteleport.com/static/install.sh | bash -s <version>
```
例如
```sh
curl https://cdn.teleport.dev/install.sh | bash -s 18.9.2
```

### 配置或生成 TLS 证书
对于域名有所有权且 443 端口可以访问的设备, 可以使用
```sh
sudo teleport configure -o file \
    --acme --acme-email=<email> \
    --cluster-name=<domain>
```

对于已有 TLS 证书的用户, 可以将证书复制至 `/var/lib/teleport/fullchain.pem` 和 `/var/lib/teleport/privkey.pem`, 并使用
```sh
sudo teleport configure -o file \
    --cluster-name=<domain> \
    --public-addr=<domain:port> \
    --cert-file=/var/lib/teleport/fullchain.pem \
    --key-file=/var/lib/teleport/privkey.pem
```

> 要使用 openssl 自签名证书, 请使用
> ```ini
> # teleport-ext.cnf
> [req]
> distinguished_name = req_distinguished_name
> x509_extensions = v3_req
> prompt = no
> 
> [req_distinguished_name]
> C = GS
> ST = Genshin Impact
> L = Teyvat
> O = Miruku Teleport Lab
> CN = <domain>
> 
> [v3_req]
> keyUsage = critical, digitalSignature, keyEncipherment
> extendedKeyUsage = serverAuth, clientAuth
> subjectAltName = @alt_names
> 
> [alt_names]
> DNS.1 = <domain>
> ```
> 
> 
> ```sh
> sudo openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
> -keyout /var/lib/teleport/privkey.pem \
> -out /var/lib/teleport/fullchain.pem \
> -config teleport-ext.cnf
> ```

### 开启 Systemd 服务
```sh
sudo systemctl enable --now teleport
```
如果使用 `--public-addr=<domain:port>` 开启的服务, 则启动于 `0.0.0.0:port` 上, 否则请查看 `/etc/teleport.yaml` 中 `proxy_service.web_listen_addr`

同时, 如果服务器位于 NAT 后, `:3025` 为默认鉴权端口, 请开启端口以保证 `domain:3025` 可以被访问

## 使用
### 创建用户
在运行有 Teleport 设备上运行如下命令, 以创建 admin 用户

如下示例中, admin 可以管理集群 (administrative), 连接到任何 Teleport 功能保护的资源, 查看审计事件和会话记录, 并支持使用 root 或 ubuntu *Linux 用户* 登录集群中的设备

```sh
sudo tctl users add admin --roles=editor,access,auditor --logins=root,ubuntu
```

打开命令输出的连接
```txt
User "admin" has been created but requires a password. Share this URL with the user to complete user setup, link is valid for 1h:
https://<domain>:<port>/web/invite/<id>
```
即可初始化用户密码

### 添加 Node
> <https://goteleport.com/docs/get-started/connect/>
为了使现有服务器可以连接到 Teleport, 我们需要在服务器上配置 Teleport Agent

在 WebUI 中选择 *Add New > Resource*, 按照流程添加即可

> [!NOTE]
> 为了避免 Node 添加状态出现问题, 在进入添加流程至至成功前, 请不要刷新页面, 也不要在同一服务器重复运行 Agent 安装程序

> 要删除 Node, 请使用
> ```sh
> tctl rm node/<uuid>
> ```

### 客户端 CLI 工具
> <https://goteleport.com/docs/connect-your-client/teleport-clients/tsh/>

tsh 是 Teleport 的 CLI 连接与鉴权工具

使用如下命令获取服务端版本
```sh
curl https://<domain>[:<port> | '443']/webapi/find | jq '.server_version'
```

使用如下命令安装
```sh
curl -O https://cdn.teleport.dev/teleport-v<version>-linux-amd64-bin.tar.gz
tar -xzf teleport-v<version>-linux-amd64-bin.tar.gz
cd teleport
sudo ./install
```

使用如下命令登录 Teleport
```sh
tsh login --proxy=<domain>[:<port> | '443'] [--user=<user>]
```
> 登出
> ```sh
> tsh logout
> ```

查看可用 Node
```sh
tsh ls
```

登录成功后, 使用如下命令可以连接到 Node
```sh
tsh ssh [<user>@]<node>
```

## 备份 Teleport
为了避免单点故障造成数据丢失, 我们需要对 Teleport 数据进行备份

`/etc/teleport.yaml` 配置文件是自动生成的, 所以备份它是可选的

参考 [官方文档内的备份与恢复](https://goteleport.com/docs/zero-trust-access/management/backup-restore/) 章节, 对于使用本文方法部署的自托管 Teleport, 仅需备份 `/var/lib/teleport/` 文件夹即可

[^teleport-intro]: <https://goteleport.com/docs/get-started/>
