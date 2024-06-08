> 为保证 VRChat 可以直连, 需将除 `file.vrchat.cloud` 的 `*.vrchat.com`, `*.vrchat.cloud` 直连, 否则可能因代理 IP 污染无法访问 VRChat.

在 `设置自定义规则（优先匹配）` 添加如下规则 (注意规则由上到下优先级)
```yaml
- DOMAIN-SUFFIX,file.vrchat.cloud,<Proxy>

# - DOMAIN-SUFFIX,vrchat.com,DIRECT  # 如果多次尝试连不上或者网页上不去再解除注释
- DOMAIN-SUFFIX,vrchat.cloud,DIRECT
```

> 注意: 请将 `<Proxy>` 替换为你的代理服务器规则组, 例如 `🌐 节点`
