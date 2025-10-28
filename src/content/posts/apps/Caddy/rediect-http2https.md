---
title: Caddy | 从非标的 HTTP 重定向到同端口的 HTTPS
published: 2025-10-28
tags: [Caddy, ReversedProxy]
category: app::caddy
---

## 起因

我需要在非 80/443 上运行 HTTPS 服务, 但是 Caddy 会给出 `Client sent an HTTP request to an HTTPS server` 的错误 (实际上是 go 的 `net` 包导致的), 而我搜索许久没有找到方法

## 解决

我在今天修复 TLS 证书续期问题时, 我找到了这篇帖子中的解决方法 [Caddy v2 - redirect non-SSL HTTP traffic to HTTPS on same (non-standard) port - Help - Caddy Community](https://caddy.community/t/caddy-v2-redirect-non-ssl-http-traffic-to-https-on-same-non-standard-port/9089/11), 以及官方文档中的 [使用方法](https://caddyserver.com/docs/caddyfile/options#http-redirect)

```Caddyfile
{
    // 全局配置
    servers {
		listener_wrappers {
			http_redirect  // 自动重定向的 wrapper
			tls  // 保留以保证 TLS 正常
		}
	}
}
```
