---
title: OpenClash 配置 VRChat 分流规则
published: 2025-09-10
tags: [OpenWRT, proxy]
category: deployment::openclash
---

> 为保证 VRChat 可以直连, 需将除 `files.vrchat.cloud` 的 `*.vrchat.com`, `*.vrchat.cloud` 直连, 否则可能因代理 IP 污染无法访问 VRChat.

在 `设置自定义规则（优先匹配）` 添加如下规则 (注意规则由上到下优先级)

```yaml
# 下面的是下载模型和地图的域名, 使用代理较快
- DOMAIN,files.vrchat.cloud,<Proxy>
- DOMAIN,file-variants.vrchat.cloud,<Proxy>
- DOMAIN,assets.vrchat.com,<Proxy>

# - DOMAIN-SUFFIX,vrchat.com,DIRECT  # 如果多次尝试连不上或者网页上不去再解除注释
- DOMAIN-SUFFIX,vrchat.cloud,DIRECT
```

> 注意: 请将 `<Proxy>` 替换为你的代理服务器规则组, 例如 `🌐 节点`

## Windows 侧异常处理

1.  Q: VRChat 登录失败, 显示 `Pleace make sure...`. <br>
    A: 依次尝试关闭 系统代理, 删除 DNS 缓存, 清除 SSL 状态 (最后者请前往 控制面板>网络和 Internet>Internet 选项>内容选项卡, 单击 证书 区域的 清除 SSL 状态(S) 即可) 后, 重新尝试登录, 若仍无效, 请重启 VRChat 客户端后重新登录再试. <br>
    仍然无效的, 请开启 加速器 后重试. (请开启加速器而非代理工具)
