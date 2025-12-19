---
title: JitsiMeet DOCKER 部署教程及初始配置
published: 2025-11-23
tags: [Docker, k8s, container, JitsiMeet]
category: deployment::JitsiMeet
---

最近在和同事(学)一起做项目, 需要在中国大陆可以快速访问的在线会议, 故搭建了 JitsiMeet

## 部署
> <https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-docker>
1. 找个文件夹下载发行文件
```sh
wget $(wget -q -O - https://api.github.com/repos/jitsi/docker-jitsi-meet/releases/latest | grep zip | cut -d\" -f4)
```

2. 解压下载的文件, 你会得到一个以 `jitsi-` 开头的文件夹, 里面会有个 `docker-compose.yml`
```sh
unzip <filename>
```

3. 创建 `.env` 配置
```sh
cp env.example .env
```

4. 生成 XMPP 密码 (自动写入 `.env`)
```sh
./gen-passwords.sh
```

5. 修改 `.env` 中 `CONFIG` 指向的路径, 作为配置文件根目录
```env
CONFIG=<path/to/config-root>
```

6. 创建配置文件夹
> `<path/to/config-root>` 为 `.env` 中 `CONFIG` 所指向的文件路径
```sh
mkdir -p <path/to/config-root>/{web,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb,jigasi,jibri}
```

7. 进行配置后, 方可启动
```sh
docker compose up -d
```

## 初始配置
1. 修改 `PUBLIC_URL` 为你的 URL 根
```env
PUBLIC_URL=https://meet.example.com:...
```

2. 修改页面端口
```env
HTTP_PORT=...
HTTPS_PORT=...

# 如果是反代用户, 需要禁用 HTTP 自动跳转 HTTPS
ENABLE_HTTP_REDIRECT=0
# 并禁用自动 TLS 证书申请
ENABLE_LETSENCRYPT=0
```

3. (可选)设置 JVB 端口
```env
JVB_PORT=...
```

4. 对于 NAT 或有防火墙下部署的用户, 需要修改 `JVB_ADVERTISE_IPS`
```env
JVB_ADVERTISE_IPS=<局域网IP/域名>,<公网IP/域名>
```

5. 禁用 `p2p` 连接以免用户 IP 泄漏和/或保证稳定性
```env
ENABLE_P2P=false
```

6. 配置 Auth
```env
# Enable authentication (will ask for login and password to join the meeting)
# 启用
ENABLE_AUTH=1

# Enable guest access (if authentication is enabled, this allows for users to be held in lobby until registered user lets them in)
# 对于已验证的用户开启的会议, 是否仍然需要验证才能加入, 开启访客后可直接加入, 但无法创建会议
ENABLE_GUESTS=1

# Select authentication type: internal, jwt, ldap or matrix
# Auth 类型, 默认 `internal` 即可
AUTH_TYPE=internal
```

7. 端口转发或开放端口
需要在你的 网关/路由 或 防火墙 内开放如下端口

| 环境变量 | 介绍 | 条件 |
| :-: | :- | :- |
| `HTTP_PORT` `HTTPS_PORT` | JitsiMeet 的主要 WebUI / TCP | 对于使用反代的用户, 配置反代即可, 无需开放 HTTPS |
| `JVB_PORT` | JVB (Jitsi Video Bridge) 端口, 不能 p2p 连接的都需要这个服务中转 / UDP | 未配置时请开放 `10000/udp` |

## See Also
在开启 Auth 的 JitsiMeet 上创建/删除 internal 用户
> <https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-docker#internal-authentication>

* *前置条件: 进入容器内部*
```sh
docker compose exec prosody /bin/bash
```

* 创建用户
> `<username>` 为用户名, `<password>` 为密码, 本人暂不清楚是否支持非 ASCII 字符, 谨慎使用
```sh
prosodyctl --config /config/prosody.cfg.lua register <username> meet.jitsi <password>
```
没有输出就创建成功了

* 删除用户
> `<username>` 为用户名
```sh
prosodyctl --config /config/prosody.cfg.lua unregister <username> meet.jitsi
```

* 要列出所有用户, 请使用
```sh
find /config/data/meet%2ejitsi/accounts -type f -exec basename {} .dat \;
```
