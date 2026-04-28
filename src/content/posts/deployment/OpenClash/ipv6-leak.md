---
title: 修复在代理不支持 IPv6 情况下访问需要代理的 IPv6 网站时泄露真实的客户端 IPv6
published: 2026-04-27
tags: [OpenWRT, proxy]
category: deployment::openclash
---

在代理不支持 IPv6 情况下访问需要代理的 IPv6 网站时, 部分可以直连的网站会获取到真实的客户端 IPv6, 在部分情况下可能导致被网站封禁

## 解决方案
尝试使用 Fake-IP 模式即可
